from datetime import datetime
from typing import Optional,Literal
from pydantic import BaseModel, Field

class RideDetail(BaseModel):
    id: str
    rider_id: int 
    driver_id: int
    status: Literal["accepted", "arrived", "picked_up", "ongoing", "completed", "cancelled"]
    created_at: Optional[datetime]
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    estimated_fare: Optional[float] = None
    actual_fare: Optional[float] = None
    estimated_distance_km: Optional[float] = None
    actual_distance_km: Optional[float] = None
    estimated_duration_min: Optional[int] = None
    actual_duration_min: Optional[int] = None

class RideCreate(BaseModel):
    request_id: int
    driver_id: int
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    distance_km: float
    duration_min: int
    fare: float
    status: Literal["ongoing", "completed", "cancelled"]
    created_at: Optional[datetime] = None