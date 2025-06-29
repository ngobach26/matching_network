from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, Literal
from app.models.common import UserInfo

class Vehicle(BaseModel):
    vehicle_type: Literal["bike", "car", "premium"]
    brand: str
    model: str
    plate_number: str
    capacity: int
    color: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.now)

class Driver(BaseModel):
    user_id: int
    driver_license: str
    status: Literal[
        "pending",
        "active",         
        "rejected",
        "info_required",
        "inactive"
    ]
    vehicle: Vehicle

    total_rides: Optional[int] = 0
    rating_average: Optional[float] = 0.0
    rating_count: Optional[int] = 0
    created_at: Optional[datetime] = Field(default_factory=datetime.now)

    model_config = ConfigDict(arbitrary_types_allowed=True)

class DriverCreate(BaseModel):
    user_id: int
    driver_license: str
    vehicle: Vehicle

class DriverUpdate(BaseModel):
    driver_license: Optional[str] = None
    status: Optional[Literal[
        "active", 
        "inactive", 
        "pending", 
        "rejected", 
        "info_required"
    ]] = None
    vehicle: Optional[Vehicle] = None


class DriverStatusUpdate(BaseModel):
    new_status: str

class VehicleOut(BaseModel):
    vehicle_type: Literal["bike", "car", "premium"]
    brand: str
    model: str
    plate_number: str
    capacity: int
    color: Optional[str] = None
    created_at: Optional[datetime] = None

class DriverOut(BaseModel):
    user_id: int
    driver_license: str
    status: Literal[
        "pending",
        "active",        
        "rejected",
        "info_required",
        "inactive"
    ]
    vehicle: VehicleOut

    total_rides: int = 0
    rating_average: float = 0.0
    rating_count: int = 0
    created_at: Optional[datetime] = None

class DriverDetail(BaseModel):
    driver: Driver
    user: Optional[UserInfo]