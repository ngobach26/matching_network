from dataclasses import dataclass
from typing import Any

@dataclass
class RideMatchingRequest:
    ride_id: str
    rider_id: int
    geohash: str
    lat: float
    lng: float
    ride_type: str
    fare: Any
    requested_at: str  # ISO format string

    # Bạn có thể thêm field nếu muốn
