from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel

class VehicleCreate(BaseModel):
    driver_id: int
    plate_number: str
    model: str
    color: Optional[str] = None
    capacity: int
    status: Literal["active", "inactive"]
    created_at: Optional[datetime] = None