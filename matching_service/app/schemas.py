from pydantic import BaseModel
from typing import List, Optional

class User(BaseModel):
    id: str
    name: str
    preferences: dict

class MatchRequest(BaseModel):
    user_id: str
    target_type: str  # "user" or "service"
    criteria: dict  # Matching criteria
