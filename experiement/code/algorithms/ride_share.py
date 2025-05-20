from datetime import datetime
from typing import List, Tuple, Dict
import numpy as np
from algorithms.matching_algorithm import MatchingAlgorithm
from models import Rider, Driver, City, DriverStatus, Trip, RiderStatus
from collections import defaultdict

class SharedRideMatchingAlgorithm(MatchingAlgorithm):
    """
    Implementation of a ride-sharing algorithm that matches multiple riders with similar routes to a single driver
    """
    
    def __init__(self, max_detour_minutes: float = 10.0, 
                 max_wait_minutes: float = 10.0,
                 max_riders_per_vehicle: int = 2,
                 detour_factor: float = 1.5):
        """
        Initialize ride-sharing algorithm with constraints
        
        Args:
            max_detour_minutes: Maximum additional trip time a rider would accept for sharing
            max_wait_minutes: Maximum time a rider would wait for another rider to be picked up
            max_riders_per_vehicle: Maximum number of riders in a single vehicle
            detour_factor: Maximum ratio of shared route distance to direct route distance
        """
        self.max_detour_minutes = max_detour_minutes
        self.max_wait_minutes = max_wait_minutes
        self.max_riders_per_vehicle = max_riders_per_vehicle
        self.detour_factor = detour_factor
    
    def match(self, riders: List[Rider], drivers: List[Driver], city: City, current_time: datetime) -> List[Tuple[Rider, Driver]]:
        """
        Match riders to drivers considering ride-sharing opportunities
        
        Returns:
            List of (rider, driver) matches
        """
        # Filter for riders who are willing to share
        sharable_riders = riders
        solo_riders = []
        # sharable_riders = [r for r in riders if r.shared_request]
        # solo_riders = [r for r in riders if not r.shared_request]
        
        # Get available drivers
        available_drivers = [d for d in drivers if d.status == DriverStatus.IDLE]
        
        if not available_drivers:
            return []
            
        # First, find groups of riders who can share rides
        rider_groups = self._group_sharable_riders(sharable_riders, city)
        
        # Then, match these groups to drivers
        group_driver_matches = self._match_groups_to_drivers(rider_groups, available_drivers, city)
        
        # Any remaining drivers can be matched with solo riders
        used_drivers = set(driver for _, driver in group_driver_matches)
        remaining_drivers = [d for d in available_drivers if d not in used_drivers]
        
        # Match remaining solo riders using a simple distance-based approach
        solo_matches = self._match_solo_riders(solo_riders, remaining_drivers, city)
        
        # Combine all matches
        all_matches = []
        for riders_group, driver in group_driver_matches:
            for rider in riders_group:
                all_matches.append((rider, driver))
        
        all_matches.extend(solo_matches)
        
        return all_matches
    
    def _group_sharable_riders(self, riders: List[Rider], city: City) -> List[List[Rider]]:
        """
        Group riders who can share rides based on proximity of routes
        
        Returns:
            List of rider groups, where each group can share a ride
        """
        # If we have no riders or just one, no grouping needed
        if len(riders) <= 1:
            return [[r] for r in riders]
        
        rider_groups = []
        unassigned_riders = set(riders)
        
        # Try to form groups until we can't form any more
        while unassigned_riders:
            # Start a new group with an unassigned rider
            current_rider = next(iter(unassigned_riders))
            current_group = [current_rider]
            unassigned_riders.remove(current_rider)
            
            # Find compatible riders to add to this group
            potential_matches = list(unassigned_riders)
            
            while potential_matches and len(current_group) < self.max_riders_per_vehicle:
                best_match = None
                best_score = float('inf')
                
                # Find the best matching rider based on route similarity
                for rider in potential_matches:
                    if self._can_share_ride(current_group, rider, city):
                        # Score based on detour (lower is better)
                        score = self._calculate_sharing_detour(current_group, rider, city)
                        if score < best_score:
                            best_score = score
                            best_match = rider
                
                if best_match:
                    current_group.append(best_match)
                    unassigned_riders.remove(best_match)
                    potential_matches.remove(best_match)
                else:
                    # No more compatible riders found
                    break
            
            # Add the group to our results
            if current_group:
                rider_groups.append(current_group)
        
        return rider_groups

    def _can_share_ride(self, existing_riders: List[Rider], new_rider: Rider, city: City) -> bool:
        """
        Check if a new rider can share a ride with existing riders
        
        Args:
            existing_riders: List of riders already in a group
            new_rider: New rider to check for compatibility
            city: City model for distance/time calculations
            
        Returns:
            True if the new rider can share with the existing riders
        """
        if not existing_riders:
            return True
            
        # Check pickup/dropoff proximity
        for rider in existing_riders:
            # Check if pickup locations are reasonably close
            pickup_dist = city.get_travel_distance(rider.pickup_location_id, new_rider.pickup_location_id)
            pickup_time = city.get_travel_time(rider.pickup_location_id, new_rider.pickup_location_id)
            
            # Check if dropoff locations are reasonably close
            dropoff_dist = city.get_travel_distance(rider.dropoff_location_id, new_rider.dropoff_location_id)
            dropoff_time = city.get_travel_time(rider.dropoff_location_id, new_rider.dropoff_location_id)
            
            # Direct route time for each rider
            direct_time_existing = city.get_travel_time(rider.pickup_location_id, rider.dropoff_location_id)
            direct_time_new = city.get_travel_time(new_rider.pickup_location_id, new_rider.dropoff_location_id)
            
            # Calculate worst-case detour times
            detour_for_existing = pickup_time + dropoff_time
            detour_for_new = pickup_time + dropoff_time
            
            # Check if detours are acceptable
            if detour_for_existing > self.max_detour_minutes or detour_for_new > self.max_detour_minutes:
                return False
                
            # Check if the detour ratio is acceptable
            if (direct_time_existing + detour_for_existing) / direct_time_existing > self.detour_factor:
                return False
                
            if (direct_time_new + detour_for_new) / direct_time_new > self.detour_factor:
                return False
        
        return True
        
    def _calculate_sharing_detour(self, existing_riders: List[Rider], new_rider: Rider, city: City) -> float:
        """
        Calculate the detour cost of adding a new rider to an existing group
        
        Returns:
            Detour cost in minutes
        """
        # For the first rider, there's no detour
        if not existing_riders:
            return 0
            
        # Simple case: Calculate maximum detour among all riders
        max_detour = 0
        
        for rider in existing_riders:
            # Calculate pickup detour
            pickup_detour = city.get_travel_time(rider.pickup_location_id, new_rider.pickup_location_id)
            
            # Calculate dropoff detour
            dropoff_detour = city.get_travel_time(rider.dropoff_location_id, new_rider.dropoff_location_id)
            
            # Total detour
            total_detour = pickup_detour + dropoff_detour
            max_detour = max(max_detour, total_detour)
        
        return max_detour
        
    def _match_groups_to_drivers(self, rider_groups: List[List[Rider]], drivers: List[Driver], city: City) -> List[Tuple[List[Rider], Driver]]:
        """
        Match groups of riders to available drivers
        
        Returns:
            List of (rider_group, driver) matches
        """
        matches = []
        
        # Sort groups by size (descending) to prioritize larger groups
        rider_groups = sorted(rider_groups, key=len, reverse=True)
        
        # Available drivers
        available_drivers = drivers.copy()
        
        for riders in rider_groups:
            if not available_drivers:
                break
                
            # Find best driver for this group based on distance to first pickup
            best_driver = None
            best_distance = float('inf')
            
            for driver in available_drivers:
                # Use first rider's pickup as the initial location
                first_pickup_location = riders[0].pickup_location_id
                
                # Calculate distance from driver to first pickup
                distance = city.get_travel_distance(driver.location_id, first_pickup_location)
                
                if distance < best_distance:
                    best_distance = distance
                    best_driver = driver
            
            if best_driver:
                matches.append((riders, best_driver))
                available_drivers.remove(best_driver)
        
        return matches
        
    def _match_solo_riders(self, riders: List[Rider], drivers: List[Driver], city: City) -> List[Tuple[Rider, Driver]]:
        """
        Match solo riders to drivers using a basic nearest-neighbor approach
        
        Returns:
            List of (rider, driver) matches
        """
        matches = []
        
        # Sort riders by wait time (descending) to prioritize riders who have waited longer
        sorted_riders = sorted(riders, key=lambda r: (datetime.now() - r.request_time).total_seconds(), reverse=True)
        
        # Available drivers
        available_drivers = drivers.copy()
        
        for rider in sorted_riders:
            if not available_drivers:
                break
                
            # Find closest driver
            best_driver = None
            best_distance = float('inf')
            
            for driver in available_drivers:
                distance = city.get_travel_distance(driver.location_id, rider.pickup_location_id)
                
                if distance < best_distance:
                    best_distance = distance
                    best_driver = driver
            
            if best_driver:
                matches.append((rider, best_driver))
                available_drivers.remove(best_driver)
        
        return matches