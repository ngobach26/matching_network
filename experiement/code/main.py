from algorithms import *
from models import *
import time
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
from typing import List, Dict, Tuple, Optional, Callable
from enum import Enum
import heapq
from abc import ABC, abstractmethod
from collections import defaultdict
import geopandas as gpd
from tqdm import tqdm
from enviroments import *

def run_algorithm_comparison(trip_data_path, zone_data_path, start_date, end_date):
    """
    Run comparison of different matching algorithms
    
    Args:
        trip_data_path: Path to trip data
        zone_data_path: Path to zone data
        start_date: Simulation start date
        end_date: Simulation end date
    """
    # Initialize city
    city = City(zone_data_path)
    trip_df = pd.read_parquet(trip_data_path)
    city.central_zone_id = trip_df['PULocationID'].value_counts().idxmax()
    
    # Define algorithms to test
    algorithms = [
        ('Greedy Nearest', GreedyNearestNeighbor()),
        # ('Hungarian', BatchedHungarianAlgorithm()),
        # ('Fairness (0.3)', FairnessAwareMatching(fairness_weight=0.3)),
        # ('Fairness (0.5)', FairnessAwareMatching(fairness_weight=0.5)),
        ('Stable Matching', StableMatchingAlgorithm()),
        # ('Shared Rides', SharedRideInsertionHeuristic()),
        # ('Stable + Fairness', StableFairMatchingAlgorithm(city, city.central_zone_id, fairness_weight=0.4, centrality_weight=0.2)),
    ]
    
    # Results storage
    all_metrics = []
    algorithm_names = []
    
    for name, algorithm in algorithms:
        print(f"\nRunning simulation with {name} algorithm...")
        
        # Initialize simulation
        sim = Simulation(city, algorithm)
        sim.initialize_from_data(
            driver_data_path=None,  # Using synthetic drivers
            trip_data_path=trip_data_path,
            start_date=start_date,
            end_date=end_date,
            batch_interval_minutes=1
        )
        start_time = time.time()
        # Run simulation
        sim.run()
        duration = time.time() - start_time
        
        # Store results
        all_metrics.append(sim.metrics)
        algorithm_names.append(name)
        
    # Compare results
    analyzer = SimulationAnalyzer(sim)  # Use last simulation for analyzer
    analyzer.plot_metrics_comparison(all_metrics, algorithm_names)
    plt.show()


def main():
    # Example paths - replace with actual paths
    trip_data_path = "../data/sample.parquet"
    zone_data_path = "../data/taxi_zones/taxi_zones.shp"
    
    # Define simulation period
    start_date = datetime(2025, 1, 1, 8, 0, 0)  # 8 AM on January 1, 2023
    end_date = datetime(2025, 1, 1, 8, 10, 0)   # 6 PM on January 1, 2023
    
    # Run comparison
    run_algorithm_comparison(trip_data_path, zone_data_path, start_date, end_date)


if __name__ == "__main__":
    main()