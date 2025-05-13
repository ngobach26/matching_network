from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

class RideRating(BaseModel):
    ride_id: str             # Which trip this belongs to
    rider_id: int                # Who rated
    driver_id: int                  # Who got rated (driver or rider)
    rating: int                      # Usually 1–5
    comment: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
