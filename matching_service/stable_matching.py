"""
stable_matching.py
------------------
Cài đặt Gale–Shapley (Stable Matching) cho rider–driver.
Preference của rider = khoảng cách tăng dần.
Preference của driver  = khoảng cách tăng dần (có thể thay đổi theo rating, …).
"""
import math
from typing import List, Dict, Tuple

# ---------- Haversine ----------
def haversine(lat1, lon1, lat2, lon2) -> float:
    R = 6_371_000  # m
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi     = math.radians(lat2 - lat1)
    d_lambda  = math.radians(lon2 - lon1)
    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    return R * (2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)))

# ---------- Build preference ----------
def build_preferences(riders: List[dict],
                      drivers: List[dict]
                     ) -> Tuple[Dict[str, List[str]], Dict[str, List[str]]]:
    """Trả về (prefs_rider, prefs_driver) dạng {id: [id1,id2,...]}"""
    prefs_rider, prefs_driver = {}, {}
    # tính distance matrix một lần
    dist = {}  # (r, d) -> mét
    for r in riders:
        for d in drivers:
            dist[(r["id"], d["id"])] = haversine(r["lat"], r["lng"], d["lat"], d["lng"])

    # rider thích driver gần
    for r in riders:
        ordered = sorted(drivers, key=lambda d: dist[(r["id"], d["id"])])
        prefs_rider[r["id"]] = [d["id"] for d in ordered]

    # driver thích rider gần
    for d in drivers:
        ordered = sorted(riders, key=lambda r: dist[(r["id"], d["id"])])
        prefs_driver[d["id"]] = [r["id"] for r in ordered]

    return prefs_rider, prefs_driver

# ---------- Gale‑Shapley ----------
def gale_shapley(riders: List[str],
                 drivers: List[str],
                 pref_r: Dict[str, List[str]],
                 pref_d: Dict[str, List[str]]
                ) -> Dict[str, str]:
    """Trả về dict rider->driver (None nếu không match)"""
    free_riders = set(riders)
    next_proposal = {r: 0 for r in riders}     # pointer đến driver tiếp theo
    engaged: Dict[str, str] = {}               # driver -> rider

    # driver ranking (để so sánh nhanh)
    rank_d = {d: {r: i for i, r in enumerate(pref_d[d])} for d in drivers}

    while free_riders:
        r = free_riders.pop()
        if next_proposal[r] >= len(pref_r[r]):  # đã cầu hôn hết
            continue
        d = pref_r[r][ next_proposal[r] ]
        next_proposal[r] += 1

        if d not in engaged:               # driver còn trống
            engaged[d] = r
        else:                              # driver đã có người
            current_r = engaged[d]
            if rank_d[d][r] < rank_d[d][current_r]:
                engaged[d] = r             # driver thích rider mới hơn
                free_riders.add(current_r)
            else:
                free_riders.add(r)         

    # rider -> driver
    matches = {r: None for r in riders}
    for d, r in engaged.items():
        matches[r] = d
    return matches
