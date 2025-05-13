from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from app.models import RideRating
from app.database import ratings_collection, drivers_collection
router = APIRouter()

# ---------- POST /ratings ----------
@router.post("/", response_model=RideRating)
async def submit_rating(rating: RideRating):
    # Check for existing rating for this ride_request_id
    existing = ratings_collection.find_one({
        "ride_id": rating.ride_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="Rating already submitted for this ride.")

    # Insert rating
    rating_dict = rating.dict(by_alias=True)
    result = ratings_collection.insert_one(rating_dict)
    rating_dict["_id"] = str(result.inserted_id)

    # 🔄 Update driver's rating
    driver_id = rating.driver_id
    driver = drivers_collection.find_one({"user_id": driver_id})

    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    # Get current values (default to 0)
    rating_average = driver.get("rating_average", 0)
    rating_count = driver.get("rating_count", 0)

    new_total = rating_average*rating_count + rating.rating
    new_count = rating_count + 1
    new_avg = round(new_total / new_count, 2)

    drivers_collection.update_one(    
        {"id": driver_id},
        {
            "$set": {"average_rating": new_avg, "rating_count": new_count},
        }
    )

    return rating_dict
