from fastapi import APIRouter
from pydantic import BaseModel
import math
from app.models.common import Coordinates

router = APIRouter()

class FareEstimateInput(BaseModel):
    pickup_location: Coordinates
    dropoff_location: Coordinates

@router.post("/")
async def fare_estimate(data: FareEstimateInput):
    distance_km = haversine_km(
        data.pickup_location.lat, data.pickup_location.lng,
        data.dropoff_location.lat, data.dropoff_location.lng
    )

    pricing_rules = {
        "bike":    {"base_fare": 10000, "per_km": 4000},
        "car":     {"base_fare": 15000, "per_km": 8000},
        "premium": {"base_fare": 30000, "per_km": 15000},
    }

    estimates = {}
    for ride_type, rule in pricing_rules.items():
        fare = rule["base_fare"] + rule["per_km"] * max(distance_km, 1.0)
        estimates[ride_type] = round(fare)

    return {
        "estimated_fares": estimates,
        "estimated_distance": round(distance_km, 2)
    }

def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    return R * (2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)))
