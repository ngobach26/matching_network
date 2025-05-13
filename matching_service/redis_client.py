import redis as redis
import json

r = redis.Redis(host="redis", port=6379)

def lock_driver(driver_id: str, ttl_sec: int = 600):
    # Lock bằng Redis NX + TTL (đơn vị: giây)
    return r.set(f"driver:{driver_id}:lock", "matched", ex=ttl_sec, nx=True)

def is_driver_locked(driver_id: str) -> bool:
    return r.exists(f"driver:{driver_id}:lock") == 1

def get_drivers_by_geohash(gh: str):
    ids = r.smembers(f"driver:geohash:{gh}")
    drivers = []

    for raw in ids:
        try:
            d_id = raw.decode() if isinstance(raw, bytes) else raw

            # ❌ Nếu driver bị lock, bỏ qua
            if r.exists(f"driver:{d_id}:lock"):
                print(f"🔒 Skipping locked driver {d_id}")
                continue

            data = r.get(f"driver:{d_id}")
            if not data:
                continue

            info = json.loads(data)
            drivers.append({
                "id": d_id,
                "lat": info["lat"],
                "lng": info["lng"]
            })
        except Exception as e:
            print(f"⚠️ Error parsing driver {raw}: {e}")
            continue

    return drivers

def get_matching_algorithm():
    raw = r.get("matching:algorithm")
    if not raw:
        return "gale_shapley"
    try:
        # Nếu Redis lưu dạng JSON
        return json.loads(raw).get("algorithm", "gale_shapley")
    except json.JSONDecodeError:
        # Nếu chỉ lưu plain string (phòng trường hợp khác)
        return raw