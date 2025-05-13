from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, Literal
from bson import ObjectId
from uuid import UUID

from bson import ObjectId
from app.models.common import PyObjectId

class DriverCreate(BaseModel):
    user_id: int
    vehicle_id: PyObjectId
    driver_license: str
    rating_average: Optional[float] = 0.0
    rating_count: Optional[int] = 0
    status: Literal["active", "inactive"]
    created_at: Optional[datetime] = None

    model_config = ConfigDict(arbitrary_types_allowed=True)


class DriverOut(BaseModel):
    id: PyObjectId = Field(alias="_id")
    user_id: int
    vehicle_id: PyObjectId
    driver_license: str
    rating_average: float
    status: Literal["active", "inactive"]
    created_at: Optional[datetime] = None

    model_config = {
        "populate_by_name": True,
        "json_encoders": {
            ObjectId: str
        }
    }