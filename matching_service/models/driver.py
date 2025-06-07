from dataclasses import dataclass
from typing import Optional

@dataclass
class Driver:
    id: int
    lat: float
    lng: float
    rating: Optional[float] = 4.0  # default 1.0 nếu không có rating
    # Có thể thêm field khác nếu cần
