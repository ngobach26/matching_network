from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, Literal
from bson import ObjectId
from uuid import UUID

from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, source, handler):
        from pydantic_core import core_schema

        return core_schema.json_or_python_schema(
            python_schema=core_schema.no_info_plain_validator_function(cls.validate),
            json_schema=core_schema.str_schema(),
            serialization=core_schema.plain_serializer_function_ser_schema(str)
        )

    @classmethod
    def validate(cls, value):
        if isinstance(value, ObjectId):
            return value
        try:
            return ObjectId(str(value))
        except Exception:
            raise ValueError("Invalid ObjectId")
        
# Coordinates model to represent POINT geometry
class Coordinates(BaseModel):
    lat: float
    lng: float


# Rider table
class RiderCreate(BaseModel):
    user_id: int
    license_number: str
    payment_method: str
    created_at: Optional[datetime] = None


# Driver table
class DriverCreate(BaseModel):
    user_id: int
    vehicle_id: PyObjectId
    driver_license: str
    rating_average: float
    status: Literal["active", "inactive"]
    created_at: Optional[datetime] = None

    model_config = ConfigDict(arbitrary_types_allowed=True)


class DriverOut(BaseModel):
    id: PyObjectId = Field(alias="_id")
    user_id: int
    vehicle_id: PyObjectId
    driver_license: str
    rating_average: float
    status: Literal["active", "inactive"]
    created_at: Optional[datetime] = None

    model_config = {
        "populate_by_name": True,
        "json_encoders": {
            ObjectId: str
        }
    }


# Vehicle table
class VehicleCreate(BaseModel):
    driver_user_id: int
    plate_number: str
    model: str
    color: Optional[str] = None
    capacity: int
    status: Literal["active", "inactive"]
    created_at: Optional[datetime] = None


# Driver location table
class DriverLocationCreate(BaseModel):
    driver_user_id: int
    location: Coordinates
    updated_at: datetime


# Match API models
class MatchRequest(BaseModel):
    rider_id: int
    pickup_location: Coordinates
    dropoff_location: Coordinates


class MatchResponse(BaseModel):
    rider_id: int
    driver_id: int
    estimated_distance_km: float
    status: Literal["matched"]
    matched_at: datetime


# Ride request table
class RideRequestCreate(BaseModel):
    rider_user_id: int
    pickup_location: Coordinates
    dropoff_location: Coordinates
    requested_at: datetime
    status: Literal["pending", "matched", "cancelled"]
    created_at: Optional[datetime] = None


# Ride table
class RideCreate(BaseModel):
    request_id: int
    driver_user_id: int
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    distance_km: float
    duration_min: int
    fare: float
    status: Literal["ongoing", "completed", "cancelled"]
    created_at: Optional[datetime] = None


# Payment table
class PaymentCreate(BaseModel):
    ride_id: int
    amount: float
    method: Literal["card", "cash", "wallet"]
    status: Literal["pending", "paid", "failed"]
    paid_at: Optional[datetime] = None


# Rating table
class RatingCreate(BaseModel):
    rater_user_id: int
    ratee_user_id: int
    target_type: Literal["ride"]
    target_id: int
    score: int
    comment: Optional[str] = None
    created_at: Optional[datetime] = None
