from datetime import datetime
from typing import List, Tuple
from models import Rider, Driver, City, DriverStatus, RiderStatus

class StableMatchingAlgorithm:
    """
    Stable Matching (Gale–Shapley) based only on pickup distance/time.
    """
    
    def __init__(self, debug=False):
        self.debug = debug

    def match(self, riders: List[Rider], drivers: List[Driver], city: City, current_time: datetime) -> List[Tuple[Rider, Driver]]:
        if not riders or not drivers:
            return []

        # Create preference lists based on shortest pickup time
        rider_prefs = {
            rider.rider_id: sorted(drivers, key=lambda d: city.get_travel_time(d.location_id, rider.pickup_location_id))
            for rider in riders
        }
        driver_prefs = {
            driver.driver_id: sorted(riders, key=lambda r: city.get_travel_time(driver.location_id, r.pickup_location_id))
            for driver in drivers
        }

        # Convert to ID lists
        rider_pref_ids = {r: [d.driver_id for d in prefs] for r, prefs in rider_prefs.items()}
        driver_pref_ids = {d: [r.rider_id for r in prefs] for d, prefs in driver_prefs.items()}

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