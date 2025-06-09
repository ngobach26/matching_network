from confluent_kafka import Consumer
import json
import asyncio
import time
from manager import WebSocketManager

conf = {
    "bootstrap.servers": "kafka:9092",
    "group.id": "websocket-notifier",
    "auto.offset.reset": "earliest"
}

async def process_kafka_message(manager, msg):
    try:
        event = json.loads(msg.value())
        rider_id = event.get("rider_id")
        driver_id = event.get("driver_id")

        if rider_id:
            await manager.send(f"rider:{rider_id}", event)
        if driver_id:
            await manager.send(f"driver:{driver_id}", event)
    except Exception as e:
        print(f"⚠️ Error processing Kafka message: {e}")

async def kafka_listener(manager: WebSocketManager, max_retries=100, max_backoff=600):
    retry_count = 0
    while True:
        try:
            consumer = Consumer(conf)
            consumer.subscribe(["ride-request-events", "ride-events"])

            print("📡 Kafka WebSocket listener started (ride-events + ride-request-events)")
            while True:
                try:
                    msg = consumer.poll(1.0)
                    if msg is None:
                        await asyncio.sleep(0.1)
                        continue
                    if msg.error():
                        print("❌ Kafka error:", msg.error())
                        continue
                    await process_kafka_message(manager, msg)
                except Exception as e:
                    print(f"⚠️ Error in Kafka polling loop: {e}")
                    # Break out and reconnect
                    break

        except Exception as e:
            print(f"🔥 Kafka connection failed: {e}")

        finally:
            try:
                consumer.close()
            except Exception:
                pass

        # Retry logic
        retry_count += 1
        backoff = min(2 ** retry_count, max_backoff)
        print(f"🔁 Retrying Kafka connection in {backoff} seconds (attempt {retry_count})")
        await asyncio.sleep(backoff)
        if retry_count >= max_retries:
            print("🚫 Max Kafka retry attempts reached. Exiting listener.")
            break
