import redis.asyncio as redis

r = redis.Redis(host="redis", port=6379, decode_responses=True)

async def clear_driver_from_redis(key: str):
    try:
        role, user_id = key.split(":")
        if role != "driver":
            return

        await r.zrem("geo:drivers", user_id)
        await r.delete(f"driver:{user_id}")
        await r.set(f"driver:{user_id}:status", "offline")

        print(f"🧹 Cleaned up driver {user_id} from Redis (marked offline)", flush=True)
    except Exception as e:
        print(f"⚠️ Error cleaning driver redis for {key}: {e}", flush=True)
