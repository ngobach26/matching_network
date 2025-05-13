import unittest
from unittest.mock import Mock, patch, MagicMock
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import heapq
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import the modules that would contain the classes
# Note: These imports would need to be adjusted based on actual project structure
from algorithms import MatchingAlgorithm
from models import Driver, Rider, Trip, RiderStatus, DriverStatus, City
from simulation import Simulation

class TestSimulation(unittest.TestCase):
    
    def setUp(self):
        """Setup common test fixtures"""
        # Mock dependencies
        self.mock_city = Mock(spec=City)
        self.mock_algorithm = Mock(spec=MatchingAlgorithm)
        
        # Setup travel time and distance methods
        self.mock_city.get_travel_time.return_value = 10  # 10 minutes
        self.mock_city.get_travel_distance.return_value = 5.0  # 5 miles
        self.mock_city.estimate_trip_fare.return_value = (10.0, 15.0, 12.0)  # base, total, driver pay
        
        # Setup zone data
        self.mock_city.zones = pd.DataFrame({
            'LocationID': [1, 2, 3, 4, 5],
            'zone': ['Zone1', 'Zone2', 'Zone3', 'Zone4', 'Zone5']
        })
        
        # Create simulation instance
        self.simulation = Simulation(self.mock_city, self.mock_algorithm)
        
        # Set simulation time parameters
        self.start_time = datetime(2023, 1, 1, 12, 0)
        self.end_time = datetime(2023, 1, 1, 13, 0)
        self.simulation.current_time = self.start_time
        self.simulation.end_time = self.end_time
        self.simulation.time_step = timedelta(minutes=1)

    def test_initialization(self):
        """Test simulation initialization"""
        self.assertIsNotNone(self.simulation)
        self.assertEqual(self.simulation.city, self.mock_city)
        self.assertEqual(self.simulation.matching_algorithm, self.mock_algorithm)
        self.assertEqual(len(self.simulation.drivers), 0)
        self.assertEqual(len(self.simulation.riders), 0)
        self.assertEqual(len(self.simulation.trips), 0)
        self.assertEqual(len(self.simulation.events), 0)

    @patch('pandas.read_parquet')
    @patch('numpy.random.choice')
    def test_initialize_from_data(self, mock_choice, mock_read_parquet):
        """Test initialization from data files"""
        # Setup mock data
        mock_trip_df = pd.DataFrame({
            'request_datetime': [
                self.start_time + timedelta(minutes=5),
                self.start_time + timedelta(minutes=10)
            ],
            'pickup_datetime': [
                self.start_time + timedelta(minutes=10),
                self.start_time + timedelta(minutes=15)
            ],
            'dropoff_datetime': [
                self.start_time + timedelta(minutes=20),
                self.start_time + timedelta(minutes=25)
            ],
            'PULocationID': [1, 2],
            'DOLocationID': [3, 4]
        })
        
        mock_read_parquet.return_value = mock_trip_df
        mock_choice.return_value = 1  # Always return location ID 1
        
        # Call method
        self.simulation.initialize_from_data(
            "driver_data.parquet", 
            "trip_data.parquet",
            self.start_time,
            self.end_time
        )
        
        # Verify
        self.assertEqual(self.simulation.current_time, self.start_time)
        self.assertEqual(self.simulation.end_time, self.end_time)
        self.assertGreater(len(self.simulation.drivers), 0)
        self.assertEqual(len(self.simulation.trip_df), 2)

    def test_process_new_requests(self):
        """Test processing of new ride requests"""
        # Setup
        self.simulation.trip_df = pd.DataFrame({
            'request_datetime': [self.start_time + timedelta(seconds=30)],
            'PULocationID': [1],
            'DOLocationID': [2],
            'shared_request_flag': ['N']
        })
        
        # Call method
        self.simulation._process_new_requests()
        
        # Verify
        self.assertEqual(len(self.simulation.riders), 1)
        rider = list(self.simulation.riders.values())[0]
        self.assertEqual(rider.pickup_location_id, 1)
        self.assertEqual(rider.dropoff_location_id, 2)
        self.assertEqual(rider.status, RiderStatus.WAITING)

    def test_match_riders_to_drivers(self):
        """Test matching algorithm execution"""
        # Setup
        driver = Driver("D00001", 1)
        driver.status = DriverStatus.IDLE
        self.simulation.drivers["D00001"] = driver
        
        rider = Rider("R000001", self.start_time, 2, 3, False)
        self.simulation.riders["R000001"] = rider
        
        # Mock the matching algorithm to return our pair
        self.mock_algorithm.match.return_value = [(rider, driver)]
        
        # Call method
        self.simulation._match_riders_to_drivers()
        
        # Verify
        self.mock_algorithm.match.assert_called_once()
        self.assertEqual(self.simulation.metrics['total_matches'], 1)
        self.assertEqual(len(self.simulation.trips), 1)
        self.assertEqual(driver.status, DriverStatus.EN_ROUTE)
        self.assertEqual(rider.driver_id, "D00001")
        self.assertEqual(len(self.simulation.events), 1)  # One pickup event scheduled

    def test_create_trip(self):
        """Test trip creation"""
        # Setup
        driver = Driver("D00001", 1)
        driver.status = DriverStatus.IDLE
        
        rider = Rider("R000001", self.start_time, 2, 3, False)
        rider.status = RiderStatus.WAITING
        
        # Call method
        self.simulation._create_trip(rider, driver)
        
        # Verify
        self.assertEqual(len(self.simulation.trips), 1)
        trip = list(self.simulation.trips.values())[0]
        self.assertEqual(trip.rider_id, "R000001")
        self.assertEqual(trip.driver_id, "D00001")
        self.assertEqual(len(self.simulation.events), 1)
        self.mock_city.get_travel_time.assert_called_with(1, 2)  # Driver location to pickup
        self.mock_city.get_travel_distance.assert_called_with(1, 2)  # Empty miles

    def test_process_pickup_event(self):
        """Test processing of pickup events"""
        # Setup
        trip_id = "T000001"
        driver = Driver("D00001", 2)  # Already at pickup location
        rider = Rider("R000001", self.start_time - timedelta(minutes=5), 2, 3, False)
        trip = Trip(trip_id, "R000001", "D00001", self.start_time - timedelta(minutes=5), 2, 3, False)
        
        self.simulation.drivers["D00001"] = driver
        self.simulation.riders["R000001"] = rider
        self.simulation.trips[trip_id] = trip
        
        # Call method
        self.simulation._process_pickup_event(trip_id)
        
        # Verify
        self.assertEqual(trip.pickup_time, self.simulation.current_time)
        self.assertEqual(rider.pickup_time, self.simulation.current_time)
        self.assertEqual(driver.status, DriverStatus.ON_TRIP)
        self.assertEqual(len(self.simulation.events), 1)  # One dropoff event scheduled
        self.assertEqual(len(self.simulation._dropoff_metadata), 1)  # Metadata stored for dropoff

    def test_process_dropoff_event(self):
        """Test processing of dropoff events"""
        # Setup
        trip_id = "T000001"
        driver = Driver("D00001", 2)
        driver.status = DriverStatus.ON_TRIP
        
        rider = Rider("R000001", self.start_time - timedelta(minutes=15), 2, 3, False)
        rider.status = RiderStatus.ON_TRIP
        rider.pickup_time = self.start_time - timedelta(minutes=10)
        
        trip = Trip(trip_id, "R000001", "D00001", self.start_time - timedelta(minutes=15), 2, 3, False)
        trip.pickup_time = self.start_time - timedelta(minutes=10)
        
        self.simulation.drivers["D00001"] = driver
        self.simulation.riders["R000001"] = rider
        self.simulation.trips[trip_id] = trip
        
        # Add dropoff metadata
        self.simulation._dropoff_metadata[trip_id] = {
            'trip_miles': 5.0,
            'trip_time': 600,  # 10 minutes
            'base_fare': 10.0,
            'total_fare': 15.0,
            'driver_pay': 12.0
        }
        
        # Call method
        self.simulation._process_dropoff_event(trip_id)
        
        # Verify
        self.assertEqual(trip.dropoff_time, self.simulation.current_time)
        self.assertEqual(rider.dropoff_time, self.simulation.current_time)
        self.assertEqual(rider.status, RiderStatus.DROPPED_OFF)
        self.assertEqual(driver.status, DriverStatus.IDLE)
        self.assertEqual(driver.total_earnings, 12.0)
        self.assertEqual(len(self.simulation._dropoff_metadata), 0)  # Metadata cleared
        self.assertEqual(self.simulation.metrics['total_completed_trips'], 1)
        self.assertEqual(len(self.simulation.time_series['trip_completions']), 1)
        self.assertEqual(len(self.simulation.time_series['driver_earnings']), 1)

    def test_process_events(self):
        """Test event processing logic"""
        # Setup events
        trip_id = "T000001"
        # Create a pickup event in the past
        heapq.heappush(
            self.simulation.events, 
            (self.start_time - timedelta(minutes=5), 'pickup', trip_id)
        )
        
        # Mock the individual event processors
        self.simulation._process_pickup_event = Mock()
        self.simulation._process_dropoff_event = Mock()
        self.simulation._process_cancel_event = Mock()
        
        # Call method
        self.simulation._process_events()
        
        # Verify
        self.simulation._process_pickup_event.assert_called_once_with(trip_id)
        self.assertEqual(len(self.simulation.events), 0)  # Event should be removed

    def test_gini_calculation(self):
        """Test Gini coefficient calculation"""
        # Test with equal distribution
        equal_earnings = np.array([100.0, 100.0, 100.0, 100.0])
        gini_equal = self.simulation._gini(equal_earnings)
        self.assertAlmostEqual(gini_equal, 0.0, places=4)
        
        # Test with completely unequal distribution
        unequal_earnings = np.array([0.0, 0.0, 0.0, 100.0])
        gini_unequal = self.simulation._gini(unequal_earnings)
        self.assertAlmostEqual(gini_unequal, 0.75, places=4)
        
        # Test with negative values (should be shifted to positive)
        negative_earnings = np.array([-50.0, 0.0, 50.0, 100.0])
        gini_negative = self.simulation._gini(negative_earnings)
        # After shifting, this becomes [0, 50, 100, 150]
        expected_gini = self.simulation._gini(np.array([0.0, 50.0, 100.0, 150.0]))
        self.assertAlmostEqual(gini_negative, expected_gini, places=4)

    @patch('tqdm.tqdm')
    def test_run_simulation(self, mock_tqdm):
        """Test full simulation run with mocked components"""
        # Setup
        mock_progress = MagicMock()
        mock_tqdm.return_value = mock_progress
        
        # Mock internal methods
        self.simulation._process_events = Mock()
        self.simulation._process_new_requests = Mock()
        self.simulation._match_riders_to_drivers = Mock()
        self.simulation._compute_final_metrics = Mock()
        
        # Setup simulation for a 10-minute run with 1-minute steps
        self.simulation.current_time = self.start_time
        self.simulation.end_time = self.start_time + timedelta(minutes=10)
        self.simulation.time_step = timedelta(minutes=1)
        
        # Call method
        self.simulation.run()
        
        # Verify
        # Should be called once per step (10 times)
        self.assertEqual(self.simulation._process_events.call_count, 10)
        self.assertEqual(self.simulation._process_new_requests.call_count, 10)
        self.assertEqual(self.simulation._match_riders_to_drivers.call_count, 10)
        self.simulation._compute_final_metrics.assert_called_once()
        mock_progress.update.assert_called()  # Progress bar should be updated
        mock_progress.close.assert_called_once()

    def test_compute_final_metrics(self):
        """Test final metrics calculation"""
        # Setup completed trips
        trip1 = Trip("T000001", "R000001", "D00001", 
                    self.start_time - timedelta(minutes=30),
                    1, 2, False)
        trip1.pickup_time = self.start_time - timedelta(minutes=25)
        trip1.dropoff_time = self.start_time - timedelta(minutes=15)
        trip1.trip_time = 600  # 10 minutes in seconds
        trip1.base_fare = 10.0
        trip1.total_fare = 15.0
        trip1.driver_pay = 12.0
        
        trip2 = Trip("T000002", "R000002", "D00002", 
                    self.start_time - timedelta(minutes=20),
                    3, 4, False)
        trip2.pickup_time = self.start_time - timedelta(minutes=15)
        trip2.dropoff_time = self.start_time - timedelta(minutes=5)
        trip2.trip_time = 600  # 10 minutes in seconds
        trip2.base_fare = 8.0
        trip2.total_fare = 12.0
        trip2.driver_pay = 9.0
        
        self.simulation.trips = {
            "T000001": trip1,
            "T000002": trip2
        }
        
        # Setup completed riders
        rider1 = Rider("R000001", self.start_time - timedelta(minutes=30), 1, 2, False)
        rider1.status = RiderStatus.DROPPED_OFF
        rider1.request_time = self.start_time - timedelta(minutes=30)
        rider1.pickup_time = self.start_time - timedelta(minutes=25)
        rider1.waiting_time = 300  # 5 minutes in seconds
        
        rider2 = Rider("R000002", self.start_time - timedelta(minutes=20), 3, 4, False)
        rider2.status = RiderStatus.DROPPED_OFF
        rider2.request_time = self.start_time - timedelta(minutes=20)
        rider2.pickup_time = self.start_time - timedelta(minutes=15)
        rider2.waiting_time = 300  # 5 minutes in seconds
        
        self.simulation.riders = {
            "R000001": rider1,
            "R000002": rider2
        }
        
        # Setup drivers
        driver1 = Driver("D00001", 2)
        driver1.total_earnings = 12.0
        driver1.empty_distance = 3.0
        driver1.trip_history = ["T000001"]
        
        driver2 = Driver("D00002", 4)
        driver2.total_earnings = 9.0
        driver2.empty_distance = 4.0
        driver2.trip_history = ["T000002"]
        
        self.simulation.drivers = {
            "D00001": driver1,
            "D00002": driver2
        }
        
        # Call method
        self.simulation._compute_final_metrics()
        
        # Verify
        self.assertEqual(self.simulation.metrics['total_completed_trips'], 2)
        self.assertEqual(self.simulation.metrics['avg_trip_time'], 600)
        self.assertEqual(self.simulation.metrics['avg_waiting_time'], 300)
        self.assertEqual(self.simulation.metrics['avg_driver_earnings'], 10.5)
        self.assertEqual(self.simulation.metrics['avg_empty_miles'], 3.5)
        # Gini coefficient for earnings [9.0, 12.0]
        expected_gini = (2*2 - 2 - 1) * 9.0 + (2*1 - 2 - 1) * 12.0
        expected_gini /= (2 * (9.0 + 12.0))
        self.assertAlmostEqual(self.simulation.metrics['gini_coefficient'], expected_gini, places=4)


class TestIntegrationSimulation(unittest.TestCase):
    """Integration test for Simulation class"""
    
    @patch('pandas.read_parquet')
    @patch('numpy.random.choice')
    @patch('tqdm.tqdm')
    def test_full_simulation_lifecycle(self, mock_tqdm, mock_choice, mock_read_parquet):
        """Test a complete simulation lifecycle with minimal mocking"""
        # Setup progress bar mock
        mock_progress = MagicMock()
        mock_tqdm.return_value = mock_progress
        
        # Setup location choice mock
        mock_choice.return_value = 1
        
        # Setup trip data
        start_time = datetime(2023, 1, 1, 12, 0)
        end_time = datetime(2023, 1, 1, 12, 10)  # 10-minute simulation
        
        mock_trip_df = pd.DataFrame({
            'request_datetime': [
                start_time + timedelta(minutes=1),
                start_time + timedelta(minutes=3),
                start_time + timedelta(minutes=5)
            ],
            'pickup_datetime': [
                start_time + timedelta(minutes=3),
                start_time + timedelta(minutes=5),
                start_time + timedelta(minutes=7)
            ],
            'dropoff_datetime': [
                start_time + timedelta(minutes=8),
                start_time + timedelta(minutes=9),
                start_time + timedelta(minutes=12)
            ],
            'PULocationID': [1, 2, 3],
            'DOLocationID': [4, 5, 6],
            'shared_request_flag': ['N', 'N', 'Y']
        })
        
        mock_read_parquet.return_value = mock_trip_df
        
        # Create real dependencies
        city = Mock(spec=City)
        city.zones = pd.DataFrame({
            'LocationID': [1, 2, 3, 4, 5, 6],
            'zone': ['Zone1', 'Zone2', 'Zone3', 'Zone4', 'Zone5', 'Zone6']
        })
        city.get_travel_time.return_value = 2  # 2 minutes travel time
        city.get_travel_distance.return_value = 1.0  # 1 mile
        city.estimate_trip_fare.return_value = (5.0, 7.5, 6.0)  # base, total, driver pay
        
        # Create real matching algorithm that simply matches by proximity (same location)
        matching_algorithm = Mock(spec=MatchingAlgorithm)
        
        def simple_match(riders, drivers, city, time):
            matches = []
            for rider in riders:
                for driver in drivers:
                    if driver.status == DriverStatus.IDLE:
                        matches.append((rider, driver))
                        driver.status = DriverStatus.MATCHED  # To prevent multiple matches
                        break
            return matches
            
        matching_algorithm.match = simple_match
        
        # Create simulation
        simulation = Simulation(city, matching_algorithm)
        
        # Initialize simulation
        simulation.initialize_from_data(
            "driver_data.parquet",
            "trip_data.parquet",
            start_time,
            end_time,
            batch_interval_minutes=1
        )
        
        # Run simulation
        simulation.run()
        
        # Verify results
        self.assertGreaterEqual(simulation.metrics['total_matches'], 0)
        self.assertGreaterEqual(simulation.metrics['total_completed_trips'], 0)
        
        # Check that metrics were calculated
        self.assertIn('avg_waiting_time', simulation.metrics)
        self.assertIn('avg_trip_time', simulation.metrics)
        self.assertIn('avg_driver_earnings', simulation.metrics)
        
        # Verify time series data was collected
        self.assertGreaterEqual(len(simulation.time_series['matches']), 0)
        
        # Verify progress bar was used
        mock_progress.update.assert_called()
        mock_progress.close.assert_called_once()


if __name__ == '__main__':
    unittest.main()