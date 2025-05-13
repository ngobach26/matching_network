from datetime import datetime
from typing import List, Tuple
from models import Rider, Driver, City, DriverStatus
from algorithms.matching_algorithm import MatchingAlgorithm

class GreedyNearestNeighbor(MatchingAlgorithm):
    """Simple greedy algorithm that matches riders to nearest available drivers"""
    
    def match(self, riders: List[Rider], drivers: List[Driver], city: City, current_time: datetime) -> List[Tuple[Rider, Driver]]:
        matches = []
        available_drivers = [d for d in drivers if d.status == DriverStatus.IDLE]
        
        # Sort riders by request time (FCFS)
        sorted_riders = sorted(riders, key=lambda r: r.request_time)
        
        for rider in sorted_riders:
            if not available_drivers:
                break
                
            # Find closest driver
            closest_driver = min(
                available_drivers,
                key=lambda d: city.get_travel_time(d.location_id, rider.pickup_location_id)
            )
            
            # Make the match
            matches.append((rider, closest_driver))
            available_drivers.remove(closest_driver)
            
        return matches