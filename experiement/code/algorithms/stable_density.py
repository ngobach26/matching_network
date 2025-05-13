from datetime import datetime
from typing import List, Tuple
import numpy as np
import pandas as pd
from models.rider import RiderStatus
from models import Rider, Driver, City, DriverStatus
from algorithms.matching_algorithm import MatchingAlgorithm

class StableDensityMatchingAlgorithm(MatchingAlgorithm):
    def __init__(self, 
                 city: City, 
                 density_zones, 
                 pickup_time_weight=0.7,
                 zones_importance_weight=0.3):
        """
        Initialize the algorithm with city context and trip data
        
        Args:
            city: City object with zone information
            trip_data_path: Path to trip data for calculating zone centrality
            zones_importance_weight: Weight for zone importance
        """
        self.city = city
        self.zones_importance_weight = zones_importance_weight
        self.pickup_time_weight = pickup_time_weight
        self.zones_density = density_zones

    def match(self, riders, drivers, city, current_time):
        if not riders or not drivers:
            return []
        

        # Create preference lists based on multiple criteria
        rider_prefs = {}
        driver_prefs = {}

        for rider in riders:
            scores = []
            for driver in drivers:
                # Pickup time
                pickup_time = city.get_travel_time(driver.location_id, rider.pickup_location_id)

                # Weighted score: lower is better
                score = pickup_time
                scores.append((score, driver))
            
            # Sort drivers by preference score
            rider_prefs[rider.rider_id] = [d.driver_id for _, d in sorted(scores, key=lambda x: x[0])]

        for driver in drivers:
            scores = []
            pickup_times = [
                city.get_travel_time(driver.location_id, rider.pickup_location_id)
                for rider in riders
            ]
            min_time = min(pickup_times)
            max_time = max(pickup_times)
            print(f"min: {min_time}, max: {max_time}")

            for rider, pickup_time in zip(riders, pickup_times):
                # Normalized pickup time
                if max_time != min_time:
                    norm_pickup = (pickup_time - min_time) / (max_time - min_time)
                else:
                    norm_pickup = 0.0

                zone_importance = self.zones_density.get(rider.dropoff_location_id, 0)
                zone_score = 1.0 - zone_importance  # càng quan trọng thì càng tốt

                score = (
                    self.pickup_time_weight * norm_pickup +
                    self.zones_importance_weight * zone_score
                )
                scores.append((score, rider))

            driver_prefs[driver.driver_id] = [r.rider_id for _, r in sorted(scores, key=lambda x: x[0])]

        # Stable matching algorithm (Gale-Shapley) implementation remains the same
        rider_pref_ids = rider_prefs
        driver_pref_ids = driver_prefs

        # Gale–Shapley (riders propose)
        free_riders = set(rider_pref_ids.keys())
        proposals = {r: 0 for r in free_riders}
        matches = {}  # rider_id -> driver_id
        driver_engaged = {}  # driver_id -> rider_id

        while free_riders:
            # Get a free rider
            r_id = free_riders.pop()
            
            # Get their preferences
            prefs = rider_pref_ids.get(r_id, [])
            
            # If the rider has proposed to all drivers, they remain unmatched
            if proposals[r_id] >= len(prefs):
                continue
                
            # Get the next driver to propose to
            d_id = prefs[proposals[r_id]]
            proposals[r_id] += 1

            # If the driver is not engaged, accept the proposal
            if d_id not in driver_engaged:
                matches[r_id] = d_id
                driver_engaged[d_id] = r_id
            else:
                # Driver is already engaged, check if they prefer the new rider
                current_r = driver_engaged[d_id]
                pref_list = driver_pref_ids[d_id]
                
                # If driver prefers new rider, accept new proposal and free current rider
                if pref_list.index(r_id) < pref_list.index(current_r):
                    matches[r_id] = d_id
                    driver_engaged[d_id] = r_id
                    
                    # Remove the old match
                    if current_r in matches and matches[current_r] == d_id:
                        del matches[current_r]
                    
                    # Add the previous rider back to free riders
                    free_riders.add(current_r)
                else:
                    # Driver prefers current match, reject new proposal
                    free_riders.add(r_id)

        # Convert matches to pairs of objects
        id_to_rider = {r.rider_id: r for r in riders}
        id_to_driver = {d.driver_id: d for d in drivers}

        return [
            (id_to_rider[r], id_to_driver[d])
            for r, d in matches.items()
            if id_to_rider[r].status == RiderStatus.WAITING and id_to_driver[d].status == DriverStatus.IDLE
        ]