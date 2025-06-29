from typing import List, Optional
from bson import ObjectId
from pydantic import BaseModel

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        elif isinstance(v, str) and ObjectId.is_valid(v):
            return v
        raise ValueError("Invalid ObjectId")

class UserInfo(BaseModel):
    id: int
    email: str
    name: Optional[str] = None
    roles: List[str] = []
    avatar_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    phone_number: Optional[str] = None
    bio: Optional[str] = None
    date_of_birth: Optional[str] = None
    address: Optional[str] = None