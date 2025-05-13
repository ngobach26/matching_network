import pandas as pd
import numpy as np
from typing import Tuple
import geopandas as gpd

import pandas as pd
import numpy as np
from typing import Tuple
import geopandas as gpd
from scipy.spatial import distance_matrix

class City:
    def __init__(self, zone_data_path: str, travel_time_data_path: str = None):
        """
        Initialize city model with zone data and optional travel time matrix.

        Args:
            zone_data_path: Path to TLC taxi zone shapefile or GeoJSON.
            travel_time_data_path: Optional path to pre-computed travel time matrix.
        """
        # Load shapefile and project to EPSG:2263 (NYC local projection, for accurate distance)
        self.zones = gpd.read_file(zone_data_path).to_crs(epsg=2263)
        self.zone_id_to_index = {zone_id: idx for idx, zone_id in enumerate(self.zones['LocationID'])}

        # Compute centroids
        self.zones['centroid'] = self.zones.geometry.centroid
        centroids = np.array([[point.x, point.y] for point in self.zones['centroid']])

        # Compute distance matrix in miles (2263 is in feet → 5280 ft = 1 mile)
        dist_ft = distance_matrix(centroids, centroids)
        self.distance_matrix = dist_ft / 5280
        np.fill_diagonal(self.distance_matrix, 0)

        # Compute travel time assuming avg speed = 15 mph → time = dist / speed * 60
        avg_speed_mph = 15
        self.time_matrix = (self.distance_matrix / avg_speed_mph) * 60
        np.fill_diagonal(self.time_matrix, 0)

    def get_travel_time(self, origin_id: int, destination_id: int) -> float:
        """Estimated travel time between zones (minutes)."""
        try:
            return self.time_matrix[
                self.zone_id_to_index[origin_id], 
                self.zone_id_to_index[destination_id]
            ]
        except KeyError:
            return 15.0

    def get_travel_distance(self, origin_id: int, destination_id: int) -> float:
        """Estimated distance between zones (miles)."""
        try:
            return self.distance_matrix[
                self.zone_id_to_index[origin_id], 
                self.zone_id_to_index[destination_id]
            ]
        except KeyError:
            return 3.0

    def estimate_trip_fare(self, distance: float, time: float, dropoff_zone_id: int = None) -> Tuple[float, float, float]:
        base_fare = 3.00
        distance_fare = distance * 1.75
        time_fare = (time / 60) * 0.35
        fare = base_fare + distance_fare + time_fare

        congestion_surcharge = 2.75 if dropoff_zone_id and self.is_in_manhattan(dropoff_zone_id) else 0
        black_car_fund = fare * 0.025
        sales_tax = fare * 0.08875
        total_fare = fare + congestion_surcharge + black_car_fund + sales_tax
        driver_pay = fare * 0.75

        return fare, total_fare, driver_pay

    def is_in_manhattan(self, zone_id: int) -> bool:
        """Simple check for whether zone is in Manhattan."""
        return 1 <= zone_id <= 164


# def test_city_class():
#     city = City("../../data/taxi_zones/taxi_zones.shp")

#     # In thông tin cơ bản
#     print("Tổng số khu vực:", len(city.zones))

#     # Lấy 2 LocationID để test
#     zone_ids = city.zones['LocationID'].tolist()
#     origin_id = zone_ids[0]
#     destination_id = zone_ids[57]

#     # Lấy thời gian di chuyển
#     travel_time = city.get_travel_time(origin_id, destination_id)
#     travel_distance = city.get_travel_distance(origin_id, destination_id)

#     print(f"Thời gian từ zone {origin_id} đến {destination_id}: {travel_time:.2f} phút")
#     print(f"Khoảng cách từ zone {origin_id} đến {destination_id}: {travel_distance:.2f} mile")

#     # Ước tính chi phí chuyến đi
#     base, total, pay = city.estimate_trip_fare(
#         distance=travel_distance,
#         time=travel_time,
#         dropoff_zone_id=destination_id
#     )

#     print(f"Chi phí cơ bản: ${base:.2f}")
#     print(f"Tổng chi phí: ${total:.2f}")
#     print(f"Tiền tài xế nhận: ${pay:.2f}")

#     # Kiểm tra Manhattan
#     is_manhattan = city.is_in_manhattan(destination_id)
#     print(f"Zone {destination_id} {'thuộc' if is_manhattan else 'không thuộc'} Manhattan")

# if __name__ == "__main__":
#     test_city_class()