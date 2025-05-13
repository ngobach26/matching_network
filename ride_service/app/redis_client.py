from redis.asyncio import Redis

r = Redis(host="redis", port=6379, decode_responses=True)

async def unlock_driver(driver_id: int):
    # Xóa khóa driver trong Redis
    await r.delete(f"driver:{driver_id}:lock")
    print(f"🔓 Unlocked driver {driver_id}", flush=True)