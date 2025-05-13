from confluent_kafka import Consumer
import json
import asyncio
from manager import WebSocketManager

conf = {
    "bootstrap.servers": "kafka:9092",
    "group.id": "websocket-notifier",
    "auto.offset.reset": "earliest"
}

async def kafka_listener(manager: WebSocketManager):
    consumer = Consumer(conf)
    consumer.subscribe(["ride-request-events", "ride-events"])

    print("📡 Kafka WebSocket listener started (ride-events + ride-request-events)")

    try:
        while True:
            msg = consumer.poll(1.0)
            if msg is None:
                await asyncio.sleep(0.1)
                continue
            if msg.error():
                print("❌ Kafka error:", msg.error())
                continue

            try:
                event = json.loads(msg.value())
                rider_id = event.get("rider_id")
                driver_id = event.get("driver_id")

                # Forward to rider WebSocket
                if rider_id:
                    await manager.send(f"rider:{rider_id}", event)

                # Forward to driver WebSocket
                if driver_id:
                    await manager.send(f"driver:{driver_id}", event)

            except Exception as e:
                print(f"⚠️ Error processing Kafka message: {e}")

    except Exception as e:
        print(f"🔥 Fatal error in Kafka WebSocket listener: {e}")
    finally:
        consumer.close()