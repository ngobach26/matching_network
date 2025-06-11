import time
import numpy as np
from models import Rider, Driver, City, DriverStatus, RiderStatus

class BanditMatchingAlgorithm:
    def __init__(self, algorithms, agent, algo_names=None, alpha=0.5, n_recent=10):
        self.algorithms = algorithms
        self.agent = agent
        self.algo_names = algo_names if algo_names else [str(i) for i in range(len(algorithms))]
        self.alpha = alpha              # Trọng số cho wait time
        self.history = []
        self.batch_idx = 0
        self.n_recent = n_recent        # Số batch gần nhất dùng để chuẩn hóa động

    def match(self, riders, drivers, city, current_time, sim=None):
        context = build_context(sim, self.history, self.batch_idx, self.n_recent)
        chosen_idx = self.agent.select(context)
        chosen_algo = self.algorithms[chosen_idx]
        start = time.perf_counter()
        matches = chosen_algo.match(riders, drivers, city, current_time)
        runtime = time.perf_counter() - start
        wait_times = [
            city.get_travel_time(driver.location_id, rider.pickup_location_id) * 60  # phút -> giây
            for rider, driver in matches
        ]
        avg_wait = np.mean(wait_times) if wait_times else 0

        # Lấy cửa sổ lịch sử động cho reward
        waits_window = [item['wait'] for item in self.history[-self.n_recent:]] if self.history else []
        runtimes_window = [item['runtime'] for item in self.history[-self.n_recent:]] if self.history else []

        reward = compute_reward_balanced(
            avg_wait, runtime, waits_window, runtimes_window,
            runtime_fast=0.2, alpha=self.alpha
        )

        self.agent.update(chosen_idx, context, reward)
        self.history.append({
            "batch": self.batch_idx,
            "algo": self.algo_names[chosen_idx],
            "reward": reward,
            "wait": avg_wait,
            "runtime": runtime
        })
        print(f"Batch {self.batch_idx} - Algo: {self.algo_names[chosen_idx]} - Avg Wait: {avg_wait:.2f}s - Runtime: {runtime:.2f}s - Reward: {reward:.3f}")
        self.batch_idx += 1
        return matches

def build_context(sim, history, batch_idx, n_recent=10):
    """
    Kết hợp thông tin trạng thái hiện tại từ sim và lịch sử agent.
    """
    # --- Đặc trưng từ trạng thái hiện tại ---
    if sim is not None:
        num_waiting_riders = len([r for r in sim.riders.values() if r.status == RiderStatus.WAITING])
        num_idle_drivers = len([d for d in sim.drivers.values() if d.status == DriverStatus.IDLE])
        hour_of_day = sim.current_time.hour
    else:
        num_waiting_riders = 0
        num_idle_drivers = 0
        hour_of_day = batch_idx % 24

    # --- Đặc trưng lịch sử ---
    recent = history[-n_recent:] if len(history) >= n_recent else history
    avg_prev_wait = np.mean([item['wait'] for item in recent]) if recent else 0
    avg_prev_runtime = np.mean([item['runtime'] for item in recent]) if recent else 0

    print(f"Context for batch {batch_idx}: "
          f"num_waiting_riders={num_waiting_riders}, num_idle_drivers={num_idle_drivers}, "
          f"avg_prev_wait={avg_prev_wait}, avg_prev_runtime={avg_prev_runtime}, "
          f"hour_of_day={hour_of_day}")

    # Build context vector
    return np.array([
        num_waiting_riders,
        num_idle_drivers,
        avg_prev_wait,
        avg_prev_runtime,
        hour_of_day
    ])

def compute_reward_balanced(avg_wait, runtime, waits_window, runtimes_window,
                           runtime_fast=0.2, alpha=0.5):
    """
    - waits_window, runtimes_window: list các giá trị wait/runtime các batch trước (cửa sổ động).
    - runtime_fast: mọi runtime < ngưỡng này coi là như nhau.
    - alpha: trọng số cho wait.
    """
    # Xử lý runtime: log + cắt ngưỡng
    if runtime < runtime_fast:
        norm_runtime = 0
    else:
        # Thêm runtime hiện tại vào window để chuẩn hóa động
        runtimes = np.array(runtimes_window + [runtime]) if runtimes_window else np.array([runtime])
        # Đảm bảo các runtime nhỏ hơn ngưỡng đều coi như runtime_fast
        runtimes = np.where(runtimes < runtime_fast, runtime_fast, runtimes)
        # Log transform + chuẩn hóa động
        log_runtimes = np.log1p(runtimes - runtime_fast)
        curr_log_runtime = np.log1p(runtime - runtime_fast)
        # Nếu ptp = 0 (tất cả đều bằng nhau) thì norm = 0
        if np.ptp(log_runtimes) > 0:
            norm_runtime = (curr_log_runtime - np.min(log_runtimes)) / np.ptp(log_runtimes)
        else:
            norm_runtime = 0
        norm_runtime = np.clip(norm_runtime, 0, 1)

    # Xử lý wait time: chuẩn hóa động tuyến tính trong window
    waits = np.array(waits_window + [avg_wait]) if waits_window else np.array([avg_wait])
    if np.ptp(waits) > 0:
        norm_wait = (avg_wait - np.min(waits)) / np.ptp(waits)
    else:
        norm_wait = 0
    norm_wait = np.clip(norm_wait, 0, 1)

    # Reward cân bằng hai tiêu chí
    reward = - (alpha * norm_wait + (1 - alpha) * norm_runtime)
    return reward
