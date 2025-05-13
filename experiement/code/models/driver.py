from enum import Enum
from datetime import datetime, timedelta


class DriverStatus(Enum):
    IDLE = 0
    ASSIGNED = 1
    EN_ROUTE_TO_PICKUP = 2
    ARRIVED_AT_PICKUP = 3
    WITH_RIDER = 4
    COMPLETED_TRIP = 5

class Driver:
    def __init__(self, driver_id: str, initial_location_id: int):
        self.driver_id = driver_id
        self.location_id = initial_location_id
        self.status = DriverStatus.IDLE
        self.current_rider_id = None
        self.trip_history = []
        self.idle_since = None
        self.total_earnings = 0.0
        self.total_working_time = 0.0
        self.total_net_earnings = 0.0
        self.total_idle_time = 0.0
        self.total_distance = 0.0
        self.empty_distance = 0.0
        
    def assign_rider(self, rider_id: str, current_time: datetime):
        self.current_rider_id = rider_id
        self.status = DriverStatus.ASSIGNED
        if self.idle_since is not None:
            self.total_idle_time += (current_time - self.idle_since).total_seconds()
            self.idle_since = None
    
    def start_pickup(self):
        self.status = DriverStatus.EN_ROUTE_TO_PICKUP
    
    def arrive_at_pickup(self, location_id: int, current_time: datetime):
        self.location_id = location_id
        self.status = DriverStatus.ARRIVED_AT_PICKUP
    
    def start_trip(self, current_time: datetime):
        self.status = DriverStatus.WITH_RIDER
    
    def complete_trip(self, trip, current_time: datetime):
        """Complete a trip and update driver stats"""
        self.location_id = trip.dropoff_location_id
        self.status = DriverStatus.IDLE
        self.idle_since = current_time
        
        # Update statistics
        self.total_earnings += trip.driver_pay
        self.total_working_time += trip.trip_time
        self.total_distance += trip.trip_miles
        self.trip_history.append(trip.trip_id)
        self.current_rider_id = None
        
    def go_idle(self, current_time: datetime):
        self.status = DriverStatus.IDLE
        self.idle_since = current_time
        self.current_rider_id = None

# if __name__ == "__main__":
#     # Giả lập một trip object nhỏ
#     class FakeTrip:
#         def __init__(self):
#             self.trip_id = "T0001"
#             self.driver_pay = 20.0
#             self.trip_time = 900  # 15 phút
#             self.trip_miles = 5.0
#             self.dropoff_location_id = 200

#     # Tạo tài xế tại zone 100
#     driver = Driver(driver_id="D0001", initial_location_id=100)

#     # Bắt đầu idle lúc 8:00
#     t0 = datetime(2025, 1, 1, 8, 0, 0)
#     driver.idle_since = t0

#     # Gán khách lúc 8:05
#     t1 = t0 + timedelta(minutes=5)
#     driver.assign_rider("R0001", t1)

#     print("Status sau khi gán rider:", driver.status.name)
#     print("Idle time tích lũy:", driver.total_idle_time)  # 300s

#     # Bắt đầu đi đón
#     driver.start_pickup()
#     print("Status sau start_pickup:", driver.status.name)

#     # Tới điểm đón
#     driver.arrive_at_pickup(location_id=105, current_time=t1 + timedelta(minutes=5))
#     print("Location sau khi đến pickup:", driver.location_id)

#     # Bắt đầu trip
#     driver.start_trip(current_time=t1 + timedelta(minutes=5))

#     # Kết thúc trip sau 15 phút
#     trip = FakeTrip()
#     t2 = t1 + timedelta(minutes=20)
#     driver.complete_trip(trip, current_time=t2)

#     print("Earnings:", driver.total_earnings)
#     print("Trip history:", driver.trip_history)
#     print("Current status:", driver.status.name)