from typing import Dict
from fastapi import WebSocket
import asyncio
from redis_cleanup import clear_driver_from_redis

class WebSocketManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, key: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[key] = websocket
        print(f"🔌 Connected: {key}")

    def disconnect(self, key: str):
        self.active_connections.pop(key, None)
        print(f"❌ Disconnected: {key}", flush=True)

        # Gọi cleanup Redis (nếu là driver)
        asyncio.create_task(clear_driver_from_redis(key))

    async def send(self, key: str, message: dict):
        ws = self.active_connections.get(key)
        if ws:
            await ws.send_json(message)
