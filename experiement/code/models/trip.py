from datetime import datetime, timedelta

class Trip:
    def __init__(self, trip_id: str, rider_id: str, driver_id: str,
                 request_time: datetime, pickup_location_id: int, dropoff_location_id: int,
                 shared_request: bool = False):
        self.trip_id = trip_id
        self.rider_id = rider_id
        self.driver_id = driver_id
        self.request_time = request_time
        self.dispatch_time = None
        self.pickup_time = None
        self.dropoff_time = None
        self.pickup_location_id = pickup_location_id
        self.dropoff_location_id = dropoff_location_id
        self.shared_request = shared_request
        self.shared_match = False
        self.trip_miles = 0.0
        self.trip_time = 0.0
        self.base_fare = 0.0
        self.total_fare = 0.0
        self.driver_pay = 0.0
        
    def dispatch(self, current_time: datetime):
        self.dispatch_time = current_time
    
    def pickup(self, current_time: datetime):
        self.pickup_time = current_time
    
    def dropoff(self, current_time: datetime, trip_miles: float, trip_time: float, 
                base_fare: float, total_fare: float, driver_pay: float):
        self.dropoff_time = current_time
        self.trip_miles = trip_miles
        self.trip_time = trip_time
        self.base_fare = base_fare
        self.total_fare = total_fare
        self.driver_pay = driver_pay
        
    def calculate_waiting_time(self):
        if self.pickup_time and self.request_time:
            return (self.pickup_time - self.request_time).total_seconds()
        return None
    
    def is_completed(self):
        return self.dropoff_time is not None

# if __name__ == "__main__":
#     # Giả sử thời gian hiện tại
#     request_time = datetime(2025, 1, 1, 8, 0, 0)

#     # Khởi tạo trip
#     trip = Trip(
#         trip_id="T001",
#         rider_id="R001",
#         driver_id="D001",
#         request_time=request_time,
#         pickup_location_id=101,
#         dropoff_location_id=202,
#         shared_request=False
#     )

#     print(f"Chuyến đi khởi tạo, trạng thái hoàn tất? {trip.is_completed()}")

#     # Dispatch sau 1 phút
#     trip.dispatch(request_time + timedelta(minutes=1))
#     print(f"Dispatch lúc: {trip.dispatch_time}")

#     # Pickup sau 4 phút
#     trip.pickup(request_time + timedelta(minutes=4))
#     print(f"Pickup lúc: {trip.pickup_time}")
#     print(f"Thời gian chờ: {trip.calculate_waiting_time()} giây")

#     # Dropoff sau 30 phút
#     trip.dropoff(
#         current_time=request_time + timedelta(minutes=34),
#         trip_miles=7.5,
#         trip_time=1800,  # 30 phút
#         base_fare=2.55,
#         total_fare=20.50,
#         driver_pay=15.00
#     )

#     print(f"Dropoff lúc: {trip.dropoff_time}")
#     print(f"Tổng quãng đường: {trip.trip_miles} miles")
#     print(f"Tổng thời gian: {trip.trip_time} giây")
#     print(f"Tài xế nhận được: ${trip.driver_pay}")
#     print(f"Chuyến đi đã hoàn tất? {trip.is_completed()}")