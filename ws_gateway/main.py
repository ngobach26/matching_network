import json
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from manager import WebSocketManager
from redis_client import update_location
from kafka_client import kafka_listener

app = FastAPI()
manager = WebSocketManager()

@app.websocket("/ws/{role}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, role: str, user_id: str):
    key = f"{role}:{user_id}"
    await manager.connect(key, websocket)

    try:
        while True:
            msg = await websocket.receive_text()
            try:
                data = json.loads(msg)
                if data.get("type") == "location_update":
                    lat, lng = data["lat"], data["lng"]
                    await update_location(role, user_id, lat, lng)
            except Exception as e:
                print(f"❌ Error parsing message from {key}: {e}")
    except WebSocketDisconnect:
        manager.disconnect(key)

@app.on_event("startup")
async def startup():
    asyncio.create_task(kafka_listener(manager)) 
