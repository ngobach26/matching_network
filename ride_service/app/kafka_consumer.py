from datetime import datetime
import json
import asyncio
import redis.asyncio as redis
from confluent_kafka import Consumer, Producer
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

# Kafka producer
producer = Producer({"bootstrap.servers": "kafka:9092"})

# Mongo client
mongo = AsyncIOMotorClient("mongodb://mongo:27017/")
db = mongo["ride_service"]
rides_collection = db["rides"]

# Kafka consumer config
conf = {
    "bootstrap.servers": "kafka:9092",
    "group.id": "ride-matching-result-consumer",
    "auto.offset.reset": "earliest",
}


async def consume_kafka_matching():
    consumer = Consumer(conf)
    consumer.subscribe(["ride-matching-results", "ride-matching-failed"])
    print("📥 Kafka consumer started: ride-matching-results & ride-matching-failed")

    try:
        while True:
            msg = consumer.poll(1.0)
            if msg is None:
                await asyncio.sleep(0.1)
                continue
            if msg.error():
                print("❌ Kafka error:", msg.error())
                continue

            topic = msg.topic()
            data = json.loads(msg.value())
            ride_id = data["ride_id"]

            if topic == "ride-matching-results":
                rider_id = data["rider_id"]
                driver_id = data["driver_id"]
                print(f"✅ Matched: rider {rider_id} → driver {driver_id}",flush=True)

                event = {
                    "event": "ride_request_matched",
                    "ride_id": ride_id,
                    "driver_id": driver_id,
                }

            elif topic == "ride-matching-failed":
                rider_id = data.get("rider_id")
                reason = data.get("timeout_reason") or data.get("failed_reason", "unknown")
                print(f"⛔ Match failed: ride_id {ride_id} – reason: {reason}", flush=True)

                event = {
                    "event": "ride_request_failed",
                    "ride_id": ride_id,
                    "rider_id": rider_id,
                    "reason": reason,
                }

                try:
                    mongo_id = ObjectId(ride_id)
                except Exception:
                    print(f"❌ ride_id {ride_id} is not a valid ObjectId", flush=True)
                    return  # hoặc continue

                update_result = await rides_collection.update_one(
                    {"_id": mongo_id},
                    {
                        "$set": {
                            "status": "cancelled",
                            "cancelled_by": "system",
                            "cancellation_reason": reason,
                            "updated_at": datetime.now()
                        }
                    }
                )

                if update_result.matched_count == 0:
                    print(f"⚠️  ride_request {ride_id} not found in DB", flush=True)
                else:
                    print(f"📝 Updated ride_request {ride_id} as cancelled", flush=True)

            else:
                print(f"⚠️ Unknown topic: {topic}")
                continue

            producer.produce(
                topic="ride-request-events",
                key=ride_id,
                value=json.dumps(event).encode("utf-8")
            )
            producer.flush()

    except Exception as e:
        print(f"🔥 Error in Kafka consumer: {e}")
    finally:
        consumer.close()
