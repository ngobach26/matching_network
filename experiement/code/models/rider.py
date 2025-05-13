from enum import Enum
from datetime import datetime

class RiderStatus(Enum):
    WAITING = 0
    MATCHED = 1
    PICKED_UP = 2
    DROPPED_OFF = 3
    CANCELLED = 4

class Rider:
    def __init__(self, rider_id: str, request_time: datetime, pickup_location_id: int, 
                 dropoff_location_id: int, shared_request: bool = False):
        self.rider_id = rider_id
        self.request_time = request_time
        self.pickup_location_id = pickup_location_id
        self.dropoff_location_id = dropoff_location_id
        self.shared_request = shared_request
        self.status = RiderStatus.WAITING
        self.assigned_driver_id = None
        self.pickup_time = None
        self.dropoff_time = None
        self.waiting_time = None
        self.cancel_time = None
        self.trip_id = None
        
    def assign_driver(self, driver_id: str):
        self.assigned_driver_id = driver_id
        self.status = RiderStatus.MATCHED
    
    def pickup(self, current_time: datetime):
        self.pickup_time = current_time
        self.waiting_time = (current_time - self.request_time).total_seconds()
        self.status = RiderStatus.PICKED_UP
    
    def dropoff(self, current_time: datetime):
        self.dropoff_time = current_time
        self.status = RiderStatus.DROPPED_OFF
    
    def cancel(self, current_time: datetime):
        self.cancel_time = current_time
        self.status = RiderStatus.CANCELLED

# if __name__ == "__main__":
#     rider = Rider(
#         rider_id="R001",
#         request_time=datetime(2025, 1, 1, 8, 0, 0),
#         pickup_location_id=101,
#         dropoff_location_id=202,
#         shared_request=True
#     )

#     print(f"Trạng thái ban đầu: {rider.status.name}")

#     # Gán tài xế lúc 8:03
#     rider.assign_driver("D001")
#     print(f"Trạng thái sau khi được gán tài xế: {rider.status.name}")
#     print(f"ID tài xế được gán: {rider.assigned_driver_id}")

#     # Đón hành khách lúc 8:05
#     rider.pickup(datetime(2025, 1, 1, 8, 5, 0))
#     print(f"Trạng thái sau pickup: {rider.status.name}")
#     print(f"Thời gian chờ: {rider.waiting_time} giây")

#     # Trả hành khách lúc 8:25
#     rider.dropoff(datetime(2025, 1, 1, 8, 25, 0))
#     print(f"Trạng thái sau dropoff: {rider.status.name}")
#     print(f"Giờ trả khách: {rider.dropoff_time}")