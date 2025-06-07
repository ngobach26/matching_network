from redis.asyncio import Redis

r = Redis(host="redis", port=6379, decode_responses=True)

async def unlock_driver(driver_id: int):
    # Xóa khóa driver trong Redis
    await r.delete(f"driver:{driver_id}:lock")
    print(f"🔓 Unlocked driver {driver_id}", flush=True)

# redis_client.py
async def sync_driver_rating(driver_id, new_avg, new_count):
    key = f"driver:rating:{driver_id}"
    rtype = await r.type(key)
    if rtype not in (b"hash", b"none"):
        await r.delete(key)
    await r.hset(key, mapping={
        "rating_average": new_avg,
        "rating_count": new_count
    })

