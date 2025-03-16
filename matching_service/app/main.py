from fastapi import FastAPI
from app.routers import match

app = FastAPI()

app.include_router(match.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Matching Service is running"}
