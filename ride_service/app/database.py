from pymongo import MongoClient

client = MongoClient("mongodb://mongo:27017")  # use "localhost:27017" for local runs
db = client["ride_service"]

riders_collection = db["riders"]
drivers_collection = db["drivers"]
vehicles_collection = db["vehicles"]
rides_collection = db["rides"]
ride_requests_collection = db["ride_requests"]
driver_locations_collection = db["driver_locations"]
ratings_collection = db["ratings"]
