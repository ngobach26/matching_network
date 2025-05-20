from algorithms import *
from models import *
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import heapq
from tqdm import tqdm

RUSH_HOUR = [(0, 2), (14, 17)]
MAX_WAIT_TIME_MINS = 15  # Maximum wait time before cancellation (in minutes)
DEFAULT_NUM_DRIVERS = 1000

class Simulation:
    def __init__(self, city: City, matching_algorithm: MatchingAlgorithm):
        self._dropoff_metadata = {}
        self.city = city
        self.matching_algorithm = matching_algorithm
        self.current_time = None
        self.end_time = None
        self.time_step = None
        
        # Entities
        self.drivers = {}  # driver_id -> Driver
        self.riders = {}   # rider_id -> Rider
        self.trips = {}    # trip_id -> Trip
        
        # Event queue
        self.events = []  # heap queue of (time, event_type, entity_id)
        
        # Statistics
        self.metrics = {
            'total_matches': 0,
            'total_completed_trips': 0,
            'total_cancelled_rides': 0,
            'avg_waiting_time': 0,
            'avg_trip_time': 0,
            'avg_driver_earnings': 0,
            'avg_empty_miles': 0,
        }
        
        # Timestamped records for time series analysis
        self.time_series = {
            'waiting_times': [],     # (time, rider_id, waiting_time)
            'trip_completions': [],  # (time, trip_id)
            'driver_earnings': [],   # (time, driver_id, earnings)
            'matches': [],           # (time, rider_id, driver_id)
            'cancellations': [],     # (time, rider_id, reason)
        }
    
    def initialize_from_data(self, driver_data_path: str, trip_data_path: str, 
                            start_date: datetime, end_date: datetime,
                            batch_interval_minutes: int = 1,
                            max_wait_time_minutes: int = MAX_WAIT_TIME_MINS,
                            num_drivers: int = DEFAULT_NUM_DRIVERS):
        """
        Initialize simulation from TLC data
        
        Args:
            driver_data_path: Path to driver data
            trip_data_path: Path to trip data in parquet format
            start_date: Simulation start date
            end_date: Simulation end date
            batch_interval_minutes: How often to run matching algorithm
            max_wait_time_minutes: Maximum time a rider will wait before cancelling
        """
        self.current_time = start_date
        self.end_time = end_date
        self.time_step = timedelta(minutes=batch_interval_minutes)
        self.max_wait_time = timedelta(minutes=max_wait_time_minutes)
        
        # Load trip data
        self.trip_df = pd.read_parquet(trip_data_path)
        
        # Convert timestamps
        for col in ['request_datetime', 'pickup_datetime', 'dropoff_datetime']:
            if col in self.trip_df.columns:
                self.trip_df[col] = pd.to_datetime(self.trip_df[col])
        
        # Filter by date range
        self.trip_df = self.trip_df[(self.trip_df['request_datetime'] >= start_date) & 
                                    (self.trip_df['request_datetime'] <= end_date)]
        
        # Sort by request time
        self.trip_df = self.trip_df.sort_values('request_datetime')
        
        # Initialize drivers - in a real scenario, would load from file
        # For now, create synthetic driver distribution
        self._initialize_synthetic_drivers(num_drivers) 
        
        print(f"Initialized simulation with {len(self.drivers)} drivers and {len(self.trip_df)} potential trips")
        print(f"Simulation period: {start_date} to {end_date}")
        print(f"Riders will automatically cancel after {max_wait_time_minutes} minutes of waiting")
    
    def _initialize_synthetic_drivers(self, num_drivers: int):
        """Create synthetic drivers with distribution across zones"""
        # Get distribution of pickup locations to place drivers
        if len(self.trip_df) > 0 and 'PULocationID' in self.trip_df.columns:
            pickup_dist = self.trip_df['PULocationID'].value_counts(normalize=True)
            
            # Create drivers with distribution roughly matching pickups
            for i in range(num_drivers):
                driver_id = f"D{i:05d}"
                
                # Sample location from pickup distribution
                if len(pickup_dist) > 0:
                    location_id = np.random.choice(pickup_dist.index, p=pickup_dist.values)
                else:
                    # Fallback to random zone
                    location_id = np.random.choice(self.city.zones['LocationID'].values)
                
                self.drivers[driver_id] = Driver(driver_id, location_id)
        else:
            # Fallback if no trip data
            for i in range(num_drivers):
                driver_id = f"D{i:05d}"
                location_id = np.random.choice(self.city.zones['LocationID'].values)
                self.drivers[driver_id] = Driver(driver_id, location_id)
    
    def run(self):
        """Run the simulation from start to end time"""
        print(f"Starting simulation at {self.current_time}")
        
        progress_bar = tqdm(total=(self.end_time - self.current_time).total_seconds() // 60)
        
        # Main simulation loop
        while self.current_time < self.end_time:
            # Process events that happen at current time
            self._process_events()
            
            # Process new rider requests for this time step
            self._process_new_requests()
            
            # Run matching algorithm
            self._match_riders_to_drivers()
            
            # Update simulation time
            self.current_time += self.time_step
            progress_bar.update(self.time_step.total_seconds() // 60)
        
        progress_bar.close()
        print(f"Simulation completed at {self.current_time}")
        
        # Compute final metrics
        self._compute_final_metrics()
    
    def _process_events(self):
        """Process all events scheduled for current time"""
        while self.events and self.events[0][0] <= self.current_time:
            event_time, event_type, entity_id = heapq.heappop(self.events)
            
            if event_type == 'pickup':
                self._process_pickup_event(entity_id)
            elif event_type == 'dropoff':
                self._process_dropoff_event(entity_id)
            elif event_type == 'cancel':
                self._process_cancel_event(entity_id)
    
    def _process_new_requests(self):
        """Process new rider requests for the current time step"""
        # Get requests in current time window
        new_requests = self.trip_df[
            (self.trip_df['request_datetime'] >= self.current_time) & 
            (self.trip_df['request_datetime'] < self.current_time + self.time_step)
        ]
        
        for _, row in new_requests.iterrows():
            rider_id = f"R{len(self.riders):06d}"
            
            # Create new rider from trip data
            shared_request = row.get('shared_request_flag', 'N') == 'Y'
            
            rider = Rider(
                rider_id=rider_id,
                request_time=row['request_datetime'],
                pickup_location_id=row['PULocationID'],
                dropoff_location_id=row['DOLocationID'],
                shared_request=shared_request
            )
            
            self.riders[rider_id] = rider
            
            # Schedule automatic cancellation if rider waits too long
            cancel_time = rider.request_time + self.max_wait_time
            heapq.heappush(self.events, (cancel_time, 'cancel', rider_id))
    
    def _match_riders_to_drivers(self):
        """Run matching algorithm for current batch of riders"""
        # Get waiting riders
        waiting_riders = [r for r in self.riders.values() if r.status == RiderStatus.WAITING]
        
        if not waiting_riders:
            return
            
        # Get available drivers
        available_drivers = [d for d in self.drivers.values() if d.status == DriverStatus.IDLE]
        
        if not available_drivers:
            return
            
        # Run matching algorithm
        matches = self.matching_algorithm.match(waiting_riders, available_drivers, self.city, self.current_time)
        
        # Process matches
        for rider, driver in matches:
            self._create_trip(rider, driver)
            
            # Record match
            self.time_series['matches'].append((self.current_time, rider.rider_id, driver.driver_id))
            self.metrics['total_matches'] += 1
    
    def _create_trip(self, rider: Rider, driver: Driver):
        """Create a new trip from a rider-driver match"""
        trip_id = f"T{len(self.trips):06d}"
        
        # Create trip
        trip = Trip(
            trip_id=trip_id,
            rider_id=rider.rider_id,
            driver_id=driver.driver_id,
            request_time=rider.request_time,
            pickup_location_id=rider.pickup_location_id,
            dropoff_location_id=rider.dropoff_location_id,
            shared_request=rider.shared_request
        )
        
        # Update trip state
        trip.dispatch(self.current_time)
        self.trips[trip_id] = trip
        
        # Update rider state
        rider.assign_driver(driver.driver_id)
        rider.trip_id = trip_id
        
        # Update driver state
        driver.assign_rider(rider.rider_id, self.current_time)
        
        # Calculate pickup time
        pickup_time_mins = self.city.get_travel_time(driver.location_id, rider.pickup_location_id)
        pickup_time = self.current_time + timedelta(minutes=pickup_time_mins)
        
        # Schedule pickup event
        heapq.heappush(self.events, (pickup_time, 'pickup', trip_id))
        
        # Add empty mileage to driver
        empty_miles = self.city.get_travel_distance(driver.location_id, rider.pickup_location_id)
        driver.empty_distance += empty_miles
    
    def _process_pickup_event(self, trip_id: str):
        """Process a pickup event"""
        trip = self.trips[trip_id]
        rider = self.riders[trip.rider_id]
        driver = self.drivers[trip.driver_id]
        
        # Update trip
        trip.pickup(self.current_time)
        
        # Update rider
        rider.pickup(self.current_time)
        
        # Update driver
        driver.arrive_at_pickup(rider.pickup_location_id, self.current_time)
        driver.start_trip(self.current_time)
        
        # Record waiting time
        waiting_time = rider.waiting_time
        self.time_series['waiting_times'].append((self.current_time, rider.rider_id, waiting_time))
        
        # Calculate trip time and schedule dropoff
        trip_time_mins = self.city.get_travel_time(rider.pickup_location_id, rider.dropoff_location_id)
        trip_distance = self.city.get_travel_distance(rider.pickup_location_id, rider.dropoff_location_id)
        
        hour = self.current_time.hour
        if any(start <= hour < end for (start, end) in RUSH_HOUR):  # Rush hours
            trip_time_mins *= 1.3  # 30% longer during rush hour
        
        dropoff_time = self.current_time + timedelta(minutes=trip_time_mins)
        
        # Calculate fare
        base_fare, total_fare, driver_pay = self.city.estimate_trip_fare(trip_distance, trip_time_mins, trip.dropoff_location_id)
        
        # Schedule dropoff with trip details
        self._dropoff_metadata[trip_id] = {
            'trip_miles': trip_distance,
            'trip_time': trip_time_mins * 60,
            'base_fare': base_fare,
            'total_fare': total_fare,
            'driver_pay': driver_pay
        }
        heapq.heappush(self.events, (dropoff_time, 'dropoff', trip_id))
    
    def _process_dropoff_event(self, trip_id: str):
        trip = self.trips[trip_id]
        rider = self.riders[trip.rider_id]
        driver = self.drivers[trip.driver_id]

        # Get metadata saved from pickup
        event_data = self._dropoff_metadata.pop(trip_id, {})

        # Complete trip
        trip.dropoff(
            self.current_time,
            event_data.get('trip_miles', 0),
            event_data.get('trip_time', 0),
            event_data.get('base_fare', 0),
            event_data.get('total_fare', 0),
            event_data.get('driver_pay', 0)
        )

        # Update rider & driver
        rider.dropoff(self.current_time)
        driver.complete_trip(trip, self.current_time)

        # Record statistics
        self.time_series['trip_completions'].append((self.current_time, trip_id))
        self.metrics['total_completed_trips'] += 1
        self.time_series['driver_earnings'].append(
            (self.current_time, driver.driver_id, event_data.get('driver_pay', 0))
        )

    
    def _process_cancel_event(self, rider_id: str):
        """Process a ride cancellation"""
        rider = self.riders.get(rider_id, None)
        
        # Only process if rider exists and is still waiting
        if rider and rider.status == RiderStatus.WAITING:
            rider.cancel(self.current_time)
            self.metrics['total_cancelled_rides'] += 1
            
            # Record cancellation with reason
            wait_time_secs = (self.current_time - rider.request_time).total_seconds()
            self.time_series['cancellations'].append(
                (self.current_time, rider_id, f"Exceeded max wait time ({wait_time_secs/60:.1f} minutes)")
            )
    
    def _compute_final_metrics(self):
        """Compute final performance metrics"""
        # Calculate averages
        completed_trips = [t for t in self.trips.values() if t.is_completed()]
        if completed_trips:
            self.metrics['avg_trip_time'] = np.mean([t.trip_time for t in completed_trips])
            
        picked_up_riders = [r for r in self.riders.values() if r.status == RiderStatus.DROPPED_OFF]
        if picked_up_riders:
            self.metrics['avg_waiting_time'] = np.mean([r.waiting_time for r in picked_up_riders])
        
        active_drivers = [d for d in self.drivers.values() if d.trip_history]
        if active_drivers:
            self.metrics['avg_driver_earnings'] = np.mean([d.total_earnings for d in active_drivers])
            self.metrics['avg_empty_miles'] = np.mean([d.empty_distance for d in active_drivers])
        
        # Calculate cancellation rate
        total_requests = len(self.riders)
        if total_requests > 0:
            self.metrics['cancellation_rate'] = self.metrics['total_cancelled_rides'] / total_requests
            
        # Calculate Gini coefficient for driver earnings
        if active_drivers:
            earnings = np.array([d.total_earnings for d in active_drivers])
            self.metrics['gini_coefficient'] = self._gini(earnings)
            
        print("\nSimulation Results:")
        print(f"Total Completed Trips: {self.metrics['total_completed_trips']}")
        print(f"Total Cancelled Rides: {self.metrics['total_cancelled_rides']}")
        print(f"Cancellation Rate: {self.metrics.get('cancellation_rate', 0):.2%}")
        print(f"Average Waiting Time: {self.metrics['avg_waiting_time']:.2f} seconds")
        print(f"Average Trip Time: {self.metrics['avg_trip_time']:.2f} seconds")
        print(f"Average Driver Earnings: ${self.metrics['avg_driver_earnings']:.2f}")
        print(f"Average Empty Miles: {self.metrics['avg_empty_miles']:.2f} miles")
        if 'gini_coefficient' in self.metrics:
            print(f"Driver Earnings Gini Coefficient: {self.metrics['gini_coefficient']:.4f}")
    
    def _gini(self, array):
        """Calculate the Gini coefficient"""
        if np.amin(array) < 0:
            array -= np.amin(array)  # Make all values positive
        array = np.sort(array)  # Values must be sorted
        index = np.arange(1, array.shape[0] + 1)  # Index per array element
        n = array.shape[0]  # Number of array elements
        return (np.sum((2 * index - n - 1) * array)) / (n * np.sum(array))  # Gini coefficient