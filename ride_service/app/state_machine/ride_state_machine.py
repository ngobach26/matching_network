from transitions import Machine
from app.models import RideDetail

class RideStateMachine:
    # 1) Define all possible states
    states = [
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
            # you may allow completing from either ongoing or picked_up
            "source": ["ongoing", "picked_up"],
            "dest": "completed",
        },
        {
            "trigger": "cancel",
            "source": "*",  # can cancel from any state
            "dest": "cancelled",
        },
    ]

    def __init__(self, ride: RideDetail):
        self.ride = ride
        # 3) Build the Machine, telling it to store the current state on .state
        self.machine = Machine(
            model=self,
            states=self.states,
            transitions=self.transitions,
            initial=ride.status,
            after_state_change="sync_to_model",
        )

    def sync_to_model(self):
        """Callback after any transition to update the RideDetail."""
        self.ride.status = self.state
