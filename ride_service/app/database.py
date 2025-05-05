from pymongo import MongoClient

client = MongoClient("mongodb://mongo:27017")  # use "localhost:27017" for local runs
db = client["ride_service"]

riders_collection = db["riders"]
drivers_collection = db["drivers"]
matches_collection = db["matches"]
vehicles_collection = db["vehicles"]
ride_requests_collection = db["ride_requests"]
driver_locations_collection = db["driver_locations"]
