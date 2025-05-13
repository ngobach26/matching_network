import pygeohash as gh
from confluent_kafka import Producer
import json
import random
import time

p = Producer({'bootstrap.servers': 'kafka:9092'})

def send_rider_request(rider_id, lat, lng):
    geohash = gh.encode(lat, lng, precision=5)
    payload = {
        "rider_id": rider_id,
        "lat": lat,
        "lng": lng,
        "geohash": geohash,
    }
    print(f"🚀 Sending: {payload}")
    p.produce(
        topic="ride-matching-requests",
        key=geohash,
        value=json.dumps(payload)
    )

for i in range(10):
    send_rider_request(rider_id=0 + i, lat=10.7769, lng=106.7009)  # TP.HCM
    time.sleep(0.2)

p.flush()
