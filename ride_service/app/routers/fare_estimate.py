from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict
from app.models import Fare

router = APIRouter()

class FareEstimateInput(BaseModel):
    estimated_distance: float
    estimated_duration: float

@router.post("/", response_model=Dict[str, Fare])
async def fare_estimate(data: FareEstimateInput):
    pricing_rules = {
        "bike":    {"base_fare": 10000, "per_km": 4000, "platform_fee": 3000},
        "car":     {"base_fare": 15000, "per_km": 8000, "platform_fee": 5000},
        "premium": {"base_fare": 30000, "per_km": 15000, "platform_fee": 8000},
    }

    estimates: Dict[str, Fare] = {}

    for ride_type, rule in pricing_rules.items():
        base = rule["base_fare"]
        distance_fare = rule["per_km"] * max(data.estimated_distance, 1.0)
        platform_fee = rule["platform_fee"]

        subtotal = base + distance_fare
        total = subtotal
        driver_earnings = total - platform_fee

        estimates[ride_type] = Fare(
            base_fare=base,
            distance_fare=distance_fare,
            time_fare=0.0,
            platform_fee=platform_fee,
            total_fare=total,
            driver_earnings=driver_earnings,
        )

    return estimates


