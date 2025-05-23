from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field, ConfigDict

class Coordinates(BaseModel):
    lat: float
    lng: float

class Rating(BaseModel):
    rating: int
    comment: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)  

class Location(BaseModel):
    coordinate: Coordinates
    name: str
    @property
    def lat(self):
        return self.coordinate.lat

    @property
    def lng(self):
        return self.coordinate.lng

class Fare(BaseModel):
    base_fare: float
    distance_fare: float
    platform_fee: float
    total_fare: float
    driver_earnings: float
    time_fare: Optional[float] = Field(default=0.0)
    surge_multiplier: Optional[float] = Field(default=1.0)
    currency: Optional[str] = Field(default="VND")

class Ride(BaseModel):
    id: str = Field(alias="_id")
    rider_id: int
    pickup_location: Location
    dropoff_location: Location
    fare: Fare
    ride_type: Literal["bike", "car", "premium"]
    estimated_duration: float
    estimated_distance: float
    geohash: str

    status: Literal[
        "pending", "accepted", "arrived", "picked_up", "ongoing", "completed", "cancelled"
    ] = "pending"

    cancellation_reason: Optional[str] = None
    cancelled_by: Optional[Literal["rider", "driver", "system"]] = None
    payment_status: Literal["unpaid", "paid"] = "unpaid"

    created_at: datetime = Field(default_factory=datetime.now)
    matched_at: Optional[datetime] = None
    arrived_at: Optional[datetime] = None
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None

    driver_id: Optional[int] = None
    rating: Optional[Rating] = None
    distance: Optional[float] = None
    model_config = ConfigDict(populate_by_name=True)

class RideCreate(BaseModel):
    rider_id: int
    pickup_location: Location
    dropoff_location: Location
    fare: Fare
    ride_type: Literal["bike", "car", "premium"]
    estimated_duration: float
    estimated_distance: float
    created_at: datetime = Field(default_factory=datetime.now)

class RatingCreate(BaseModel):
    rating: int
    comment: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)

class RideUpdateRequest(BaseModel):
    driver_id: Optional[int] = None
    status: Optional[Literal["accepted", "arrived", "picked_up", "ongoing", "completed", "cancelled"]] = None
    payment_status: Optional[Literal["paid", "unpaid"]] = None
    cancellation_reason: Optional[str] = None
    cancelled_by: Optional[Literal["rider", "driver", "system"]] = None
    geohash: Optional[str] = None

class DriverDecisionRequest(BaseModel):
    driver_id: str
    accept: bool