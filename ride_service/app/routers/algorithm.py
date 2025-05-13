from fastapi import APIRouter, HTTPException
from app.redis_client import r
from pydantic import BaseModel, Field
ALLOWED_ALGORITHMS = ["gale_shapley"]

class MatchingConfig(BaseModel):
    algorithm: str = Field(..., description="Thuật toán sử dụng", example="gale_shapley")


router = APIRouter()

@router.put("/")
async def set_matching_algorithm(config: MatchingConfig):
    if config.algorithm not in ALLOWED_ALGORITHMS:
        raise HTTPException(status_code=400, detail="Invalid algorithm")
    await r.set("matching:algorithm", config.model_dump_json())
    return {"status": "ok", "algorithm": config.model_dump_json()}

@router.get("/")
def get_matching_algorithm():
    return {"algorithm": r.get("matching:algorithm") or "gale_shapley"}
