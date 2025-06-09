import httpx
import os

from app.models.ride import Ride

async def create_invoice_via_user_service(ride: Ride):
    user_service_url = os.getenv("USER_SERVICE_URL", "http://user-service:3000")
    endpoint = f"{user_service_url}/payments"  # số nhiều, đúng với Rails resources

    data = {
        "service_type": "ride",
        "service_id": str(ride.id),
        "user_id": str(ride.user_id),
        "amount": float(ride.fare.total_fare),
        "currency": "VND",
        "payment_method": ride.payment_method,
    }
    async with httpx.AsyncClient(timeout=5) as client:
        response = await client.post(endpoint, json=data)
        response.raise_for_status()
        return response.json()
