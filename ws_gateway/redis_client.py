import asyncio
import json
import redis.asyncio as redis
import pygeohash as gh
from manager import WebSocketManager
import time
import datetime
# Redis configuration
TTL = 60  # TTL for Redis keys in seconds

r = redis.Redis(host="redis", port=6379, decode_responses=True)

async def update_location(role: str, user_id: str, lat: float, lng: float):
    geohash = gh.encode(lat, lng, precision=4)

    geo_key = f"geo:{role}s"
    id_key = f"{role}:{user_id}"

    await r.geoadd(geo_key, (lng, lat, user_id))
    await r.set(id_key, json.dumps({
        "lat": lat,
        "lng": lng,
        "geohash": geohash
    }), ex=TTL)

    # Đánh dấu trạng thái là online
    await r.set(f"{role}:{user_id}:status", "online", ex=60)

    # Thêm vào geohash cluster
    await r.sadd(f"{role}:geohash:{geohash}", user_id)

    print(f"📍 Updated {role} {user_id} → ({lat}, {lng}) [geohash: {geohash}]", flush=True)

async def save_chat_message(role: str, sender_id: str, receiver_id: str, ride_id: str, message: str):
    timestamp = datetime.datetime.now().isoformat()

    msg_obj = {
        "sender_id": sender_id,
        "receiver_id": receiver_id,
        "role": role,
        "message": message,
        "ride_id": ride_id,
        "timestamp": timestamp,
    }

    # Lưu vào Redis list
    await r.rpush(f"chat:ride:{ride_id}", json.dumps(msg_obj))
    return msg_obj