import sys
import os
from datetime import datetime
from pymongo import MongoClient
from IPython import embed

# Add matching_service to path
sys.path.append(os.path.abspath("."))  # or "./matching_service" if needed

# Import FastAPI app
from app.main import app  # <-- adjust if different file

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017")  # use "localhost:27017" for local runs
db = client["ride_service"]

riders_collection = db["riders"]
drivers_collection = db["drivers"]
matches_collection = db["matches"]
vehicles_collection = db["vehicles"]
ride_requests_collection = db["ride_requests"]
driver_locations_collection = db["driver_locations"]

# Start console
print("Console loaded ✅")
print("Available: `app`, `db`, `riders`, `drivers`")
embed()
