from datetime import datetime
from transitions import Machine
from app.models import Driver

class DriverStateMachine:
    # 1. Các trạng thái
    states = [
        "pending",
        "active",        
        "rejected",
        "info_required",
        "inactive",
    ]

    # 2. Các transition hợp lệ
    transitions = [
        {
            "trigger": "activate",      
            "source": "pending",
            "dest": "active",
        },
        {
            "trigger": "reject",
            "source": "pending",
            "dest": "rejected",
        },
        {
            "trigger": "request_info",
            "source": ["pending", "info_required"],
            "dest": "info_required",
        },
        {
            "trigger": "resubmit_info",
            "source": "info_required",
            "dest": "pending",
        },
        {
            "trigger": "deactivate",
            "source": "active",
            "dest": "inactive",
        },
        {
            "trigger": "activate",    
            "source": "inactive",
            "dest": "active",
        },
    ]

    def __init__(self, driver: Driver):
        self.driver = driver
        self.machine = Machine(
            model=self,
            states=self.states,
            transitions=self.transitions,
            initial=driver.status,
            after_state_change="sync_to_model",
        )

    def sync_to_model(self):
        """Callback sau mỗi lần chuyển trạng thái để cập nhật model Driver."""
        self.driver.status = self.state

