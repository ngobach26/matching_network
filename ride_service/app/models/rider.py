from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class RiderCreate(BaseModel):
    user_id: int
    license_number: str
    payment_method: str
    created_at: Optional[datetime] = None