"""
hungarian.py - Implementation of the Hungarian algorithm for optimal bipartite matching
with weights and filters.
"""

import numpy as np
from typing import Dict, List, Tuple, Any, Optional
import math


def haversine(lat1, lon1, lat2, lon2) -> float:
    R = 6_371_000  # m
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi     = math.radians(lat2 - lat1)
    d_lambda  = math.radians(lon2 - lon1)
    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    return R * (2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)))

def hungarian_algorithm(cost_matrix: np.ndarray) -> Tuple[List[Tuple[int, int]], float]:
    """
    Implementation of the Hungarian algorithm for optimal assignment problems.
    Args:
        cost_matrix: A numpy array where cost_matrix[i,j] is the cost of assigning
                     rider i to driver j. 
    Returns:
        A tuple containing:
        - A list of (row_idx, col_idx) pairs indicating the optimal assignments
        - The total cost of the assignment
    """
    original_cost_matrix = cost_matrix.copy()
    cost_matrix = cost_matrix.copy()
    n_rows, n_cols = cost_matrix.shape

    # Step 1: Row reduction
    for i in range(n_rows):
        min_val = np.min(cost_matrix[i, :])
        cost_matrix[i, :] -= min_val

    # Step 2: Column reduction
    for j in range(n_cols):
        min_val = np.min(cost_matrix[:, j])
        cost_matrix[:, j] -= min_val

    row_covered = np.zeros(n_rows, dtype=bool)
    col_covered = np.zeros(n_cols, dtype=bool)
    starred = np.zeros((n_rows, n_cols), dtype=bool)
    primed = np.zeros((n_rows, n_cols), dtype=bool)

    # Step 3: Star zeros
    for i in range(n_rows):
        for j in range(n_cols):
            if cost_matrix[i, j] == 0 and not row_covered[i] and not col_covered[j]:
                starred[i, j] = True
                row_covered[i] = True
                col_covered[j] = True

    row_covered[:] = False
    col_covered[:] = False

    # Step 4: Cover columns with starred zeros
    for j in range(n_cols):
        if np.any(starred[:, j]):
            col_covered[j] = True

    while not np.all(col_covered[:n_cols]):
        zero_found = False
        for i in range(n_rows):
            if row_covered[i]:
                continue
            for j in range(n_cols):
                if cost_matrix[i, j] == 0 and not col_covered[j]:
                    primed[i, j] = True
                    # Find starred zero in this row
                    starred_col = -1
                    for j2 in range(n_cols):
                        if starred[i, j2]:
                            starred_col = j2
                            break
                    if starred_col == -1:
                        # No starred zero in this row, augment path
                        zero_found = True
                        path = [(i, j)]
                        while True:
                            # Find starred zero in this column
                            row = -1
                            col = path[-1][1]
                            for i2 in range(n_rows):
                                if starred[i2, col]:
                                    row = i2
                                    break
                            if row == -1:
                                break
                            path.append((row, col))
                            # Find primed zero in this row
                            col = -1
                            row = path[-1][0]
                            for j2 in range(n_cols):
                                if primed[row, j2]:
                                    col = j2
                                    break
                            path.append((row, col))
                        # Convert path
                        for r, c in path:
                            starred[r, c] = not starred[r, c]
                        primed[:] = False
                        row_covered[:] = False
                        col_covered[:] = False
                        # Cover columns with starred zeros
                        for j2 in range(n_cols):
                            for i2 in range(n_rows):
                                if starred[i2, j2]:
                                    col_covered[j2] = True
                                    break
                        break
                    else:
                        row_covered[i] = True
                        col_covered[starred_col] = False
                    break
            if zero_found:
                break
        if not zero_found:
            # Update cost_matrix with minimum uncovered value
            min_val = float('inf')
            for i in range(n_rows):
                if row_covered[i]:
                    continue
                for j in range(n_cols):
                    if col_covered[j]:
                        continue
                    min_val = min(min_val, cost_matrix[i, j])
            for i in range(n_rows):
                if row_covered[i]:
                    cost_matrix[i, :] += min_val
            for j in range(n_cols):
                if not col_covered[j]:
                    cost_matrix[:, j] -= min_val

    # Extract assignment
    assignment = []
    for i in range(n_rows):
        for j in range(n_cols):
            if starred[i, j]:
                assignment.append((i, j))
    total_cost = sum(original_cost_matrix[row, col] for row, col in assignment)
    return assignment, total_cost

def hungarian_matching(
    riders: List[Dict[str, Any]],
    drivers: List[Dict[str, Any]],
    proximity_weight: float = 1.0,
    rating_weight: float = 1.0,
    price_weight: float = 0.0,
    max_distance: Optional[float] = None,
    min_driver_rating: Optional[float] = None
) -> Dict[str, str]:
    """
    Hungarian algorithm with support for weights and filtering.
    Args:
        riders: list of rider dicts, required keys: 'id', 'lat', 'lng', optionally 'fare'
        drivers: list of driver dicts, required keys: 'id', 'lat', 'lng', optionally 'rating'
    Returns:
        rider_id -> driver_id dict
    """
    if not riders or not drivers:
        return {}
    # Filter drivers theo min_driver_rating nếu có
    drivers = [
        d for d in drivers
        if min_driver_rating is None or float(d.get("rating", 1.0)) >= min_driver_rating
    ]
    n_riders = len(riders)
    n_drivers = len(drivers)
    max_dim = max(n_riders, n_drivers)
    cost_matrix = np.full((max_dim, max_dim), float('inf'))

    for i, rider in enumerate(riders):
        for j, driver in enumerate(drivers):
            r_lat, r_lng = rider['lat'], rider['lng']
            d_lat, d_lng = driver['lat'], driver['lng']
            distance = haversine(r_lat, r_lng, d_lat, d_lng)
            # Nếu có max_distance thì filter
            if max_distance is not None and distance > max_distance:
                continue  # cost_matrix[i, j] đã là inf
            driver_rating = float(driver.get('rating', 1.0))
            fare = float(rider.get('fare', 0.0)) if price_weight > 0.0 else 0.0
            cost = (
                proximity_weight * distance +
                rating_weight * (1.0 - driver_rating) +
                price_weight * fare
            )
            cost_matrix[i, j] = cost

    assignments, total_cost = hungarian_algorithm(cost_matrix)
    matches = {}
    for row, col in assignments:
        if row < n_riders and col < n_drivers:
            if cost_matrix[row, col] != float('inf'):
                matches[riders[row]['id']] = drivers[col]['id']
    return matches
