from datetime import datetime
from typing import Optional,Literal
from pydantic import BaseModel, Field
from app.models.common import Coordinates

class RideRequestCreate(BaseModel):
    rider_id: int
    pickup_location: Coordinates
    dropoff_location: Coordinates
    estimated_fare: float
    estimated_distance: float
    requested_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    ride_type: Optional[Literal["bike", "car", "premium"]] = "car"

class RideRequestResponse(BaseModel):
    id: str
    rider_id: int
    status: Literal["pending", "matched", "cancelled"]
    created_at: Optional[datetime] = None


class RideRequestDetail(BaseModel):
    id: str
    rider_id: int
    pickup_location: Coordinates
    dropoff_location: Coordinates
    estimated_fare: float
    estimated_distance: float
    geohash: str
    ride_type: Optional[Literal["bike", "car", "premium"]]
    status: Literal["pending", "matched", "cancelled"]
    cancelled_by: Optional[Literal["rider", "driver","system"]] = None
    driver_id: Optional[int] = None
    cancellation_reason: Optional[str] = None
    requested_at: Optional[datetime]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

class RideRequestDecision(BaseModel):
    driver_id: int
    accept: bool