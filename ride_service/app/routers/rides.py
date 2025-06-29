from typing import List, Optional
from datetime import datetime
import pygeohash as gh
from fastapi import APIRouter, HTTPException,Query,Path,Depends,Request,Body
from app.models import Ride, RideCreate, RideUpdateRequest, RatingCreate, DriverDecisionRequest
from app.database import rides_collection, drivers_collection
from bson import ObjectId
from app.state_machine.ride_state_machine import RideStateMachine
from app.redis_client import unlock_driver, sync_driver_rating
from app.kafka_client import send_ride_request_to_kafka, notify_rider_match_found,send_ride_event_to_kafka
from app.utils import parse_ride
from app.user_service_client import user_service_client
from app.models import *
from datetime import datetime, timedelta, timezone

router = APIRouter()

@router.get("/active", response_model=List[RideResponse])
async def list_active_rides(
    request: Request,
    rider_id: Optional[int] = Query(None),
    driver_id: Optional[int] = Query(None),
):
    query = {
        "status": {"$in": ["accepted", "arrived", "picked_up", "ongoing"]}
    }

    if rider_id is not None:
        query["rider_id"] = rider_id
    if driver_id is not None:
        query["driver_id"] = driver_id

    rides = list(rides_collection.find(query))

    # Lấy token từ request để truyền sang user service
    auth_header = request.headers.get("Authorization")
    
    ride_responses = []
    for ride_data in rides:
        ride = parse_ride(ride_data)
        
        # Lấy thông tin rider
        rider_info = None
        if ride.rider_id:
            try:
                rider_info_data = await user_service_client.get_user_by_id(ride.rider_id, auth_header)
                rider_info = UserInfo(**rider_info_data.get("user", {}))
            except Exception:
                rider_info = None

        # Lấy thông tin driver (nếu có)
        driver_info = None
        if ride.driver_id:
            try:
                driver_info_data = await user_service_client.get_user_by_id(ride.driver_id, auth_header)
                driver_info = UserInfo(**driver_info_data.get("user", {}))
            except Exception:
                driver_info = None

        ride_responses.append(
            RideResponse(
                ride=ride,
                rider=rider_info,
                driver=driver_info
            )
        )
    
    return ride_responses


@router.get("/{ride_id}", response_model=RideResponse)
async def get_ride(ride_id: str, request: Request):
    try:
        ride_data = rides_collection.find_one({"_id": ObjectId(ride_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ride_id")

    if not ride_data:
        raise HTTPException(status_code=404, detail="Ride not found")

    ride = parse_ride(ride_data)

    # Lấy token từ request gốc để truyền sang user service
    auth_header = request.headers.get("Authorization")
    
    # Lấy thông tin rider
    rider_info = None
    if ride.rider_id:
        try:
            rider_info_data = await user_service_client.get_user_by_id(ride.rider_id, auth_header)
            rider_info = UserInfo(**rider_info_data.get("user", {}))
        except Exception:
            # Có thể log lỗi hoặc bỏ qua nếu user service lỗi
            rider_info = None

    # Lấy thông tin driver (nếu có)
    driver_info = None
    if ride.driver_id:
        try:
            driver_info_data = await user_service_client.get_user_by_id(ride.driver_id, auth_header)
            driver_info = UserInfo(**driver_info_data.get("user", {}))
        except Exception:
            driver_info = None

    return RideResponse(
        ride=ride,
        rider=rider_info,
        driver=driver_info
    )

@router.post("/{ride_id}/status")
async def update_ride_status(
    ride_id: str,
    request: Request,
    action: str = Body(..., embed=True)
):
    try:
        ride_data = rides_collection.find_one({"_id": ObjectId(ride_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ride_id format")

    if not ride_data:
        raise HTTPException(status_code=404, detail="Ride not found")

    ride_data["_id"] = str(ride_data["_id"])
    ride = Ride(**ride_data)
    sm = RideStateMachine(ride)

    try:
        trigger = getattr(sm, action)
        trigger()
    except AttributeError:
        raise HTTPException(status_code=400, detail=f"Invalid action: {action}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    invoice_result = None

    # Lấy auth header từ request để truyền sang user_service
    auth_header = request.headers.get("Authorization")

    # Nếu ride hoàn thành, unlock driver, tạo invoice
    if ride.status == "completed" and ride.driver_id is not None:
        await unlock_driver(ride.driver_id)
        try:
            invoice_result = await user_service_client.create_invoice(ride, auth_header)
            # Set payment_status to "paid" if no error
            if not invoice_result or "error" not in invoice_result:
                ride.payment_status = "paid"
        except Exception as e:
            invoice_result = {"error": f"Could not create invoice: {str(e)}"}

    # Xử lý khi ride bị huỷ
    if ride.status == "cancelled" and ride.driver_id is not None:
        # Mở khoá tài xế nếu đã nhận chuyến
        await unlock_driver(ride.driver_id)
        # Nếu muốn, có thể gửi notification cho rider/driver tại đây

    # send event ra kafka
    send_ride_event_to_kafka(ride)

    # cập nhật mọi field đã thay đổi lên DB
    rides_collection.update_one(
        {"_id": ObjectId(ride_id)},
        {"$set": ride.dict(exclude_unset=True, exclude={"_id"})}
    )

    return {
        "ride_id": ride_id,
        "new_status": ride.status,
        "invoice_result": invoice_result
    }

@router.get("/", response_model=list[Ride])
def list_rides():
    rides = list(rides_collection.find())
    return [parse_ride(ride) for ride in rides]

@router.patch("/{ride_id}")
def update_ride(
    ride_id: str = Path(..., description="ID của chuyến đi"),
    update_data: RideUpdateRequest = Body(...)
):
    try:
        object_id = ObjectId(ride_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ride_id")

    ride = rides_collection.find_one({"_id": object_id})
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    update_fields = {
        k: v for k, v in update_data.model_dump(exclude_unset=True).items()
        if v is not None
    }

    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    rides_collection.update_one(
        {"_id": object_id},
        {"$set": update_fields}
    )

    return {
        "ride_id": ride_id,
        "updated_fields": update_fields
    }

@router.post("/", response_model=Ride)
async def match_driver(request: RideCreate):
    lat = request.pickup_location.coordinate.lat
    lng = request.pickup_location.coordinate.lng
    geohash_code = gh.encode(lat, lng, precision=4)

    ride_data = request.model_dump(exclude_unset=True)
    ride_data["geohash"] = geohash_code
    ride_data["status"] = "pending"

    result = rides_collection.insert_one(ride_data)
    ride_id = str(result.inserted_id)

    ride_data["_id"] = ride_id  
    ride_out = Ride(**ride_data) 

    send_ride_request_to_kafka(ride_out)
    return ride_out

@router.post("/{ride_id}/decision")
async def driver_decision(ride_id: str, data: DriverDecisionRequest, request: Request):
    driver_id = data.driver_id
    decision = data.accept
    try:
        ride = rides_collection.find_one({"_id": ObjectId(ride_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ride_id format")

    if not ride:
        raise HTTPException(status_code=404, detail="Ride request not found")

    rider_id = ride["rider_id"]

    if decision:
        # Update ride status and assign driver
        rides_collection.update_one(
            {"_id": ObjectId(ride_id)},
            {"$set": {
                "status": "accepted",
                "driver_id": int(driver_id),
                "matched_at": datetime.now()
            }}
        )

        # Fetch updated ride
        updated_ride = rides_collection.find_one({"_id": ObjectId(ride_id)})

        notify_rider_match_found(rider_id, ride_id)

        # Lấy token từ request gốc để truyền sang user service
        auth_header = request.headers.get("Authorization")
        
        # Lấy thông tin rider
        rider_info = None
        try:
            rider_info_data = await user_service_client.get_user_by_id(updated_ride["rider_id"], auth_header)
            rider_info = UserInfo(**rider_info_data.get("user", {}))
        except Exception:
            rider_info = None

        # Lấy thông tin driver
        driver_info = None
        try:
            driver_info_data = await user_service_client.get_user_by_id(updated_ride.get("driver_id"), auth_header)
            driver_info = UserInfo(**driver_info_data.get("user", {}))
        except Exception:
            driver_info = None

        return {
            "message": "✅ Accepted and matched",
            "ride": RideResponse(
                ride=parse_ride(updated_ride),
                rider=rider_info,
                driver=driver_info
            )
        }

    else:
        await unlock_driver(driver_id)

        # Requeue the ride to matching service
        ride["id"] = str(ride["_id"])
        ride.pop("_id", None)
        send_ride_request_to_kafka(Ride(**ride))

        return {
            "message": "🔁 Re-queued to matching service"
        }

@router.post("/{ride_id}/rating")
async def submit_rating(
    ride_id: str = Path(..., description="Ride ID"),
    rating: RatingCreate = ...
):
    # Tìm ride theo ObjectId hoặc id thường
    try:
        object_id = ObjectId(ride_id)
        ride = rides_collection.find_one({"_id": object_id}) or rides_collection.find_one({"id": ride_id})
    except Exception:
        ride = rides_collection.find_one({"id": ride_id})

    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    if ride.get("rating"):
        raise HTTPException(status_code=400, detail="Rating already submitted for this ride.")

    rating_data = {
        "rating": rating.rating,
        "comment": rating.comment,
        "created_at": rating.created_at,
    }

    # Update rating cho ride
    rides_collection.update_one(
        {"_id": ride["_id"]},
        {"$set": {"rating": rating_data}}
    )

    driver_id = ride.get("driver_id")
    if not driver_id:
        raise HTTPException(status_code=400, detail="Driver not found in ride.")

    driver = drivers_collection.find_one({"user_id": driver_id})
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    current_avg = driver.get("rating_average")
    if current_avg is None:
        current_avg = 0.0

    current_count = driver.get("rating_count")
    if current_count is None:
        current_count = 0


    # Cập nhật lại giá trị trung bình và số lượt lên MongoDB
    new_total = current_avg * current_count + rating.rating
    new_count = current_count + 1
    new_avg = round(new_total / new_count, 2)

    drivers_collection.update_one(
        {"user_id": driver_id},
        {"$set": {
            "rating_average": new_avg,
            "rating_count": new_count
        }}
    )

    # --- Cập nhật trực tiếp vào Redis ---
    await sync_driver_rating(driver_id, new_avg, new_count)

    return {"message": "Rating submitted successfully"}

@router.get("/driver/{driver_id}", response_model=List[Ride])
def get_rides_by_driver(driver_id: int):
    rides = list(rides_collection.find({"driver_id": driver_id}))
    return [parse_ride(ride) for ride in rides] 

@router.get("/rider/{rider_id}", response_model=List[Ride])
def get_rides_by_rider(rider_id: int):
    rides = list(rides_collection.find({"rider_id": rider_id}))
    return [parse_ride(ride) for ride in rides]

@router.get("/driver/{driver_id}/earning/today")
def driver_earning_today(driver_id: int):
    now = datetime.now(timezone.utc).astimezone()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)

    # Query các chuyến đã hoàn thành và đã trả tiền hôm nay
    rides = list(rides_collection.find({
        "driver_id": driver_id,
        "status": "completed",
        "end_at": {
            "$gte": today_start,
            "$lt": today_end
        }
    }))

    # Tổng hợp earnings
    total_earning = 0.0
    ride_count = 0

    for ride in rides:
        fare = ride.get("fare", {})
        earning = fare.get("driver_earnings", 0)
        total_earning += earning
        ride_count += 1

    return {
        "driver_id": driver_id,
        "date": today_start.date().isoformat(),
        "ride_count": ride_count,
        "total_earning": total_earning
    }