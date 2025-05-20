"""
hungarian.py - Implementation of the Hungarian algorithm for optimal bipartite matching
"""

import numpy as np
from typing import Dict, List, Tuple, Any


def hungarian_algorithm(cost_matrix: np.ndarray) -> Tuple[List[Tuple[int, int]], float]:
    """
    Implementation of the Hungarian algorithm for optimal assignment problems.
    
    Args:
        cost_matrix: A numpy array where cost_matrix[i,j] is the cost of assigning
                     rider i to driver j. In our context, this would be distance.
    
    Returns:
        A tuple containing:
        - A list of (row_idx, col_idx) pairs indicating the optimal assignments
        - The total cost of the assignment
    """
    # Store original for final cost calculation
    original_cost_matrix = cost_matrix.copy()
    
    # Make a working copy of cost matrix
    cost_matrix = cost_matrix.copy()
    
    n_rows, n_cols = cost_matrix.shape
    
    # Step 1: Row reduction - subtract min value from each row
    for i in range(n_rows):
        min_val = np.min(cost_matrix[i, :])
        cost_matrix[i, :] -= min_val
    
    # Step 2: Column reduction - subtract min value from each column
    for j in range(n_cols):
        min_val = np.min(cost_matrix[:, j])
        cost_matrix[:, j] -= min_val
    
    # Arrays for tracking covered rows and columns
    row_covered = np.zeros(n_rows, dtype=bool)
    col_covered = np.zeros(n_cols, dtype=bool)
    
    # Step 3: Cover all zeros with minimum number of lines
    # and create additional zeros if needed
    k = max(n_rows, n_cols)
    
    # Initialize assignment
    starred = np.zeros((n_rows, n_cols), dtype=bool)
    primed = np.zeros((n_rows, n_cols), dtype=bool)
    
    # Mark zeros in each row
    for i in range(n_rows):
        for j in range(n_cols):
            if cost_matrix[i, j] == 0 and not row_covered[i] and not col_covered[j]:
                starred[i, j] = True
                row_covered[i] = True
                col_covered[j] = True
    
    # Clear covers
    row_covered[:] = False
    col_covered[:] = False
    
    # Cover columns with starred zeros
    for j in range(n_cols):
        if np.any(starred[:, j]):
            col_covered[j] = True
    
    # Main loop until all columns are covered
    while not np.all(col_covered[:n_cols]):
        # Find an uncovered zero
        zero_found = False
        for i in range(n_rows):
            if row_covered[i]:
                continue
            
            for j in range(n_cols):
                if cost_matrix[i, j] == 0 and not col_covered[j]:
                    # Prime this zero
                    primed[i, j] = True
                    
                    # Find starred zero in the same row
                    starred_col = -1
                    for j2 in range(n_cols):
                        if starred[i, j2]:
                            starred_col = j2
                            break
                    
                    if starred_col == -1:
                        # No starred zero in this row - augment path
                        zero_found = True
                        # Augment path starting from this zero
                        path = [(i, j)]
                        while True:
                            # Find starred zero in the same column
                            row = -1
                            col = path[-1][1]
                            for i2 in range(n_rows):
                                if starred[i2, col]:
                                    row = i2
                                    break
                            
                            if row == -1:
                                # End of path
                                break
                            
                            path.append((row, col))
                            
                            # Find primed zero in the same row
                            col = -1
                            row = path[-1][0]
                            for j2 in range(n_cols):
                                if primed[row, j2]:
                                    col = j2
                                    break
                            
                            path.append((row, col))
                        
                        # Convert path
                        for r, c in path:
                            starred[r, c] = not starred[r, c]
                        
                        # Clear primed
                        primed[:] = False
                        
                        # Clear covers
                        row_covered[:] = False
                        col_covered[:] = False
                        
                        # Cover columns with starred zeros
                        for j2 in range(n_cols):
                            for i2 in range(n_rows):
                                if starred[i2, j2]:
                                    col_covered[j2] = True
                                    break
                        
                        break
                    else:
                        # Cover row and uncover column with starred zero
                        row_covered[i] = True
                        col_covered[starred_col] = False
                    
                    break
            
            if zero_found:
                break
        
        if not zero_found:
            # No uncovered zeros found - update costs
            # Find minimum uncovered value
            min_val = float('inf')
            for i in range(n_rows):
                if row_covered[i]:
                    continue
                for j in range(n_cols):
                    if col_covered[j]:
                        continue
                    min_val = min(min_val, cost_matrix[i, j])
            
            # Add to covered rows
            for i in range(n_rows):
                if row_covered[i]:
                    cost_matrix[i, :] += min_val
            
            # Subtract from uncovered columns
            for j in range(n_cols):
                if not col_covered[j]:
                    cost_matrix[:, j] -= min_val
    
    # Extract the assignment
    assignment = []
    for i in range(n_rows):
        for j in range(n_cols):
            if starred[i, j]:
                assignment.append((i, j))
    
    # Calculate the total cost from the original cost matrix
    total_cost = sum(original_cost_matrix[row, col] for row, col in assignment)
    
    return assignment, total_cost
    

def hungarian_matching(riders: List[Dict[str, Any]], drivers: List[Dict[str, Any]]) -> Dict[str, str]:
    """
    Use the Hungarian algorithm to match riders to drivers based on distance.
    
    Args:
        riders: List of rider dictionaries with 'id', 'lat', 'lng' keys
        drivers: List of driver dictionaries with 'id', 'lat', 'lng' keys
    
    Returns:
        A dictionary mapping rider_id to driver_id
    """
    # Handle edge cases
    if not riders or not drivers:
        return {}
    
    # Calculate cost matrix (distance matrix)
    n_riders = len(riders)
    n_drivers = len(drivers)
    
    # Create a rectangular cost matrix, padding with infinity if necessary
    max_dim = max(n_riders, n_drivers)
    cost_matrix = np.full((max_dim, max_dim), float('inf'))
    
    # Fill in the actual costs (distances)
    for i, rider in enumerate(riders):
        for j, driver in enumerate(drivers):
            # Calculate Euclidean distance as cost
            r_lat, r_lng = rider['lat'], rider['lng']
            d_lat, d_lng = driver['lat'], driver['lng']
            
            # Cost function as described in the documentation
            # cost = α·distance(r,d) + β·(1-rating(d))
            distance = ((r_lat - d_lat) ** 2 + (r_lng - d_lng) ** 2) ** 0.5
            
            # Use default rating of 1.0 if not available
            driver_rating = driver.get('rating', 1.0)
            
            # Default weights as mentioned in documentation
            alpha, beta = 1.0, 1.0
            cost = alpha * distance + beta * (1.0 - driver_rating)
            
            cost_matrix[i, j] = cost
    
    # Run Hungarian algorithm
    assignments, total_cost = hungarian_algorithm(cost_matrix)
    
    # Convert assignments to rider_id -> driver_id mapping
    matches = {}
    for row, col in assignments:
        if row < n_riders and col < n_drivers:  # Only include valid assignments (not dummy rows/cols)
            rider_id = riders[row]['id']
            driver_id = drivers[col]['id']
            matches[rider_id] = driver_id
    
    return matches