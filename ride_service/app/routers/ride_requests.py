import json
import os
import pygeohash as gh
from datetime import datetime
from fastapi import APIRouter, HTTPException
from app.models import RideRequestCreate, RideRequestDecision, RideRequestResponse,RideRequestDetail
from app.database import ride_requests_collection,rides_collection
from bson import ObjectId
from confluent_kafka import Producer
from fastapi import Body
from app.redis_client import unlock_driver
from app.kafka_client import send_ride_request_to_kafka, notify_rider_match_found

router = APIRouter()
producer = Producer({
    "bootstrap.servers": os.getenv("KAFKA_BROKERS", "kafka:9092")
})



@router.post("/", response_model=RideRequestResponse)
def match_driver(request: RideRequestCreate):
    lat = request.pickup_location.lat
    lng = request.pickup_location.lng
    rider_id = request.rider_id
    geohash = gh.encode(lat, lng, precision=4)
    now = datetime.now()

    # ✅ 1. Ghi trước vào DB, lấy ride_request_id
    ride_request = {
        "rider_id": rider_id,
        "pickup_location": request.pickup_location.dict(),
        "geohash": geohash,
        "estimated_fare": request.estimated_fare,
        "estimated_distance": request.estimated_distance,
        "dropoff_location": request.dropoff_location.dict(),
        "ride_type": request.ride_type,
        "status": "pending",
        "requested_at": request.requested_at,
        "created_at": now,
        "updated_at": now
    }
    result = ride_requests_collection.insert_one(ride_request)
    ride_request_id = str(result.inserted_id)

    # ✅ 2. Đẩy message vào Kafka
    message = {
        "ride_request_id": ride_request_id,
        "rider_id": rider_id,
        "lat": lat,
        "lng": lng,
        "geohash": geohash,
        "ride_type": request.ride_type,
        "requested_at": request.requested_at.isoformat()
    }
    send_ride_request_to_kafka(message)

    return RideRequestResponse(
        id=str(ride_request_id),
        rider_id=rider_id,
        status="pending",
        driver_id=None,
        created_at=now
    )

@router.get("/{ride_request_id}", response_model=RideRequestDetail)
def get_ride_request(ride_request_id: str):
    try:
        request = ride_requests_collection.find_one({"_id": ObjectId(ride_request_id)})
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid ride_request_id")

    if not request:
        raise HTTPException(status_code=404, detail="Ride request not found")

    return {
        "id": str(request["_id"]),
        "rider_id": request["rider_id"],
        "geohash": request["geohash"],
        "estimated_fare": request.get("estimated_fare"),
        "estimated_distance": request.get("estimated_distance"),
        "pickup_location": request["pickup_location"],
        "dropoff_location": request["dropoff_location"],
        "ride_type": request.get("ride_type"),
        "status": request["status"],
        "driver_id": request.get("driver_id"),
        "requested_at": request.get("requested_at"),
        "created_at": request.get("created_at"),
        "updated_at": request.get("updated_at"),
        "cancellation_reason": request.get("cancellation_reason")
    }

@router.post("/{ride_request_id}/decision")
async def driver_decision(
    ride_request_id: str,
    decision: RideRequestDecision = Body(...)
):
    try:
        ride_req = ride_requests_collection.find_one({"_id": ObjectId(ride_request_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid ride_request_id")

    if not ride_req:
        raise HTTPException(status_code=404, detail="Ride request not found")

    rider_id = ride_req["rider_id"]

    if decision.accept:
        # ✅ Accept: cập nhật request + tạo ride + notify rider
        ride_requests_collection.update_one(
            {"_id": ObjectId(ride_request_id)},
            {"$set": {
                "status": "matched",
                "driver_id": decision.driver_id,
                "updated_at": datetime.utcnow()
            }}
        )

        ride = {
            "rider_id": rider_id,
            "request_id": ObjectId(ride_request_id),
            "estimated_distance_km": ride_req.get("estimated_distance"),
            "estimated_duration_min": ride_req.get("estimated_duration"),
            "driver_id": decision.driver_id,
            "status": "accepted",
            "created_at": datetime.utcnow()
        }
        ride_result_id = str(rides_collection.insert_one(ride).inserted_id)
        notify_rider_match_found(rider_id, ride_result_id)

        return {"message": "✅ Accepted and matched",
                "ride_id": ride_result_id}

    else:
        # ❌ Reject: gửi lại vào Kafka
        lat = ride_req["pickup_location"]["lat"]
        lng = ride_req["pickup_location"]["lng"]
        geohash = gh.encode(lat, lng, precision=4)
        requested_at = ride_req.get("requested_at", datetime.utcnow())
        if isinstance(requested_at, datetime):
            requested_at = requested_at.isoformat()

        await unlock_driver(decision.driver_id)
        message = {
            "ride_request_id": ride_request_id,
            "rider_id": ride_req["rider_id"],
            "lat": lat,
            "lng": lng,
            "geohash": geohash,
            "ride_type": ride_req.get("ride_type", "car"),
            "requested_at": requested_at
        }
        send_ride_request_to_kafka(message)

        return {"message": "🔁 Re-queued to matching service"}
    