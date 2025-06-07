import json
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from manager import WebSocketManager
from redis_client import update_location,save_chat_message
from kafka_client import kafka_listener
import datetime

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
                elif data.get("type") == "message":
                    ride_id = data["ride_id"]
                    message = data["message"]
                    sender_id = user_id
                    receiver_id = data["receiver_id"]

                    # Gọi hàm lưu message vào Redis
                    msg_obj = await save_chat_message(role, sender_id, receiver_id, ride_id, message)

                    # Forward cho đối phương (nếu đang online)
                    other_role = "driver" if role == "rider" else "rider"
                    other_key = f"{other_role}:{receiver_id}"
                    await manager.send(other_key, {
                        "type": "message",
                        "data": msg_obj
                    })

                    # Gửi lại cho chính mình (xác nhận gửi thành công)
                    # await manager.send(key, {
                    #     "type": "message",
                    #     "data": msg_obj
                    # })
                    print(f"💬 Message saved & forwarded: {msg_obj}", flush=True)
            except Exception as e:
                print(f"❌ Error parsing message from {key}: {e}")
    except WebSocketDisconnect:
        manager.disconnect(key)

@app.on_event("startup")
async def startup():
    asyncio.create_task(kafka_listener(manager)) 
