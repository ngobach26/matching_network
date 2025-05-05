import numpy as np
import networkx as nx
from scipy.optimize import linear_sum_assignment

def stable_matching(preferences):
    """ Gale-Shapley Stable Matching Algorithm """
    unmatched_men = list(preferences.keys())
    engaged = {}

    while unmatched_men:
        man = unmatched_men.pop(0)
        preferences_list = preferences[man]

        for woman in preferences_list:
            if woman not in engaged:
                engaged[woman] = man
                break
            else:
                current_partner = engaged[woman]
                if preferences_list.index(man) < preferences_list.index(current_partner):
                    engaged[woman] = man
                    unmatched_men.append(current_partner)
                    break

    return engaged

def hungarian_algorithm(cost_matrix):
    """ Hungarian Algorithm for Optimal Matching """
    row_ind, col_ind = linear_sum_assignment(cost_matrix)
    return list(zip(row_ind, col_ind))
