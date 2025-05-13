
from abc import abstractmethod, ABC
from datetime import datetime
from typing import List, Tuple

from models import Rider, Driver, City


class MatchingAlgorithm(ABC):
    """Base class for matching algorithms"""
    
    @abstractmethod
    def match(self, riders: List[Rider], drivers: List[Driver], city: City, current_time: datetime) -> List[Tuple[Rider, Driver]]:
        """
        Match riders to drivers
        
        Args:
            riders: List of riders waiting to be matched
            drivers: List of available drivers
            city: City model for distance/time calculations
            current_time: Current simulation time
            
        Returns:
            List of (rider, driver) tuples representing matches
        """
        pass
