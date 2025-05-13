from datetime import datetime
from typing import List, Tuple, Dict
import numpy as np
from scipy.optimize import linear_sum_assignment
from algorithms.greedy_nearest_neighbor import GreedyNearestNeighbor
from models import Rider, Driver, City, DriverStatus
from algorithms.matching_algorithm import MatchingAlgorithm

class DensityHungarianAlgorithm(MatchingAlgorithm):
    """Implementation of the Hungarian algorithm for optimal assignment with density weighting"""
    
    def __init__(self, 
                 max_pickup_time: float = 15.0, 
                 density_weight: float = 0.2, 
                 density_zones: Dict[str, float] = None):
        """
        Initialize with constraints and density parameters
        
        Args:
            max_pickup_time: Maximum acceptable pickup time in minutes
            density_weight: Weight for zone importance in matching
            density_zones: Dictionary of zone IDs to their density/importance scores
        """
        self.max_pickup_time = max_pickup_time
        self.density_weight = density_weight
        self.density_zones = density_zones or {}
        
        # Identify the most central zone if density zones are provided
        self.most_central_zone = max(self.density_zones, key=self.density_zones.get) if self.density_zones else None
    
    def match(self, riders: List[Rider], drivers: List[Driver], city: City, current_time: datetime) -> List[Tuple[Rider, Driver]]:
        matches = []
        available_drivers = [d for d in drivers if d.status == DriverStatus.IDLE]
        
        if not riders or not available_drivers:
            return matches
            
        # Build cost matrix
        cost_matrix = np.zeros((len(riders), len(available_drivers)))
        
        for i, rider in enumerate(riders):
            for j, driver in enumerate(available_drivers):
                # Calculate pickup time
                pickup_time = city.get_travel_time(driver.location_id, rider.pickup_location_id)
                
                # Calculate zone importance score
                driver_zone_importance = self.density_zones.get(driver.location_id, 0)
                rider_zone_importance = self.density_zones.get(rider.dropoff_location_id, 0)
                zone_score = driver_zone_importance * rider_zone_importance
                
                # If pickup time exceeds max, set high cost
                if pickup_time > self.max_pickup_time:
                    cost_matrix[i, j] = 999999
                else:
                    # Combine pickup time with density-based scoring
                    # Lower cost means better match
                    cost_matrix[i, j] = (
                        pickup_time * (1 - self.density_weight) + 
                        zone_score * self.density_weight
                    )
        
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