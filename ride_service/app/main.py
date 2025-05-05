from fastapi import FastAPI
from app.routers import match, riders, drivers, vehicles

app = FastAPI()

app.include_router(riders.router, prefix="/riders", tags=["riders"])
app.include_router(drivers.router, prefix="/drivers", tags=["drivers"])
app.include_router(match.router, prefix="/match", tags=["match"])
app.include_router(vehicles.router, prefix="/vehicles", tags=["vehicles"])



@app.get("/")
def read_root():
    return {"message": "Matching Service is running"}
