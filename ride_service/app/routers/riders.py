from fastapi import APIRouter, HTTPException
from datetime import datetime
from typing import List
from app.models import RiderCreate
from app.database import riders_collection

router = APIRouter()

# POST /riders/
@router.post("/")
def create_rider(rider: RiderCreate):
    existing = riders_collection.find_one({"user_id": rider.user_id})
    if existing:
        raise HTTPException(status_code=400, detail="Rider with this user_id already exists")
    
    data = rider.model_dump()
    data["created_at"] = data.get("created_at") or datetime.now()
    result = riders_collection.insert_one(data)
    return {"inserted_id": str(result.inserted_id)}

# GET /riders/
@router.get("/")
def list_riders():
    riders = list(riders_collection.find({}, {"_id": 0}))
    return riders

# GET /riders/{user_id}
@router.get("/{user_id}")
def get_rider(user_id: int):
    rider = riders_collection.find_one({"user_id": user_id}, {"_id": 0})
    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found")
    return rider

# PUT /riders/{user_id}
@router.put("/{user_id}")
def update_rider(user_id: int, rider: RiderCreate):
    data = rider.model_dump(exclude_unset=True)
    if "created_at" in data:
        del data["created_at"]  # Don't overwrite creation date on update
    
    result = riders_collection.update_one({"user_id": user_id}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Rider not found")
    return {"updated": True}

# DELETE /riders/{user_id}
@router.delete("/{user_id}")
def delete_rider(user_id: int):
    result = riders_collection.delete_one({"user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Rider not found")
    return {"deleted": True}
