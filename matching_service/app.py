"""
matching_service.py  –  Kafka‑based ride‑matching với retry ổn định (batch poll, model hóa)
"""

import json, time, math, traceback
from dataclasses import dataclass
from typing import Any, Optional, Dict, List
from datetime import datetime, timezone
from confluent_kafka import Consumer, Producer, TopicPartition

from algorithms.stable_matching import build_preferences, gale_shapley
from algorithms.hungarian import hungarian_matching

from queue_helper import _update_arrival_stats, _should_flush, _update_service_stats
from models.driver import Driver
from models.ride_matching_request import RideMatchingRequest
from redis_client import get_drivers_by_geohash, lock_driver, get_matching_config


# Hàm chuyển dict sang model
def parse_request(payload: dict) -> RideMatchingRequest:
    return RideMatchingRequest(
        ride_id=str(payload["ride_id"]),
        rider_id=int(payload["rider_id"]),
        geohash=payload["geohash"],
        lat=float(payload["lat"]),
        lng=float(payload["lng"]),
        ride_type=payload.get("ride_type", ""),
        fare=payload.get("fare"),
        requested_at=payload.get("requested_at", ""),
    )

def parse_driver(d: dict) -> Driver:
    return Driver(
        id=int(d["id"]),
        lat=float(d["lat"]),
        lng=float(d["lng"]),
        rating=float(d.get("rating", 1.0)),
    )

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
BATCH_SIZE = 50      # số lượng message tối đa mỗi lần poll

# ------------- Back-off với β* tối ưu & giới hạn 100 s ------------- #
BETA = 2.28              # 1 + sqrt(1+p)  với  p≈0.65
def backoff_delay(n: int) -> float:
    """Delay cho lần retry thứ n  (n bắt đầu =1)."""
    return BATCH_SEC * (BETA ** (n - 1))


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

def safe_decode_header(headers):
    result = {}
    for k, v in (headers or []):
        try:
            result[k] = v.decode() if v else ""
        except Exception:
            result[k] = ""
    return result

# --------------------------------------------------------------------------- #
# MAIN LOOP
# --------------------------------------------------------------------------- #
def run() -> None:
    buffer_by_gh: Dict[str, List[tuple[RideMatchingRequest, dict, "Message"]]] = {}
    last_flush = now_epoch()

    try:
        while True:
            # Batch poll nhiều message 1 lần
            msgs = consumer.consume(BATCH_SIZE, timeout=0.2)
            t_now = now_epoch()

            for msg in msgs or []:
                if not msg or msg.error():
                    continue

                try:
                    payload = json.loads(msg.value())
                except Exception:
                    print("⚠️ Lỗi decode JSON:", msg.value())
                    continue

                headers = safe_decode_header(msg.headers())
                due_ts = float(headers.get("next_retry_ts", 0))
                if t_now < due_ts:  # chưa tới hạn
                    tp = TopicPartition(msg.topic(), msg.partition(), msg.offset())
                    consumer.seek(tp)
                    time.sleep(min(due_ts - t_now, 1.0))
                    continue

                try:
                    req = parse_request(payload)
                except Exception as ex:
                    print("⚠️ Lỗi parse request:", ex, payload)
                    continue
                _update_arrival_stats(req.geohash)
                buffer_by_gh.setdefault(req.geohash, []).append((req, headers, msg))
                print("📥 buffered", req)
            
            for gh, items in list(buffer_by_gh.items()):
                if _should_flush(gh, len(items)):
                    flush_buffer({gh: items})
                    _update_service_stats(gh, runtime_sec=0, batch_len=len(items))  # runtime sẽ pass thật sau
                    buffer_by_gh.pop(gh, None)

            # flush mỗi BATCH_SEC
            if t_now - last_flush >= BATCH_SEC:
                flush_buffer(buffer_by_gh)
                buffer_by_gh.clear()
                last_flush = t_now

    except KeyboardInterrupt:
        print("⏹️  KeyboardInterrupt - stopping service")
    except Exception as e:
        print("🚨 Error in main loop:", e)
        traceback.print_exc()
    finally:
        consumer.close()


# --------------------------------------------------------------------------- #
# FLUSH & MATCH
# --------------------------------------------------------------------------- #
def flush_buffer(buf: dict) -> None:
    commit_msgs = []
    for gh, items in buf.items():
        start_ts = time.time()  # Đặt trong từng vòng lặp để đo runtime cho mỗi gh
        if not items:
            continue

        # Lấy config cho từng geohash
        config = get_matching_config(gh)
        algorithm = config.get("algorithm", "gale_shapley")
        proximity_weight = config.get("proximity_weight", 1.0)
        rating_weight = config.get("rating_weight", 1.0)
        price_weight = config.get("price_weight", 0.0)
        max_distance = config.get("max_distance", None)
        min_driver_rating = config.get("min_driver_rating", None)

        rider_models: List[RideMatchingRequest] = [req for req, _, _ in items]
        raw_drivers = get_drivers_by_geohash(gh) or []

        # Có thể filter driver theo min_driver_rating trước (nếu cần)
        driver_models: List[Driver] = [
            parse_driver(d) for d in raw_drivers
            if min_driver_rating is None or float(d.get("rating", 1.0)) >= min_driver_rating
        ]

        if not driver_models:
            print(f"⚠️  No drivers in {gh}")
            for req, h, m in items:
                schedule_retry(req, h, m, "no_driver")
                commit_msgs.append(m)
            # Update service stats cho gh này với batch_len đúng nhưng runtime_sec = 0
            _update_service_stats(gh, 0, len(items))
            continue

        # Build preference cho stable_matching (dùng dict)
        prefs_r, prefs_d = build_preferences(
            [{"id": r.rider_id, "lat": r.lat, "lng": r.lng, "fare": r.fare} for r in rider_models],
            [{"id": d.id, "lat": d.lat, "lng": d.lng, "rating": d.rating} for d in driver_models],
            proximity_weight=proximity_weight,
            rating_weight=rating_weight,
            price_weight=price_weight,
            max_distance=max_distance,
            min_driver_rating=min_driver_rating
        )

        print(f"🔧 Using algorithm: {algorithm} (geo={gh}) config={config}")

        if algorithm == "gale_shapley":
            matches = gale_shapley(
                [str(r.rider_id) for r in rider_models],
                [str(d.id) for d in driver_models],
                {str(k): [str(x) for x in v] for k, v in prefs_r.items()},
                {str(k): [str(x) for x in v] for k, v in prefs_d.items()},
            )
            matches = {int(k): int(v) for k, v in matches.items() if v is not None}
        elif algorithm == "hungarian":
            # Hungarian hỗ trợ truyền thêm weights nếu bạn sửa hàm cho phép!
            matches = hungarian_matching(
                [{"id": r.rider_id, "lat": r.lat, "lng": r.lng, "fare": r.fare} for r in rider_models],
                [{"id": d.id, "lat": d.lat, "lng": d.lng, "rating": d.rating} for d in driver_models],
                proximity_weight=proximity_weight,
                rating_weight=rating_weight,
                price_weight=price_weight,
                max_distance=max_distance,
                min_driver_rating=min_driver_rating
            )
        else:
            print(f"⚠️ Unknown algorithm '{algorithm}', fallback to hungarian")
            matches = hungarian_matching(
                [{"id": r.rider_id, "lat": r.lat, "lng": r.lng, "fare": r.fare} for r in rider_models],
                [{"id": d.id, "lat": d.lat, "lng": d.lng, "rating": d.rating} for d in driver_models],
                proximity_weight=proximity_weight,
                rating_weight=rating_weight,
                price_weight=price_weight,
                max_distance=max_distance,
                min_driver_rating=min_driver_rating
            )

        for req, hdr, raw_msg in items:
            rider_id = req.rider_id
            req_id = req.ride_id
            drv_id = matches.get(rider_id)

            if not drv_id:
                schedule_retry(req, hdr, raw_msg, "unmatched")
                commit_msgs.append(raw_msg)
                continue

            if not lock_driver(drv_id):
                schedule_retry(req, hdr, raw_msg, "driver_locked")
                commit_msgs.append(raw_msg)
                continue

            result = {
                "ride_id": req_id,
                "rider_id": rider_id,
                "driver_id": drv_id,
                "matched_at": iso(now_epoch()),
            }
            producer.produce(TOPIC_RES, key=str(req_id), value=json.dumps(result))
            commit_msgs.append(raw_msg)
            print("✅ produced result", result)

        # Update service stats cho mỗi gh
        runtime_sec = time.time() - start_ts
        _update_service_stats(gh, runtime_sec, len(items))

    producer.flush()
    if commit_msgs:
        consumer.commit(offsets=[TopicPartition(m.topic(), m.partition(), m.offset()+1) for m in commit_msgs], asynchronous=False)

# --------------------------------------------------------------------------- #
# RETRY / TIMEOUT
# --------------------------------------------------------------------------- #
def schedule_retry(req: RideMatchingRequest, hdr: dict, raw_msg, reason: str) -> None:
    first_ts  = float(hdr.get("first_ts", now_epoch()))
    retry_cnt = int(hdr.get("retry_count", "0")) + 1
    elapsed   = now_epoch() - first_ts

    if retry_cnt > MAX_RETRY or elapsed >= MAX_WAIT:
        fail_msg = {
            "ride_id": req.ride_id,
            "rider_id": req.rider_id,
            "geohash": req.geohash,
            "lat": req.lat,
            "lng": req.lng,
            "ride_type": req.ride_type,
            "fare": req.fare,
            "requested_at": req.requested_at,
            "retry_count": retry_cnt,
            "failed_reason": reason,
            "elapsed_seconds": elapsed,
            "failed_at": iso(now_epoch()),
        }
        producer.produce(TOPIC_FAIL, key=str(req.ride_id),
                         value=json.dumps(fail_msg))
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
        key=str(req.ride_id),
        value=json.dumps({
            "ride_id": req.ride_id,
            "rider_id": req.rider_id,
            "geohash": req.geohash,
            "lat": req.lat,
            "lng": req.lng,
            "ride_type": req.ride_type,
            "fare": req.fare,
            "requested_at": req.requested_at,
        }),
        headers=headers,
    )
    print(f"🔄 SCHEDULE RETRY #{retry_cnt} in {delay}s -> {req.ride_id} ({reason})")

# --------------------------------------------------------------------------- #
# ENTRY
# --------------------------------------------------------------------------- #
if __name__ == "__main__":
    print("🔥 Matching service started with Kafka‑based retries (seek‑on‑hold) & batch polling & models")
    run()
