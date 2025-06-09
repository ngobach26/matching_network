from datetime import datetime
from transitions import Machine
from app.models import Ride


class RideStateMachine:
    # 1) Define all possible states
    states = [
        "pending",
        "accepted",
        "arrived",
        "picked_up",
        "ongoing",
        "completed",
        "cancelled",
    ]

    # 2) Define allowed transitions
    transitions = [
        {
            "trigger": "accept",
            "source": "pending",
            "dest": "accepted",
        },
        {
            "trigger": "arrive",
            "source": "accepted",
            "dest": "arrived",
        },
        {
            "trigger": "pick_up",
            "source": "arrived",
            "dest": "picked_up",
        },
        {
            "trigger": "start_ride",
            "source": "picked_up",
            "dest": "ongoing",
        },
        {
            "trigger": "complete",
            "source": "ongoing",
            "dest": "completed",
        },
        {
            "trigger": "cancel",
            "source": "*",
            "dest": "cancelled",
        },
    ]

    def __init__(self, ride: Ride):
        self.ride = ride
        self.machine = Machine(
            model=self,
            states=self.states,
            transitions=self.transitions,
            initial=ride.status,
            after_state_change="sync_to_model",
        )

    def sync_to_model(self):
        """Callback after any transition to update the Ride model fields."""
        self.ride.status = self.state
        now = datetime.now()

        if self.state == "accepted":
            self.ride.matched_at = now
        elif self.state == "arrived":
            self.ride.arrived_at = now
        elif self.state == "ongoing":
            self.ride.start_at = now
        elif self.state == "completed":
            self.ride.end_at = now
