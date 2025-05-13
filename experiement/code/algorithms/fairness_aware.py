from datetime import datetime
from typing import List, Tuple
import numpy as np
from algorithms.greedy_nearest_neighbor import GreedyNearestNeighbor
from models import Rider, Driver, City, DriverStatus
from algorithms.matching_algorithm import MatchingAlgorithm

class FairnessAwareMatching(MatchingAlgorithm):
    """Matching algorithm that considers driver fairness in addition to efficiency"""
    
    def __init__(self, fairness_weight: float = 0.3, efficiency_weight: float = 0.7, 
                 max_pickup_time: float = 15.0, income_lookback: int = 30):
        """
        Initialize with weights for multi-objective optimization
        
        Args:
            fairness_weight: Weight for fairness term (0-1)
            efficiency_weight: Weight for efficiency term (0-1)
            max_pickup_time: Maximum acceptable pickup time in minutes
            income_lookback: Number of past trips to consider for income fairness
        """
        self.fairness_weight = fairness_weight
        self.efficiency_weight = efficiency_weight
        self.max_pickup_time = max_pickup_time
        self.income_lookback = income_lookback
        
    def match(self, riders: List[Rider], drivers: List[Driver], city: City, current_time: datetime) -> List[Tuple[Rider, Driver]]:
        from scipy.optimize import linear_sum_assignment
        
        matches = []
        available_drivers = [d for d in drivers if d.status == DriverStatus.IDLE]
        
        if not riders or not available_drivers:
            return matches
        
        # Calculate income inequality factor for each driver
        # Lower value = driver has earned less than average
        mean_earnings = np.mean([d.total_earnings for d in available_drivers]) if available_drivers else 0
        std_earnings = np.std([d.total_earnings for d in available_drivers]) if available_drivers else 1
        
        income_factors = {}
        for driver in available_drivers:
            if std_earnings > 0:
                # Normalize earnings to z-score
                z_score = (driver.total_earnings - mean_earnings) / std_earnings
                # Transform to 0-1 range where 0 = lowest earner
                income_factors[driver.driver_id] = 1 / (1 + np.exp(-z_score))  # Sigmoid function
            else:
                income_factors[driver.driver_id] = 0.5
            
        # Build multi-objective cost matrix
        cost_matrix = np.zeros((len(riders), len(available_drivers)))
        
        for i, rider in enumerate(riders):
            for j, driver in enumerate(available_drivers):
                # Efficiency component: pickup time
                pickup_time = city.get_travel_time(driver.location_id, rider.pickup_location_id)
                if pickup_time > self.max_pickup_time:
                    cost_matrix[i, j] = 999999  # Disallow match
                    continue
                
                # Normalize pickup time to 0-1 range assuming max time is benchmark
                efficiency_cost = pickup_time / self.max_pickup_time
                
                # Fairness component: prioritize drivers with lower earnings
                fairness_cost = income_factors[driver.driver_id]
                
                # Combined cost function
                cost_matrix[i, j] = (
                    self.efficiency_weight * efficiency_cost + 
                    self.fairness_weight * fairness_cost
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