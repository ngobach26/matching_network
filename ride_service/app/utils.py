from typing import Literal
from app.models import Fare
from app.models.ride import Ride

PRICING_RULES = {
    "bike":    {"base_fare": 10000, "per_km": 4000, "platform_fee": 3000},
    "car":     {"base_fare": 15000, "per_km": 8000, "platform_fee": 5000},
    "premium": {"base_fare": 30000, "per_km": 15000, "platform_fee": 8000},
}

def calculate_fare(
    ride_type: Literal["bike", "car", "premium"],
    estimated_distance: float,
    estimated_duration: float,
    surge_multiplier: float = 1.0,
) -> Fare:
    if ride_type not in PRICING_RULES:
        raise ValueError(f"Unsupported ride type: {ride_type}")

    rule = PRICING_RULES[ride_type]
    base = rule["base_fare"]
    per_km = rule["per_km"]
    platform_fee = rule["platform_fee"]

    distance_fare = per_km * max(estimated_distance, 1.0)
    subtotal = (base + distance_fare) * surge_multiplier
    driver_earnings = subtotal - platform_fee

    return Fare(
        base_fare=base,
        distance_fare=distance_fare,
        time_fare=0.0,
        surge_multiplier=surge_multiplier,
        platform_fee=platform_fee,
        total_fare=subtotal,
        driver_earnings=driver_earnings,
    )

def parse_ride(doc: dict) -> Ride:
    doc["_id"] = str(doc["_id"])
    return Ride(**doc)