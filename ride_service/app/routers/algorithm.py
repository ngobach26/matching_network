from fastapi import APIRouter, HTTPException, Query
from app.redis_client import r
from pydantic import BaseModel, Field
from typing import Optional, List

ALLOWED_ALGORITHMS = ["gale_shapley", "hungarian"]

class MatchingConfig(BaseModel):
    algorithm: str = Field(..., description="Thuật toán sử dụng", example="gale_shapley")
    proximity_weight: float = Field(1.0, description="Proximity (distance) weight", ge=0.0)
    rating_weight: float = Field(1.0, description="Rating weight", ge=0.0)
    price_weight: float = Field(0.0, description="Price weight", ge=0.0)
    max_distance: Optional[float] = Field(None, description="Maximum matching distance (meters)", ge=0.0)
    matching_timeout: Optional[float] = Field(None, description="Matching timeout (seconds)", ge=0.0)
    min_driver_rating: Optional[float] = Field(None, description="Minimum driver rating", ge=0.0, le=5.0)

router = APIRouter()

@router.get("/geohash-list", response_model=List[str])
async def get_geohash_list():
    keys = await r.keys("driver:geohash:*")
    geohash_list = [key.decode().split("driver:geohash:")[1] if isinstance(key, bytes) else key.split("driver:geohash:")[1] for key in keys]
    return geohash_list

@router.put("/")
async def set_matching_config(
    config: MatchingConfig,
    geohash: str = Query(..., description="Geohash để áp dụng config")
):
    if config.algorithm not in ALLOWED_ALGORITHMS:
        raise HTTPException(status_code=400, detail="Invalid algorithm")
    await r.set(f"matching:config:{geohash}", config.model_dump_json())
    return {"status": "ok", "geohash": geohash, "config": config}

@router.get("/")
async def get_matching_config(
    geohash: str = Query(..., description="Geohash cần lấy config")
):
    val = await r.get(f"matching:config:{geohash}")
    if val:
        return {"geohash": geohash, "config": MatchingConfig.model_validate_json(val)}
    # Nếu chưa có config cho geohash này, trả về default
    return {"geohash": geohash, "config": MatchingConfig(algorithm="gale_shapley")}
