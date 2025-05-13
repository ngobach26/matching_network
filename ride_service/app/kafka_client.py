from fastapi import HTTPException
from confluent_kafka import Producer
import os
import json

producer = Producer({
    "bootstrap.servers": os.getenv("KAFKA_BROKERS", "kafka:9092")
})

def send_ride_request_to_kafka(message):
    try:
        producer.produce(
            topic="ride-matching-requests",
            key=message["geohash"],
            value=json.dumps(message).encode("utf-8")
        )
        producer.flush()
    except Exception as e:
        print(f"❌ Kafka error: {e}")
        raise HTTPException(status_code=500, detail=f"Kafka error: {str(e)}")

def send_ride_event_to_kafka(ride):
    try:
        message = {
            "event": "ride_status_updated",
            "ride_id": ride.id,
            "rider_id": ride.rider_id,
            "driver_id": ride.driver_id,
            "status": ride.status
        }

        producer.produce(
            topic="ride-events",
            key=ride.id,
            value=json.dumps(message).encode("utf-8")
        )
        producer.flush()
    except Exception as e:
        print(f"❌ Kafka error: {e}")
        raise HTTPException(status_code=500, detail=f"Kafka error: {str(e)}")
    
def notify_rider_match_found(rider_id: int, ride_result_id: str):
    message = {
        "event": "ride_request_matched",
        "rider_id": rider_id,
        "ride_id": ride_result_id,
    }

    try:
        producer.produce(
            topic="ride-request-events",
            key=str(rider_id),
            value=json.dumps(message).encode("utf-8")
        )
        producer.flush()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Kafka notify error: {str(e)}")