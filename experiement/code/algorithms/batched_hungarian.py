from datetime import datetime
from typing import List, Tuple
import numpy as np
from algorithms.greedy_nearest_neighbor import GreedyNearestNeighbor
from models import Rider, Driver, City, DriverStatus
from algorithms.matching_algorithm import MatchingAlgorithm

class BatchedHungarianAlgorithm(MatchingAlgorithm):
    """Pure Python/Numpy Hungarian algorithm for assignment (no SciPy)."""
    def __init__(self):
        pass
    
    def match(self, riders: List[Rider], drivers: List[Driver], city: City, current_time: datetime) -> List[Tuple[Rider, Driver]]:
        matches = []
        available_drivers = [d for d in drivers if d.status == DriverStatus.IDLE]
        if not riders or not available_drivers:
            return matches
        
        n = len(riders)
        m = len(available_drivers)
        N = max(n, m)
        
        # Build cost matrix (pad if needed to square)
        cost_matrix = np.full((N, N), 999999.0)
        for i, rider in enumerate(riders):
            for j, driver in enumerate(available_drivers):
                pickup_time = city.get_travel_time(driver.location_id, rider.pickup_location_id)
                cost_matrix[i, j] = pickup_time
        
        # Hungarian algorithm implementation
        assignment = hungarian_algorithm(cost_matrix)
        
        # Convert assignment back to actual rider/driver pairing
        for r_idx, d_idx in assignment:
            if r_idx < n and d_idx < m and cost_matrix[r_idx, d_idx] < 999999:
                matches.append((riders[r_idx], available_drivers[d_idx]))
        
        return matches

def hungarian_algorithm(cost_matrix):
    """
    Simple implementation of the Hungarian (Munkres) algorithm for square cost matrices.
    Returns a list of (row, col) assignments.
    Reference: https://en.wikipedia.org/wiki/Hungarian_algorithm (step-by-step)
    """
    cost = cost_matrix.copy()
    n = cost.shape[0]
    # 1. Row reduction
    cost -= cost.min(axis=1)[:, np.newaxis]
    # 2. Column reduction
    cost -= cost.min(axis=0)
    # 3. Cover zeros with minimum lines
    # 4. Repeat until optimal assignment is found

    def find_zero(cost, covered_rows, covered_cols):
        for i in range(n):
            if covered_rows[i]:
                continue
            for j in range(n):
                if cost[i, j] == 0 and not covered_cols[j]:
                    return (i, j)
        return None

    mask = np.zeros_like(cost, dtype=int)  # 1 = starred zero, 2 = primed zero
    row_covered = np.zeros(n, dtype=bool)
    col_covered = np.zeros(n, dtype=bool)
    
    # Step 1: Star each zero in cost matrix if no starred zero in its row/col
    for i in range(n):
        for j in range(n):
            if cost[i, j] == 0 and not row_covered[i] and not col_covered[j]:
                mask[i, j] = 1  # Star
                row_covered[i] = True
                col_covered[j] = True
    row_covered[:] = False
    col_covered[:] = False

    # Step 2: Cover columns with starred zeros
    for j in range(n):
        if np.any(mask[:, j] == 1):
            col_covered[j] = True

    def all_columns_covered():
        return np.sum(col_covered) >= n

    # Step 3 and onward: Main loop
    while not all_columns_covered():
        # Find noncovered zero
        while True:
            found = find_zero(cost, row_covered, col_covered)
            if not found:
                # No uncovered zero: modify matrix
                minval = np.min(cost[~row_covered][:, ~col_covered])
                cost[~row_covered, :] -= minval
                cost[:, col_covered] += minval
            else:
                i, j = found
                mask[i, j] = 2  # Prime it
                star_col = np.where(mask[i, :] == 1)[0]
                if len(star_col) > 0:
                    # There is a starred zero in the row
                    row_covered[i] = True
                    col_covered[star_col[0]] = False
                else:
                    # No starred zero in row: augmenting path
                    # Build alternating sequence of primed/starred zeros
                    path = [(i, j)]
                    while True:
                        star_row = np.where(mask[:, path[-1][1]] == 1)[0]
                        if len(star_row) == 0:
                            break
                        path.append((star_row[0], path[-1][1]))
                        prime_col = np.where(mask[path[-1][0], :] == 2)[0]
                        path.append((path[-1][0], prime_col[0]))
                    # Augment path
                    for r, c in path:
                        if mask[r, c] == 1:
                            mask[r, c] = 0
                        else:
                            mask[r, c] = 1
                    # Clear covers and primes
                    row_covered[:] = False
                    col_covered[:] = False
                    mask[mask == 2] = 0
                    # Cover columns with starred zeros again
                    for j in range(n):
                        if np.any(mask[:, j] == 1):
                            col_covered[j] = True
                    break  # back to check all_columns_covered

    # Assignment: positions of starred zeros
    assignment = []
    for i in range(n):
        for j in range(n):
            if mask[i, j] == 1:
                assignment.append((i, j))
    return assignment
