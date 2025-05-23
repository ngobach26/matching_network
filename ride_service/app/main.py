from fastapi import FastAPI
from app.routers import drivers,rides,fare_estimate,algorithm
from app.kafka_consumer import consume_kafka_matching
import asyncio

app = FastAPI()
@app.on_event("startup")

async def start_kafka_consumer():
    loop = asyncio.get_event_loop()
    loop.create_task(consume_kafka_matching()) 

app.include_router(drivers.router, prefix="/drivers", tags=["drivers"])
app.include_router(rides.router, prefix="/rides", tags=["rides"])
app.include_router(fare_estimate.router, prefix="/fare-estimate", tags=["fare-estimate"])
app.include_router(algorithm.router, prefix="/matching-algorithm", tags=["matching-algorithm"])

@app.get("/")
def read_root():
    return {"message": "Matching Service is running"}
