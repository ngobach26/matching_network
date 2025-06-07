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

            if r.exists(f"driver:{d_id}:lock"):
                print(f"🔒 Skipping locked driver {d_id}")
                continue

            data = r.get(f"driver:{d_id}")
            if not data:
                continue
            info = json.loads(data)

            rating = 5.0  # default
            rating_info = r.hget(f"driver:rating:{d_id}", "rating_average")
            if rating_info:
                try:
                    rating = float(rating_info.decode() if isinstance(rating_info, bytes) else rating_info)
                except Exception:
                    rating = 5.0

            driver_data = {
                "id": d_id,
                "lat": info["lat"],
                "lng": info["lng"],
                "rating": rating
            }
            drivers.append(driver_data)
            print(f"✅ Driver found: ID={driver_data['id']}, Lat={driver_data['lat']}, Lng={driver_data['lng']}, Rating={driver_data['rating']}")
        except Exception as e:
            print(f"⚠️ Error parsing driver {raw}: {e}")
            continue

    return drivers

def get_matching_config(geohash: str):
    raw = r.get(f"matching:config:{geohash}")
    if not raw:
        # Trả về config mặc định nếu chưa set cho geohash này
        return {
            "algorithm": "gale_shapley",
            "proximity_weight": 1.0,
            "rating_weight": 1.0,
            "price_weight": 0.0,
            "max_distance": None,
            "matching_timeout": None,
            "min_driver_rating": None
        }
    try:
        # Redis lưu dạng JSON string
        return json.loads(raw)
    except Exception:
        # Nếu lỗi format, fallback về mặc định tối thiểu
        return {
            "algorithm": "gale_shapley",
            "proximity_weight": 1.0,
            "rating_weight": 1.0,
            "price_weight": 0.0,
            "max_distance": None,
            "matching_timeout": None,
            "min_driver_rating": None
        }