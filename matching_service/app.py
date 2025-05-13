"""
matching_service.py  –  Kafka‑based ride‑matching với retry ổn định
"""

import json, time, math
from datetime import datetime, timezone
from confluent_kafka import Consumer, Producer, TopicPartition

from stable_matching import build_preferences, gale_shapley
from redis_client     import get_drivers_by_geohash, lock_driver, get_matching_algorithm

# --------------------------------------------------------------------------- #
# CONFIG
# --------------------------------------------------------------------------- #
BOOTSTRAP   = "kafka:9092"
TOPIC_REQ   = "ride-matching-requests"
TOPIC_RETRY = "ride-matching-retries"
TOPIC_RES   = "ride-matching-results"
TOPIC_FAIL  = "ride-matching-failed"

BATCH_SEC = 5
MAX_RETRY = 3
MAX_WAIT  = 100      # tổng thời gian chờ (giây)


def backoff_delay(n: int) -> int:
    return BATCH_SEC * 2 ** (n - 1)      # 5,10,20,40…


# --------------------------------------------------------------------------- #
# KAFKA CLIENTS
# --------------------------------------------------------------------------- #
producer = Producer({"bootstrap.servers": BOOTSTRAP})

consumer_conf = {
    "bootstrap.servers": BOOTSTRAP,
    "group.id": "matching-group",
    "auto.offset.reset": "earliest",
    "enable.auto.commit": False,
}
consumer = Consumer(consumer_conf)
consumer.subscribe([TOPIC_REQ, TOPIC_RETRY])

print("🚀 Matching service listening on", TOPIC_REQ, "and", TOPIC_RETRY)

# --------------------------------------------------------------------------- #
# TIỆN ÍCH
# --------------------------------------------------------------------------- #
now_epoch = time.time

def iso(ts: float) -> str:
    return datetime.fromtimestamp(ts, tz=timezone.utc).isoformat()


# --------------------------------------------------------------------------- #
# MAIN LOOP
# --------------------------------------------------------------------------- #
def run() -> None:
    buffer_by_gh: dict[str, list[tuple[dict, dict, "Message"]]] = {}
    last_flush = now_epoch()

    try:
        while True:
            msg = consumer.poll(0.2)
            t_now = now_epoch()

            if msg and not msg.error():
                payload = json.loads(msg.value())
                headers = {k: v.decode() for k, v in msg.headers() or []}

                due_ts = float(headers.get("next_retry_ts", 0))
                if t_now < due_ts:                           # chưa tới hạn
                    # 👉 Giữ message lại bằng cách seek về chính nó
                    tp = TopicPartition(msg.topic(), msg.partition(), msg.offset())
                    consumer.seek(tp)
                    # ngủ ít để tránh busy‑loop
                    time.sleep(min(due_ts - t_now, 1.0))
                    continue

                gh = payload["geohash"]
                buffer_by_gh.setdefault(gh, []).append((payload, headers, msg))
                print("📥 buffered", payload)

            # flush mỗi BATCH_SEC
            if t_now - last_flush >= BATCH_SEC:
                flush_buffer(buffer_by_gh)
                buffer_by_gh.clear()
                last_flush = t_now
    except KeyboardInterrupt:
        pass
    finally:
        consumer.close()


# --------------------------------------------------------------------------- #
# FLUSH & MATCH
# --------------------------------------------------------------------------- #
def flush_buffer(buf: dict) -> None:
    for gh, items in buf.items():
        if not items:
            continue

        riders   = [p for p, _, _ in items]
        drivers  = get_drivers_by_geohash(gh)

        if not drivers:
            print(f"⚠️  No drivers in {gh}")
            for p, h, m in items:
                schedule_retry(p, h, m, "no_driver")
            continue

        prefs_r, prefs_d = build_preferences(
            [{"id": r["rider_id"], "lat": r["lat"], "lng": r["lng"]} for r in riders],
            drivers,
        )
        algo = get_matching_algorithm()
        print(f"🔧 Using algorithm: {algo}")

        if algo == "gale_shapley":
                matches = gale_shapley(
                [r["rider_id"] for r in riders],
                [d["id"] for d in drivers],
                prefs_r,
                prefs_d,
            )
        else:
            print(f"⚠️ Unknown algorithm '{algo}', fallback to gale_shapley")
            matches = gale_shapley(
                [r["rider_id"] for r in riders],
                [d["id"] for d in drivers],
                prefs_r,
                prefs_d,
            )

        for payload, hdr, raw_msg in items:
            rider_id = payload["rider_id"]
            req_id   = payload["ride_request_id"]
            drv_id   = matches.get(rider_id)

            if not drv_id:
                schedule_retry(payload, hdr, raw_msg, "unmatched")
                continue

            if not lock_driver(drv_id):
                schedule_retry(payload, hdr, raw_msg, "driver_locked")
                continue

            # ✅ match thành công
            result = {
                "ride_request_id": req_id,
                "rider_id": rider_id,
                "driver_id": drv_id,
                "matched_at": iso(now_epoch()),
            }
            producer.produce(TOPIC_RES, key=req_id, value=json.dumps(result))
            consumer.commit(message=raw_msg, asynchronous=False)
            print("✅ produced result", result)

    producer.flush()


# --------------------------------------------------------------------------- #
# RETRY / TIMEOUT
# --------------------------------------------------------------------------- #
def schedule_retry(payload: dict, hdr: dict, raw_msg, reason: str) -> None:
    first_ts  = float(hdr.get("first_ts", now_epoch()))
    retry_cnt = int(hdr.get("retry_count", "0")) + 1
    elapsed   = now_epoch() - first_ts

    if retry_cnt > MAX_RETRY or elapsed >= MAX_WAIT:
        fail_msg = {
            **payload,
            "retry_count": retry_cnt,
            "failed_reason": reason,
            "elapsed_seconds": elapsed,
            "failed_at": iso(now_epoch()),
        }
        producer.produce(TOPIC_FAIL, key=payload["ride_request_id"],
                         value=json.dumps(fail_msg))
        consumer.commit(message=raw_msg, asynchronous=False)
        print("⏱️  FAILED =>", fail_msg)
        return

    delay   = backoff_delay(retry_cnt)
    next_ts = now_epoch() + delay

    headers = [
        ("first_ts",      str(first_ts).encode()),
        ("retry_count",   str(retry_cnt).encode()),
        ("next_retry_ts", str(next_ts).encode()),
    ]
    producer.produce(
        TOPIC_RETRY,
        key=payload["ride_request_id"],
        value=json.dumps(payload),
        headers=headers,
    )
    consumer.commit(message=raw_msg, asynchronous=False)
    print(f"🔄 SCHEDULE RETRY #{retry_cnt} in {delay}s -> {payload['ride_request_id']} ({reason})")


# --------------------------------------------------------------------------- #
# ENTRY
# --------------------------------------------------------------------------- #
if __name__ == "__main__":
    print("🔥 Matching service started with Kafka‑based retries (seek‑on‑hold)")
    run()
