import math
from typing import List, Dict, Tuple, Optional

def haversine(lat1, lon1, lat2, lon2) -> float:
    R = 6_371_000  # m
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi     = math.radians(lat2 - lat1)
    d_lambda  = math.radians(lon2 - lon1)
    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    return R * (2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)))

def build_preferences(
    riders: List[dict],
    drivers: List[dict],
    proximity_weight: float = 1.0,
    rating_weight: float = 1.0,
    price_weight: float = 0.0,
    max_distance: Optional[float] = None,
    min_driver_rating: Optional[float] = None
) -> Tuple[Dict[str, List[str]], Dict[str, List[str]]]:
    """
    Trả về (prefs_rider, prefs_driver) dạng {id: [id1,id2,...]}
    Các trọng số (weight) cho distance, rating, price, và lọc theo max_distance, min_driver_rating.
    """
    prefs_rider, prefs_driver = {}, {}
    dist = {}  # (r, d) -> mét

    # Lọc driver theo min_driver_rating nếu có
    drivers = [
        d for d in drivers
        if min_driver_rating is None or float(d.get("rating", 1.0)) >= min_driver_rating
    ]

    # Tính distance matrix một lần
    for r in riders:
        for d in drivers:
            dist[(r["id"], d["id"])] = haversine(r["lat"], r["lng"], d["lat"], d["lng"])

    # Xây bảng chi phí (cost) cho mỗi cặp
    cost_matrix = {}
    for r in riders:
        for d in drivers:
            # Lọc theo max_distance
            distance = dist[(r["id"], d["id"])]
            if max_distance is not None and distance > max_distance:
                cost = float('inf')
            else:
                # Rating: càng cao càng tốt, nên cost giảm theo rating
                driver_rating = float(d.get("rating", 1.0))
                fare = float(r.get("fare", 0.0)) if price_weight > 0.0 else 0.0
                # Cost = w1*distance + w2*(1-rating) + w3*price
                cost = (
                    proximity_weight * distance +
                    rating_weight * (1.0 - driver_rating) +
                    price_weight * fare
                )
            cost_matrix[(r["id"], d["id"])] = cost

    # Rider thích driver có cost thấp nhất
    for r in riders:
        # Loại bỏ các driver cost = inf (quá xa hoặc không đạt yêu cầu)
        ordered = sorted(
            [d for d in drivers if cost_matrix[(r["id"], d["id"])] < float('inf')],
            key=lambda d: cost_matrix[(r["id"], d["id"])]
        )
        prefs_rider[r["id"]] = [d["id"] for d in ordered]

    # Driver thích rider gần nhất (hoặc chi phí thấp nhất)
    for d in drivers:
        ordered = sorted(
            [r for r in riders if cost_matrix[(r["id"], d["id"])] < float('inf')],
            key=lambda r: cost_matrix[(r["id"], d["id"])]
        )
        prefs_driver[d["id"]] = [r["id"] for r in ordered]

    return prefs_rider, prefs_driver

def gale_shapley(
    riders: List[str],
    drivers: List[str],
    pref_r: Dict[str, List[str]],
    pref_d: Dict[str, List[str]]
) -> Dict[str, str]:
    """Trả về dict rider->driver (None nếu không match)"""
    free_riders = set(riders)
    next_proposal = {r: 0 for r in riders}     # pointer đến driver tiếp theo
    engaged: Dict[str, str] = {}               # driver -> rider

    rank_d = {d: {r: i for i, r in enumerate(pref_d[d])} for d in drivers}

    while free_riders:
        r = free_riders.pop()
        if next_proposal[r] >= len(pref_r[r]): 
            continue
        d = pref_r[r][ next_proposal[r] ]
        next_proposal[r] += 1

        if d not in engaged:              
            engaged[d] = r
        else:                            
            current_r = engaged[d]
            if rank_d[d][r] < rank_d[d][current_r]:
                engaged[d] = r            
                free_riders.add(current_r)
            else:
                free_riders.add(r)         

    # rider -> driver
    matches = {r: None for r in riders}
    for d, r in engaged.items():
        matches[r] = d
    return matches
