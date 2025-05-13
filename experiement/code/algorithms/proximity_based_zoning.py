from datetime import datetime
import random
from typing import List, Tuple
import numpy as np
from algorithms.greedy_nearest_neighbor import GreedyNearestNeighbor
from models import Rider, Driver, City, DriverStatus
from algorithms.matching_algorithm import MatchingAlgorithm

class ProximityBasedMatchingWithZoning(MatchingAlgorithm):
    """
    Divides the city into zones and restricts matching to drivers
    within the same zone or adjacent zones to reduce empty miles.
    
    Parameters:
        - zone_restriction_level: How strictly to enforce zone boundaries (0-1)
            0 = No restriction, drivers can be matched anywhere
            1 = Strict restriction, drivers can only be matched within their zone
    """
    
    def __init__(self, zone_restriction_level=0.5):
        self.zone_restriction_level = zone_restriction_level
        self._zone_neighbors = {}  # Cache for zone adjacency
        
    def match(self, riders, drivers, city, current_time):
        matches = []
        if not riders or not drivers:
            return matches
            
        # Build zone neighbors cache if empty
        if not self._zone_neighbors:
            self._build_zone_neighbors(city)
            
        # Group drivers by zone
        drivers_by_zone = {}
        for driver in drivers:
            zone = driver.location_id
            if zone not in drivers_by_zone:
                drivers_by_zone[zone] = []
            drivers_by_zone[zone].append(driver)
        
        # Process riders by waiting time (longest first)
        riders_sorted = sorted(riders, key=lambda r: (current_time - r.request_time).total_seconds(), reverse=True)
        available_drivers = set(drivers)
        
        for rider in riders_sorted:
            pickup_zone = rider.pickup_location_id
            
            # Get all eligible drivers based on zone restrictions
            eligible_drivers = []
            
            # First try same zone
            if pickup_zone in drivers_by_zone:
                eligible_drivers.extend([d for d in drivers_by_zone[pickup_zone] if d in available_drivers])
                
            # Then try neighboring zones
            if len(eligible_drivers) == 0 or random.random() > self.zone_restriction_level:
                neighbor_zones = self._zone_neighbors.get(pickup_zone, [])
                for zone in neighbor_zones:
                    if zone in drivers_by_zone:
                        eligible_drivers.extend([d for d in drivers_by_zone[zone] if d in available_drivers])
            
            # If still no eligible drivers and restrictions aren't strict, try all zones
            if len(eligible_drivers) == 0 and random.random() > self.zone_restriction_level:
                eligible_drivers = [d for d in drivers if d in available_drivers]
                
            if not eligible_drivers:
                continue
                
            # Find best driver (closest)
            best_driver = min(eligible_drivers, key=lambda d: 
                            city.get_travel_time(d.location_id, rider.pickup_location_id))
            
            matches.append((rider, best_driver))
            available_drivers.remove(best_driver)
            
        return matches
        
    def _build_zone_neighbors(self, city):
        """Build a dictionary of neighboring zones"""
        # For now, use a simple approximation based on travel times
        all_zones = set()
        for zone_data in city.zones.itertuples():
            if hasattr(zone_data, 'LocationID'):
                all_zones.add(zone_data.LocationID)
        
        # For each zone, find zones that are close (less than 5 minutes away)
        for zone_id in all_zones:
            neighbors = set()
            for other_zone in all_zones:
                if zone_id != other_zone:
                    travel_time = city.get_travel_time(zone_id, other_zone)
                    if travel_time < 5:  # 5 minutes threshold
                        neighbors.add(other_zone)
            self._zone_neighbors[zone_id] = list(neighbors)