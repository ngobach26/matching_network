from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.schemas import VehicleCreate
from bson import ObjectId
from bson.errors import InvalidId
from app.database import vehicles_collection

router = APIRouter()


@router.post("/")
def create_vehicle(vehicle: VehicleCreate):
    vehicle_data = vehicle.model_dump()
    vehicle_data["created_at"] = vehicle_data.get("created_at") or datetime.now()
    
    result = vehicles_collection.insert_one(vehicle_data)
    return {"message": "Vehicle created successfully", "vehicle_id": str(result.inserted_id)}


@router.get("/{vehicle_id}")
def get_vehicle(vehicle_id: str):
    try:
        vehicle = vehicles_collection.find_one({"_id": ObjectId(vehicle_id)})
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid vehicle ID format")
    
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    vehicle["_id"] = str(vehicle["_id"])
    return vehicle


@router.get("/")
def list_vehicles():
    vehicles = []
    for v in vehicles_collection.find():
        v["_id"] = str(v["_id"])
        vehicles.append(v)
    return vehicles


@router.put("/{vehicle_id}")
def update_vehicle(vehicle_id: str, vehicle: VehicleCreate):
    try:
        _id = ObjectId(vehicle_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid vehicle ID format")

    vehicle_data = vehicle.model_dump()
    vehicle_data["updated_at"] = datetime.now()  # Optional field for tracking

    result = vehicles_collection.update_one({"_id": _id}, {"$set": vehicle_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    return {"message": "Vehicle updated successfully"}


@router.delete("/{vehicle_id}")
def delete_vehicle(vehicle_id: str):
    try:
        _id = ObjectId(vehicle_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid vehicle ID format")

    result = vehicles_collection.delete_one({"_id": _id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    return {"message": "Vehicle deleted successfully"}
