# --------------------------------------------------------------------------- #
# QUEUEING HELPERS  (add right after CONFIG block)
# --------------------------------------------------------------------------- #
import math
import time


EWMA_RHO        = 0.30     # trọng số 30 % cho dữ liệu mới
CPU_BUDGET_MS   = 100      # SLA solver ≤ 100 ms
SERVICE_INIT    = 0.020    # 20 ms / request (ước lượng ban đầu)

stats_by_gh = {}           # geohash -> dict(lam_hat, svc_hat, svc_var, last_ts)

def _update_arrival_stats(gh, arrived=1):
    """Gọi mỗi khi buffer thêm 1 request để cập nhật λ̂(t)."""
    now = time.time()
    s = stats_by_gh.setdefault(
        gh,
        dict(lam_hat=arrived, svc_hat=SERVICE_INIT, svc_var=0.0, last_ts=now)
    )
    dt = max(now - s["last_ts"], 1e-6)
    # EWMA cho λ (số req / giây)
    lam_inst = arrived / dt
    s["lam_hat"] = (1 - EWMA_RHO) * s["lam_hat"] + EWMA_RHO * lam_inst
    s["last_ts"] = now

def _optimal_batch_size(gh):
    """B* ≈ sqrt( 2*mu / λ̂ ).  mu = 1 / svc_hat."""
    s = stats_by_gh[gh]
    mu = 1.0 / max(s["svc_hat"], 1e-6)
    lam = max(s["lam_hat"], 1e-6)
    return max(1, int(math.sqrt(2 * mu / lam)))

def _should_flush(gh, queued):
    """Trả True nếu nên ghép ngay."""
    B_star = _optimal_batch_size(gh)
    if queued >= B_star:
        # Variance guard : ước tính runtime 95 %-tile
        s = stats_by_gh[gh]
        mean = queued * s["svc_hat"]
        # Chebyshev đơn giản: std ≈ sqrt(n)*sigma
        std  = math.sqrt(queued) * math.sqrt(s["svc_var"])
        runtime_p95 = mean + 1.65 * std
        return runtime_p95 >= CPU_BUDGET_MS / 1000 or queued >= B_star
    return False

def _update_service_stats(gh, runtime_sec, batch_len):
    """Gọi sau mỗi flush để refine svc_hat & variance."""
    s   = stats_by_gh[gh]
    svc = runtime_sec / max(batch_len, 1)
    # Welford online var
    delta = svc - s["svc_hat"]
    s["svc_hat"] += 0.05 * delta                # step nhỏ 5 %
    s["svc_var"] = 0.95 * s["svc_var"] + 0.05 * delta * (svc - s["svc_hat"])
