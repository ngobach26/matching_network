from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, Literal

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
    status: Literal["active", "inactive"]
    vehicle: Vehicle

    total_rides: Optional[int] = 0
    rating_average: Optional[float] = 0.0
    rating_count: Optional[int] = 0
    created_at: Optional[datetime] = Field(default_factory=datetime.now)

    model_config = ConfigDict(arbitrary_types_allowed=True)

class DriverCreate(BaseModel):
    user_id: int
    driver_license: str
    status: Literal["active", "inactive"]
    vehicle: Vehicle

class DriverUpdate(BaseModel):
    driver_license: Optional[str] = None
    status: Optional[Literal["active", "inactive"]] = None
    vehicle: Optional[Vehicle] = None