import json
import random
import math
import asyncio
# import pygeohash as gh
import redis.asyncio as redis

# TTL constants
TTL = 60000

# Redis async client
r = redis.Redis(host='redis', port=6379, decode_responses=True)

def random_nearby(lat, lng, radius_m=1000):
    lat_offset = random.uniform(-radius_m, radius_m) / 111000
    lng_offset = random.uniform(-radius_m, radius_m) / (111000 * abs(math.cos(math.radians(lat))))
    return lat + lat_offset, lng + lng_offset

async def update_location(role: str, user_id: str, lat: float, lng: float):
    # geohash = gh.encode(lat, lng, precision=4)

    geo_key = f"geo:{role}s"
    id_key = f"{role}:{user_id}"

    # Lưu vị trí kèm TTL 30s
    await r.geoadd(geo_key, (lng, lat, user_id))
    await r.set(id_key, json.dumps({
        "lat": lat,
        "lng": lng,
        # "geohash": geohash
    }), ex=TTL)

    # Đánh dấu trạng thái là online
    await r.set(f"{role}:{user_id}:status", "online", ex=60)

    # Thêm vào geohash cluster
    # await r.sadd(f"{role}:geohash:{geohash}", user_id)

    # print(f"📍 Updated {role} {user_id} → ({lat:.5f}, {lng:.5f}) [geohash: {geohash}]", flush=True)

async def seed_drivers(start_id, count, center_lat, center_lng, label):
    for i in range(start_id, start_id + count):
        lat, lng = random_nearby(center_lat, center_lng)
        await update_location("driver", str(i), lat, lng)
        print(f"✅ Seeded driver {i} in {label}")

async def clear_old_data():
    print("🧹 Clearing old drivers...")
    async for key in r.scan_iter("driver:*"):
        await r.delete(key)
    await r.delete("geo:drivers")
    async for key in r.scan_iter("driver:geohash:*"):
        await r.delete(key)

async def main():
    await clear_old_data()

    print("🚗 Seeding drivers...")
    await seed_drivers(1, 30, 19.8067, 105.7762, "Thanh Hoa")
    await seed_drivers(31, 35, 21.0285, 105.8542, "Ha Noi")
    await seed_drivers(66, 35, 10.7769, 106.7009, "HCM")

    print("✅ Done seeding 100 drivers.")

if __name__ == '__main__':
    asyncio.run(main())
