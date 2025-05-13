import json
import os
import pygeohash as gh
from datetime import datetime
from fastapi import APIRouter, HTTPException
from app.models import RideDetail
from app.database import ride_requests_collection,rides_collection
from bson import ObjectId
from confluent_kafka import Producer
import redis.asyncio as redis
from fastapi import Body
from app.state_machine.ride_state_machine import RideStateMachine
from app.redis_client import unlock_driver
from app.kafka_client import send_ride_event_to_kafka

router = APIRouter()

@router.get("/{ride_id}", response_model=RideDetail)
def get_ride(ride_id: str):
    try:
        ride = rides_collection.find_one({"_id": ObjectId(ride_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ride_id")

    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    print(ride)
    return {
        "id": str(ride["_id"]),
        "rider_id": ride["rider_id"],
        "request_id": str(ride["request_id"]),
        "driver_id": ride["driver_id"],
        "status": ride["status"],
        "created_at": ride.get("created_at"),
        "start_time": ride.get("start_time"),
        "end_time": ride.get("end_time"),
        "estimated_fare": ride.get("estimated_fare"),
        "actual_fare": ride.get("actual_fare"),
        "estimated_distance_km": ride.get("estimated_distance_km"),
        "actual_distance_km": ride.get("actual_distance_km"),
        "estimated_duration_min": ride.get("estimated_duration_min"),
        "actual_duration_min": ride.get("actual_duration_min"),
    }

@router.post("/{ride_id}/status")
async def update_ride_status(ride_id: str, action: str = Body(..., embed=True)):
    try:
        ride_data = rides_collection.find_one({"_id": ObjectId(ride_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ride_id")

    if not ride_data:
        raise HTTPException(status_code=404, detail="Ride not found")

    ride = RideDetail(
        id=str(ride_data["_id"]),
        rider_id=ride_data["rider_id"],
        driver_id=ride_data["driver_id"],
        status=ride_data["status"],
        created_at=ride_data.get("created_at"),
        start_time=ride_data.get("start_time"),
        end_time=ride_data.get("end_time"),
        estimated_fare=ride_data.get("estimated_fare"),
        actual_fare=ride_data.get("actual_fare"),
        estimated_distance_km=ride_data.get("estimated_distance_km"),
        actual_distance_km=ride_data.get("actual_distance_km"),
        estimated_duration_min=ride_data.get("estimated_duration_min"),
        actual_duration_min=ride_data.get("actual_duration_min"),
    )

    sm = RideStateMachine(ride)

    try:
        trigger = getattr(sm, action)
        trigger()
    except AttributeError:
        raise HTTPException(status_code=400, detail=f"Invalid action: {action}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    update_fields = {"status": ride.status}
    if ride.status == "ongoing" and not ride.start_time:
        update_fields["start_time"] = datetime.utcnow()
    elif ride.status == "completed" and not ride.end_time:
        update_fields["end_time"] = datetime.utcnow()
        await unlock_driver(ride.driver_id)

    send_ride_event_to_kafka(ride)

    rides_collection.update_one(
        {"_id": ObjectId(ride_id)},
        {"$set": update_fields}
    )

    return {"ride_id": ride_id, "new_status": ride.status}