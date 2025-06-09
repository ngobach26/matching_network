from pymongo import MongoClient

client = MongoClient("mongodb://mongo:27017")  # use "localhost:27017" for local runs
db = client["ride_service"]

drivers_collection = db["drivers"]
rides_collection = db["rides"]
