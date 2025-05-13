from datetime import datetime
from typing import List, Tuple
import numpy as np
from models.rider import RiderStatus
from models import Rider, Driver, City, DriverStatus
from algorithms.matching_algorithm import MatchingAlgorithm

class StableFairMatchingAlgorithm(MatchingAlgorithm):
    def __init__(self, city: City, central_zone_id: int, fairness_weight=0.3, centrality_weight=0.2):
        self.city = city
        self.central_zone_id = central_zone_id
        self.fairness_weight = fairness_weight
        self.centrality_weight = centrality_weight

    def match(self, riders, drivers, city, current_time):
        if not riders or not drivers:
            return []
        
        # --- Compute statistics ---
        mean_earnings = np.mean([d.total_earnings for d in drivers]) or 0.01
        max_distance_to_center = max(
            [city.get_travel_distance(d.location_id, self.central_zone_id) for d in drivers]
        ) or 1

        # Create preference lists based on shortest pickup time
        rider_prefs = {}
        driver_prefs = {}

        for rider in riders:
            scores = []
            for driver in drivers:
                pickup_time = city.get_travel_time(driver.location_id, rider.pickup_location_id)
                fairness_score = 1 - (driver.total_earnings / mean_earnings)
                center_distance = city.get_travel_distance(driver.location_id, self.central_zone_id)
                center_score = 1 - (center_distance / max_distance_to_center)

                # Weighted score: lower is better
                score = (
                    0.5 * pickup_time +
                    self.fairness_weight * fairness_score +
                    self.centrality_weight * center_score
                )
                scores.append((score, driver))
            rider_prefs[rider.rider_id] = [d.driver_id for _, d in sorted(scores, key=lambda x: x[0])]

        for driver in drivers:
            scores = []
            for rider in riders:
                pickup_time = city.get_travel_time(driver.location_id, rider.pickup_location_id)
                score = pickup_time
                scores.append((score, rider))
            driver_prefs[driver.driver_id] = [r.rider_id for _, r in sorted(scores, key=lambda x: x[0])]

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