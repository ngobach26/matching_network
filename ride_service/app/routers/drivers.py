from fastapi import APIRouter, HTTPException, status, Body, Request
from datetime import datetime
from typing import List
from app.models import *
from app.database import drivers_collection
from app.state_machine.driver_state_machine import DriverStateMachine
from app.user_service_client import user_service_client

router = APIRouter()


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_driver(driver: DriverCreate):
    existing = drivers_collection.find_one({"user_id": driver.user_id})
    if existing:
        raise HTTPException(status_code=400, detail="Driver with this user_id already exists")

    data = driver.model_dump()
    data["created_at"] = datetime.utcnow()
    data["status"] = "pending"  
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

@router.get("/detail/{user_id}", response_model=DriverDetail)
async def get_driver_detail(user_id: int, request: Request):
    driver = drivers_collection.find_one({"user_id": user_id})
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    driver["_id"] = str(driver.get("_id"))

    # Lấy thông tin user từ user service
    auth_header = request.headers.get("Authorization")
    user_info = None
    try:
        user_data = await user_service_client.get_user_by_id(user_id, auth_header)
        user_info = UserInfo(**user_data.get("user", {}))
    except Exception:
        user_info = None  # Có thể log lỗi ở đây

    return DriverDetail(
        driver=Driver(**driver),
        user=user_info
    )


@router.put("/{user_id}")
def update_driver(user_id: int, driver: DriverUpdate):
    data = driver.model_dump(exclude_unset=True)
    data.pop("created_at", None)  
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

@router.post("/{user_id}/update_status")
def update_driver_status(
    user_id: int,
    status_update: DriverStatusUpdate = Body(...)
):
    driver_data = drivers_collection.find_one({"user_id": user_id})
    if not driver_data:
        raise HTTPException(404, "Driver not found")
    driver_data["_id"] = str(driver_data.get("_id"))
    driver = Driver(**driver_data)

    sm = DriverStateMachine(driver)
    new_status = status_update.new_status

    status_trigger_map = {
        "active": sm.activate,          
        "rejected": sm.reject,
        "info_required": sm.request_info,
        "pending": sm.resubmit_info,
        "inactive": sm.deactivate,
    }

    trigger_func = status_trigger_map.get(new_status)
    if not trigger_func:
        raise HTTPException(400, f"Invalid Status: {new_status}")

    try:
        trigger_func()
    except Exception as e:
        raise HTTPException(400, f"Update Status failed: {str(e)}")

    update_data = {"status": driver.status}
    drivers_collection.update_one({"user_id": user_id}, {"$set": update_data})

    return {"updated": True}
