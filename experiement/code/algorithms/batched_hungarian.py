from datetime import datetime
from typing import List, Tuple
import numpy as np
from algorithms.greedy_nearest_neighbor import GreedyNearestNeighbor
from models import Rider, Driver, City, DriverStatus
from algorithms.matching_algorithm import MatchingAlgorithm

class BatchedHungarianAlgorithm(MatchingAlgorithm):
    """Implementation of the Hungarian algorithm for optimal assignment"""
    
    def __init__(self):
        """
        Initialize with constraints
        """
    
    def match(self, riders: List[Rider], drivers: List[Driver], city: City, current_time: datetime) -> List[Tuple[Rider, Driver]]:
        from scipy.optimize import linear_sum_assignment
        
        matches = []
        available_drivers = [d for d in drivers if d.status == DriverStatus.IDLE]
        
        if not riders or not available_drivers:
            return matches
            
        # Build cost matrix
        cost_matrix = np.zeros((len(riders), len(available_drivers)))
        
        for i, rider in enumerate(riders):
            for j, driver in enumerate(available_drivers):
                pickup_time = city.get_travel_time(driver.location_id, rider.pickup_location_id)
                cost_matrix[i, j] = pickup_time
        
        # Solve assignment problem
        try:
            rider_indices, driver_indices = linear_sum_assignment(cost_matrix)
            
            # Create matches where cost is acceptable
            for r_idx, d_idx in zip(rider_indices, driver_indices):
                if cost_matrix[r_idx, d_idx] < 999999:
                    matches.append((riders[r_idx], available_drivers[d_idx]))
                    
        except ValueError:
            # Fallback to greedy if optimization fails
            return GreedyNearestNeighbor().match(riders, drivers, city, current_time)
            
        return matches