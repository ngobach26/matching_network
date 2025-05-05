from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.schemas import MatchRequest, MatchResponse
from app.database import drivers_collection, driver_locations_collection, matches_collection
import math

router = APIRouter()

# -----------------------------
# Haversine distance calculator
# -----------------------------
def haversine_distance(lat1, lng1, lat2, lng2):
    R = 6371  # Earth's radius in kilometers
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = math.sin(d_lat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lng / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# -----------------------------
# POST /match/
# -----------------------------
@router.post("/", response_model=MatchResponse)
def match_driver(request: MatchRequest):
    pickup_geo = {
        "type": "Point",
        "coordinates": [request.pickup_location.lng, request.pickup_location.lat]
    }

    # Find an active driver with location via $lookup
    random_driver_cursor = drivers_collection.aggregate([
        {
            "$match": {"status": "active"}
        },
        {
            "$lookup": {
                "from": "driver_locations",
                "localField": "user_id",
                "foreignField": "driver_user_id",
                "as": "location_info"
            }
        },
        {
            "$unwind": "$location_info"
        },
        {
            "$match": {
                "location_info.location": {"$exists": True, "$ne": None}
            }
        },
        {
            "$sample": {"size": 1}
        }
    ])

    random_driver = next(random_driver_cursor, None)

    if not random_driver:
        raise HTTPException(status_code=404, detail="No available drivers found")

    location = random_driver["location_info"]["location"]
    if "coordinates" not in location or not isinstance(location["coordinates"], list):
        raise HTTPException(status_code=400, detail="Invalid driver location format")

    driver_lat = location["coordinates"][1]
    driver_lng = location["coordinates"][0]

    distance_km = haversine_distance(
        request.pickup_location.lat,
        request.pickup_location.lng,
        driver_lat,
        driver_lng
    )

    now = datetime.utcnow()

    match_doc = {
        "rider_id": request.rider_id,
        "driver_id": random_driver["user_id"],
        "pickup_location": pickup_geo,
        "dropoff_location": {
            "type": "Point",
            "coordinates": [request.dropoff_location.lng, request.dropoff_location.lat]
        },
        "status": "matched",
        "requested_at": now,
        "matched_at": now,
        "completed_at": None
    }

    matches_collection.insert_one(match_doc)

    drivers_collection.update_one(
        {"user_id": random_driver["user_id"]},
        {"$set": {"status": "busy"}}
    )

    return MatchResponse(
        rider_id=request.rider_id,
        driver_id=random_driver["user_id"],
        estimated_distance_km=round(distance_km, 2),
        status="matched",
        matched_at=now
    )
