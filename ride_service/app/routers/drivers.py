from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from typing import List
from app.models import Driver, DriverCreate, DriverUpdate
from app.database import drivers_collection

router = APIRouter()


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_driver(driver: DriverCreate):
    existing = drivers_collection.find_one({"user_id": driver.user_id})
    if existing:
        raise HTTPException(status_code=400, detail="Driver with this user_id already exists")

    data = driver.model_dump()
    data["created_at"] = datetime.utcnow()
    result = drivers_collection.insert_one(data)
    return {"inserted_id": str(result.inserted_id)}


@router.get("/", response_model=List[Driver])
def list_drivers():
    drivers = list(drivers_collection.find())
    for driver in drivers:
        driver["_id"] = str(driver.get("_id"))
    return drivers


@router.get("/{user_id}", response_model=Driver)
def get_driver(user_id: int):
    driver = drivers_collection.find_one({"user_id": user_id})
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    driver["_id"] = str(driver.get("_id"))
    return driver


@router.put("/{user_id}")
def update_driver(user_id: int, driver: DriverUpdate):
    data = driver.model_dump(exclude_unset=True)
    data.pop("created_at", None)  # Prevent modification of created_at
    result = drivers_collection.update_one({"user_id": user_id}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Driver not found")
    return {"updated": True}


@router.delete("/{user_id}")
def delete_driver(user_id: int):
    result = drivers_collection.delete_one({"user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Driver not found")
    return {"deleted": True}
