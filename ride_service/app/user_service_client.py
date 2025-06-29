# user_service_client.py

import os
import httpx

class UserServiceClient:
    def __init__(self, base_url=None, timeout=5):
        self.base_url = base_url or os.getenv("USER_SERVICE_URL", "http://user-service:3000")
        self.timeout = timeout

    async def get_user_by_id(self, user_id: str, auth_header: str = None):
        endpoint = f"{self.base_url}/users/{user_id}"
        headers = {}
        if auth_header:
            headers["Authorization"] = auth_header

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(endpoint, headers=headers)
            resp.raise_for_status()
            return resp.json()

    async def create_invoice(self, ride, auth_header: str = None):
        endpoint = f"{self.base_url}/payments"
        data = {
            "service_type": "ride",
            "service_id": str(ride.id),
            "user_id": str(ride.rider_id),
            "amount": float(ride.fare.total_fare),
            "currency": "VND",
            "payment_method": ride.payment_method,
        }
        headers = {}
        if auth_header:
            headers["Authorization"] = auth_header

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(endpoint, json=data, headers=headers)
            resp.raise_for_status()
            return resp.json()

# --- Định nghĩa singleton ---
user_service_client = UserServiceClient()
