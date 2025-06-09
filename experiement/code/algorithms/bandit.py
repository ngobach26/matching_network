import time
import numpy as np
from models import Rider, Driver, City, DriverStatus, RiderStatus

class BanditMatchingAlgorithm:
    def __init__(self, algorithms, agent, algo_names=None, beta=1.0):
        self.algorithms = algorithms
        self.agent = agent
        self.algo_names = algo_names if algo_names else [str(i) for i in range(len(algorithms))]
        self.beta = beta
        self.history = []
        self.batch_idx = 0

    def match(self, riders, drivers, city, current_time, sim=None):
        context = build_context(sim, self.batch_idx) if sim else np.zeros(self.agent.d)
        chosen_idx = self.agent.select(context)
        chosen_algo = self.algorithms[chosen_idx]
        start = time.perf_counter()
        matches = chosen_algo.match(riders, drivers, city, current_time)
        runtime = time.perf_counter() - start
        wait_times = [r.waiting_time for r, d in matches if hasattr(r, "waiting_time") and r.waiting_time is not None]
        avg_wait = np.mean(wait_times) if wait_times else 0
        avg_wait = np.mean(wait_times) if wait_times else 0
        reward = -avg_wait - self.beta * runtime  # Quy về minimize cả wait lẫn runtime
        self.agent.update(chosen_idx, context, reward)
        self.history.append({
            "batch": self.batch_idx,
            "algo": self.algo_names[chosen_idx],
            "reward": reward,
            "wait": avg_wait,
            "runtime": runtime
        })
        self.batch_idx += 1
        return matches

def build_context(sim, batch_idx):
    """
    Xây dựng vector context cho LinUCB.
    """
    num_waiting_riders = len([r for r in sim.riders.values() if r.status == RiderStatus.WAITING])
    num_idle_drivers = len([d for d in sim.drivers.values() if d.status == DriverStatus.IDLE])
    # Trung bình wait time tất cả các rider vừa được pickup ở batch trước
    prev_wait_times = [w for t, _, w in sim.time_series['waiting_times'] if t <= sim.current_time]
    prev_batch_wait = np.mean(prev_wait_times[-num_waiting_riders:]) if prev_wait_times else 0
    prev_batch_runtime = sim.time_series['batch_runtime'][-1][1] if sim.time_series['batch_runtime'] else 0
    hour_of_day = sim.current_time.hour
    return np.array([
        num_waiting_riders, num_idle_drivers, prev_batch_wait, prev_batch_runtime, hour_of_day
    ])
