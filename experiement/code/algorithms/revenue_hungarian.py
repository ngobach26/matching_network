from datetime import datetime
from typing import List, Tuple
import numpy as np
from algorithms.greedy_nearest_neighbor import GreedyNearestNeighbor
from models import Rider, Driver, City, DriverStatus
from algorithms.matching_algorithm import MatchingAlgorithm

class RevenueOptimizedHungarianAlgorithm(MatchingAlgorithm):
    """Implementation of the Hungarian algorithm for optimal assignment that maximizes total system revenue"""
    
    def __init__(self, max_pickup_time_minutes=30):
        """
        Initialize with constraints
        
        Args:
            max_pickup_time_minutes: Maximum acceptable pickup time in minutes
        """
        self.max_pickup_time_minutes = max_pickup_time_minutes
    
    def match(self, riders: List[Rider], drivers: List[Driver], city: City, current_time: datetime) -> List[Tuple[Rider, Driver]]:
        from scipy.optimize import linear_sum_assignment
        
        matches = []
        available_drivers = [d for d in drivers if d.status == DriverStatus.IDLE]
        
        if not riders or not available_drivers:
            return matches
            
        # Build revenue matrix (negative for minimization problem)
        NEG_INF = -999999  # Large negative value for maximization
        revenue_matrix = np.ones((len(riders), len(available_drivers))) * NEG_INF
        
        for i, rider in enumerate(riders):
            for j, driver in enumerate(available_drivers):
                # Calculate pickup time
                pickup_time = city.get_travel_time(driver.location_id, rider.pickup_location_id)
                
                # Skip if pickup time exceeds maximum threshold
                if pickup_time > self.max_pickup_time_minutes:
                    continue
                
                # Calculate estimated trip metrics
                trip_distance = city.get_travel_distance(rider.pickup_location_id, rider.dropoff_location_id)
                trip_time = city.get_travel_time(rider.pickup_location_id, rider.dropoff_location_id)
                
                # Estimate fare components
                base_fare, total_fare, driver_pay = city.estimate_trip_fare(
                    distance=trip_distance,
                    time=trip_time,
                    dropoff_zone_id=rider.dropoff_location_id
                )
                
                # Use negative total_fare for minimization problem (to maximize revenue)
                revenue_matrix[i, j] = -total_fare
        
        # Solve assignment problem (minimizing negative revenue = maximizing revenue)
        try:
            rider_indices, driver_indices = linear_sum_assignment(revenue_matrix)
            
            # Create matches where assignments are valid
            for r_idx, d_idx in zip(rider_indices, driver_indices):
                if revenue_matrix[r_idx, d_idx] > NEG_INF:
                    matches.append((riders[r_idx], available_drivers[d_idx]))
                    
        except ValueError:
            # Fallback to greedy if optimization fails
            return GreedyNearestNeighbor().match(riders, drivers, city, current_time)
            
        return matches
        
    def calculate_expected_revenue(self, rider: Rider, driver: Driver, city: City) -> float:
        """
        Calculate the expected revenue from matching a rider with a driver
        
        Args:
            rider: The rider requesting a trip
            driver: The potential driver
            city: City model with distance and fare information
            
        Returns:
            Expected total fare for the trip
        """
        # Get travel metrics
        trip_distance = city.get_travel_distance(rider.pickup_location_id, rider.dropoff_location_id)
        trip_time = city.get_travel_time(rider.pickup_location_id, rider.dropoff_location_id)
        
        # Estimate fare
        _, total_fare, _ = city.estimate_trip_fare(
            distance=trip_distance,
            time=trip_time,
            dropoff_zone_id=rider.dropoff_location_id
        )
        
        return total_fare