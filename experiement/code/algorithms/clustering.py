from scipy.optimize import linear_sum_assignment
import numpy as np
from sklearn.cluster import KMeans
import math
from datetime import datetime
from typing import List, Tuple
import numpy as np
from algorithms.greedy_nearest_neighbor import GreedyNearestNeighbor
from models import Rider, Driver, City, DriverStatus
from algorithms.matching_algorithm import MatchingAlgorithm

class ClusteredHungarianAlgorithm(MatchingAlgorithm):
    """
    A two-stage matching algorithm that:
    1. First clusters riders and drivers into geographical zones
    2. Then applies Hungarian algorithm within each cluster
    
    This approach balances global optimality with computational efficiency
    and can implicitly enforce geographical constraints.
    
    Parameters:
        - num_clusters: Number of geographical clusters to create
        - cluster_method: Method to use for clustering ('kmeans', 'grid', or 'zone')
        - balance_clusters: Whether to balance cluster sizes for even workload
        - max_distance: Maximum allowed pickup distance (miles)
        - cluster_by: What to cluster by ('pickup', 'driver', or 'both')
    """
    
    def __init__(self, num_clusters=5, cluster_method='kmeans', balance_clusters=True, 
                 max_distance=None, cluster_by='both'):
        self.num_clusters = num_clusters
        self.cluster_method = cluster_method
        self.balance_clusters = balance_clusters
        self.max_distance = max_distance
        self.cluster_by = cluster_by
        
        # Cache for zone coordinates (to avoid repeated lookups)
        self.zone_coordinates = {}
        
    def match(self, riders, drivers, city, current_time):
        if not riders or not drivers:
            return []
            
        # Initialize zone coordinates cache if empty
        if not self.zone_coordinates:
            self._initialize_zone_coordinates(city)
            
        # Get coordinates for all pickup locations and driver locations
        pickup_locations = []
        pickup_to_rider = {}  # Maps (x,y) to rider
        
        for rider in riders:
            pickup_loc_id = rider.pickup_location_id
            if pickup_loc_id in self.zone_coordinates:
                x, y = self.zone_coordinates[pickup_loc_id]
                pickup_locations.append((x, y))
                pickup_to_rider[(x, y)] = rider
        
        driver_locations = []
        driver_to_driver = {}  # Maps (x,y) to driver
        
        for driver in drivers:
            loc_id = driver.location_id
            if loc_id in self.zone_coordinates:
                x, y = self.zone_coordinates[loc_id]
                driver_locations.append((x, y))
                driver_to_driver[(x, y)] = driver
                
        # If not enough valid locations, fall back to simple matching
        if len(pickup_locations) < 2 or len(driver_locations) < 2:
            return self._fallback_matching(riders, drivers, city)
            
        # Create clusters
        if self.cluster_method == 'kmeans':
            rider_clusters, driver_clusters = self._create_kmeans_clusters(
                pickup_locations, driver_locations, city
            )
        elif self.cluster_method == 'grid':
            rider_clusters, driver_clusters = self._create_grid_clusters(
                pickup_locations, driver_locations, city
            )
        elif self.cluster_method == 'zone':
            rider_clusters, driver_clusters = self._create_zone_based_clusters(
                riders, drivers, city
            )
        else:
            # Default to KMeans
            rider_clusters, driver_clusters = self._create_kmeans_clusters(
                pickup_locations, driver_locations, city
            )
            
        # Match within each cluster
        all_matches = []
        
        for cluster_id in range(max(len(rider_clusters), len(driver_clusters))):
            # Get riders and drivers for this cluster
            cluster_riders = []
            if cluster_id < len(rider_clusters):
                for x, y in rider_clusters[cluster_id]:
                    rider = pickup_to_rider.get((x, y))
                    if rider:
                        cluster_riders.append(rider)
                        
            cluster_drivers = []
            if cluster_id < len(driver_clusters):
                for x, y in driver_clusters[cluster_id]:
                    driver = driver_to_driver.get((x, y))
                    if driver and driver not in [d for _, d in all_matches]:
                        cluster_drivers.append(driver)
            
            # Skip empty clusters
            if not cluster_riders or not cluster_drivers:
                continue
                
            # Apply Hungarian algorithm within cluster
            cluster_matches = self._hungarian_match(cluster_riders, cluster_drivers, city)
            all_matches.extend(cluster_matches)
            
        return all_matches
    
    def _initialize_zone_coordinates(self, city):
        """Initialize coordinates for all zones in the city"""
        for zone_data in city.zones.itertuples():
            if hasattr(zone_data, 'LocationID') and hasattr(zone_data, 'geometry'):
                # Get centroid of zone geometry
                try:
                    centroid = zone_data.geometry.centroid
                    self.zone_coordinates[zone_data.LocationID] = (centroid.x, centroid.y)
                except:
                    # If geometry is not valid, use zone ID as coordinates (rough approximation)
                    self.zone_coordinates[zone_data.LocationID] = (
                        zone_data.LocationID % 100, zone_data.LocationID // 100
                    )
    
    def _create_kmeans_clusters(self, pickup_locations, driver_locations, city):
        """Create clusters using KMeans algorithm"""
        # Determine points to cluster based on cluster_by parameter
        if self.cluster_by == 'pickup':
            # Cluster based on pickup locations only
            points_to_cluster = np.array(pickup_locations)
        elif self.cluster_by == 'driver':
            # Cluster based on driver locations only
            points_to_cluster = np.array(driver_locations)
        else:  # 'both'
            # Cluster based on both pickup and driver locations
            points_to_cluster = np.array(pickup_locations + driver_locations)
            
        # Handle edge case with fewer points than clusters
        actual_num_clusters = min(self.num_clusters, len(points_to_cluster))
        
        if actual_num_clusters < 2:
            # Not enough points for meaningful clustering
            return ([pickup_locations], [driver_locations])
            
        # Run KMeans
        kmeans = KMeans(n_clusters=actual_num_clusters, random_state=42)
        labels = kmeans.fit_predict(points_to_cluster)
        
        # Assign pickup locations to clusters
        rider_clusters = [[] for _ in range(actual_num_clusters)]
        
        if self.cluster_by in ['pickup', 'both']:
            for i, (x, y) in enumerate(pickup_locations):
                point_idx = i  # Index in points_to_cluster
                if self.cluster_by == 'both':
                    # Find this point in the combined array
                    for j, (px, py) in enumerate(points_to_cluster):
                        if px == x and py == y:
                            point_idx = j
                            break
                cluster_id = labels[point_idx]
                rider_clusters[cluster_id].append((x, y))
        else:
            # Assign riders to nearest cluster centroid
            for x, y in pickup_locations:
                distances = [
                    np.sqrt((x - centroid[0])**2 + (y - centroid[1])**2)
                    for centroid in kmeans.cluster_centers_
                ]
                cluster_id = np.argmin(distances)
                rider_clusters[cluster_id].append((x, y))
        
        # Assign driver locations to clusters
        driver_clusters = [[] for _ in range(actual_num_clusters)]
        
        if self.cluster_by in ['driver', 'both']:
            for i, (x, y) in enumerate(driver_locations):
                point_idx = i  # Index in points_to_cluster
                if self.cluster_by == 'both':
                    # Find this point in the combined array
                    offset = len(pickup_locations)
                    point_idx = i + offset
                cluster_id = labels[point_idx]
                driver_clusters[cluster_id].append((x, y))
        else:
            # Assign drivers to nearest cluster centroid
            for x, y in driver_locations:
                distances = [
                    np.sqrt((x - centroid[0])**2 + (y - centroid[1])**2)
                    for centroid in kmeans.cluster_centers_
                ]
                cluster_id = np.argmin(distances)
                driver_clusters[cluster_id].append((x, y))
        
        # Balance clusters if needed
        if self.balance_clusters:
            rider_clusters, driver_clusters = self._balance_clusters(
                rider_clusters, driver_clusters
            )
            
        return rider_clusters, driver_clusters
    
    def _create_grid_clusters(self, pickup_locations, driver_locations, city):
        """Create clusters by dividing the city into a grid"""
        # Find bounding box
        all_points = pickup_locations + driver_locations
        if not all_points:
            return ([pickup_locations], [driver_locations])
            
        min_x = min(x for x, _ in all_points)
        max_x = max(x for x, _ in all_points)
        min_y = min(y for _, y in all_points)
        max_y = max(y for _, y in all_points)
        
        # Calculate grid dimensions
        grid_size = math.ceil(math.sqrt(self.num_clusters))
        cell_width = (max_x - min_x) / grid_size if max_x > min_x else 1
        cell_height = (max_y - min_y) / grid_size if max_y > min_y else 1
        
        # Initialize clusters
        rider_clusters = [[] for _ in range(grid_size * grid_size)]
        driver_clusters = [[] for _ in range(grid_size * grid_size)]
        
        # Assign pickups to grid cells
        for x, y in pickup_locations:
            if cell_width > 0 and cell_height > 0:
                grid_x = min(grid_size - 1, int((x - min_x) / cell_width))
                grid_y = min(grid_size - 1, int((y - min_y) / cell_height))
                cluster_id = grid_y * grid_size + grid_x
                rider_clusters[cluster_id].append((x, y))
        
        # Assign drivers to grid cells
        for x, y in driver_locations:
            if cell_width > 0 and cell_height > 0:
                grid_x = min(grid_size - 1, int((x - min_x) / cell_width))
                grid_y = min(grid_size - 1, int((y - min_y) / cell_height))
                cluster_id = grid_y * grid_size + grid_x
                driver_clusters[cluster_id].append((x, y))
        
        # Remove empty clusters
        rider_clusters = [cluster for cluster in rider_clusters if cluster]
        driver_clusters = [cluster for cluster in driver_clusters if cluster]
        
        # Balance clusters if needed
        if self.balance_clusters:
            rider_clusters, driver_clusters = self._balance_clusters(
                rider_clusters, driver_clusters
            )
            
        return rider_clusters, driver_clusters
    
    def _create_zone_based_clusters(self, riders, drivers, city):
        """Create clusters based on city zones or neighborhoods"""
        # Group by zone
        rider_by_zone = {}
        for rider in riders:
            zone_id = rider.pickup_location_id
            if zone_id not in rider_by_zone:
                rider_by_zone[zone_id] = []
            
            if zone_id in self.zone_coordinates:
                x, y = self.zone_coordinates[zone_id]
                rider_by_zone[zone_id].append((x, y))
        
        driver_by_zone = {}
        for driver in drivers:
            zone_id = driver.location_id
            if zone_id not in driver_by_zone:
                driver_by_zone[zone_id] = []
            
            if zone_id in self.zone_coordinates:
                x, y = self.zone_coordinates[zone_id]
                driver_by_zone[zone_id].append((x, y))
        
        # Get list of all zones
        all_zones = set(rider_by_zone.keys()) | set(driver_by_zone.keys())
        
        # If we have too many zones, we need to group them
        if len(all_zones) > self.num_clusters:
            # Create clusters of nearby zones using KMeans
            zone_locations = []
            zone_mapping = {}
            
            for i, zone_id in enumerate(all_zones):
                if zone_id in self.zone_coordinates:
                    zone_locations.append(self.zone_coordinates[zone_id])
                    zone_mapping[self.zone_coordinates[zone_id]] = zone_id
            
            if zone_locations:
                kmeans = KMeans(n_clusters=self.num_clusters, random_state=42)
                zone_labels = kmeans.fit_predict(zone_locations)
                
                # Map zones to clusters
                zone_to_cluster = {}
                for i, loc in enumerate(zone_locations):
                    zone_id = zone_mapping[loc]
                    zone_to_cluster[zone_id] = zone_labels[i]
                
                # Create clusters
                rider_clusters = [[] for _ in range(self.num_clusters)]
                driver_clusters = [[] for _ in range(self.num_clusters)]
                
                for zone_id, points in rider_by_zone.items():
                    if zone_id in zone_to_cluster:
                        cluster_id = zone_to_cluster[zone_id]
                        rider_clusters[cluster_id].extend(points)
                
                for zone_id, points in driver_by_zone.items():
                    if zone_id in zone_to_cluster:
                        cluster_id = zone_to_cluster[zone_id]
                        driver_clusters[cluster_id].extend(points)
            else:
                # Fallback to single cluster
                rider_points = []
                for points in rider_by_zone.values():
                    rider_points.extend(points)
                
                driver_points = []
                for points in driver_by_zone.values():
                    driver_points.extend(points)
                
                return ([rider_points], [driver_points])
        else:
            # Each zone is its own cluster
            rider_clusters = []
            driver_clusters = []
            
            for zone_id in all_zones:
                rider_points = rider_by_zone.get(zone_id, [])
                driver_points = driver_by_zone.get(zone_id, [])
                
                if rider_points or driver_points:
                    rider_clusters.append(rider_points)
                    driver_clusters.append(driver_points)
        
        # Remove empty clusters
        rider_clusters = [cluster for cluster in rider_clusters if cluster]
        driver_clusters = [cluster for cluster in driver_clusters if cluster]
        
        # Balance clusters if needed
        if self.balance_clusters:
            rider_clusters, driver_clusters = self._balance_clusters(
                rider_clusters, driver_clusters
            )
            
        return rider_clusters, driver_clusters
    
    def _balance_clusters(self, rider_clusters, driver_clusters):
        """Balance the number of riders and drivers across clusters"""
        # First, make lists same length
        max_len = max(len(rider_clusters), len(driver_clusters))
        
        while len(rider_clusters) < max_len:
            rider_clusters.append([])
        
        while len(driver_clusters) < max_len:
            driver_clusters.append([])
        
        # Try to balance number of drivers and riders in each cluster
        for i in range(max_len):
            rider_count = len(rider_clusters[i])
            driver_count = len(driver_clusters[i])
            
            # If severe imbalance, try to move some drivers
            if driver_count > 0 and rider_count > 0:
                ratio = rider_count / driver_count
                
                if ratio < 0.5:  # Too many drivers
                    # Find cluster with fewest drivers relative to riders
                    target_cluster = i
                    target_ratio = ratio
                    
                    for j in range(max_len):
                        if j != i and rider_clusters[j]:
                            j_ratio = len(rider_clusters[j]) / max(1, len(driver_clusters[j]))
                            if j_ratio > target_ratio:
                                target_cluster = j
                                target_ratio = j_ratio
                    
                    # Move some drivers if we found a better cluster
                    if target_cluster != i:
                        num_to_move = min(driver_count - int(rider_count / 0.75), 
                                         driver_count // 4)  # Move up to 25% of drivers
                        if num_to_move > 0:
                            moved_drivers = driver_clusters[i][-num_to_move:]
                            driver_clusters[i] = driver_clusters[i][:-num_to_move]
                            driver_clusters[target_cluster].extend(moved_drivers)
                
                elif ratio > 2.0:  # Too many riders
                    # Find cluster with fewest riders relative to drivers
                    target_cluster = i
                    target_ratio = ratio
                    
                    for j in range(max_len):
                        if j != i and driver_clusters[j]:
                            j_ratio = len(rider_clusters[j]) / max(1, len(driver_clusters[j]))
                            if j_ratio < target_ratio:
                                target_cluster = j
                                target_ratio = j_ratio
                    
                    # Move some riders if we found a better cluster
                    if target_cluster != i:
                        num_to_move = min(rider_count - int(driver_count * 1.5), 
                                         rider_count // 4)  # Move up to 25% of riders
                        if num_to_move > 0:
                            moved_riders = rider_clusters[i][-num_to_move:]
                            rider_clusters[i] = rider_clusters[i][:-num_to_move]
                            rider_clusters[target_cluster].extend(moved_riders)
        
        # Remove any empty clusters
        rider_clusters = [cluster for cluster in rider_clusters if cluster]
        driver_clusters = [cluster for cluster in driver_clusters if cluster]
        
        return rider_clusters, driver_clusters
    
    def _hungarian_match(self, riders, drivers, city):
        """Apply Hungarian algorithm to match riders and drivers"""
        matches = []
        if not riders or not drivers:
            return matches
            
        # Create cost matrix
        cost_matrix = np.zeros((len(riders), len(drivers)))
        
        for i, rider in enumerate(riders):
            for j, driver in enumerate(drivers):
                # Calculate pickup time/distance as cost
                distance = city.get_travel_distance(driver.location_id, rider.pickup_location_id)
                
                # Apply maximum distance constraint if specified
                if self.max_distance is not None and distance > self.max_distance:
                    cost_matrix[i, j] = float('inf')  # Prevent this match
                else:
                    # Cost is pickup distance
                    cost_matrix[i, j] = distance
        
        # Apply Hungarian algorithm for minimum cost matching
        try:
            row_ind, col_ind = linear_sum_assignment(cost_matrix)
        except:
            # Fallback if Hungarian algorithm fails
            return self._greedy_match(riders, drivers, city)
        
        # Create matches, but skip "infinite" cost matches
        for i, j in zip(row_ind, col_ind):
            if cost_matrix[i, j] != float('inf'):
                matches.append((riders[i], drivers[j]))
                
        return matches
    
    def _greedy_match(self, riders, drivers, city):
        """Fallback to greedy matching when other methods fail"""
        matches = []
        available_drivers = set(drivers)
        
        # Sort riders by waiting time (longest first)
        sorted_riders = sorted(riders, 
                              key=lambda r: (datetime.now() - r.request_time).total_seconds(),
                              reverse=True)
        
        for rider in sorted_riders:
            if not available_drivers:
                break
                
            # Find closest available driver
            best_driver = min(available_drivers,
                             key=lambda d: city.get_travel_distance(d.location_id, rider.pickup_location_id))
            
            # Check maximum distance constraint
            distance = city.get_travel_distance(best_driver.location_id, rider.pickup_location_id)
            if self.max_distance is None or distance <= self.max_distance:
                matches.append((rider, best_driver))
                available_drivers.remove(best_driver)
                
        return matches
    
    def _fallback_matching(self, riders, drivers, city):
        """Simple fallback matching when clustering fails"""
        return self._greedy_match(riders, drivers, city)
