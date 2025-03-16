from pymongo import MongoClient
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/matching_service")

client = MongoClient(MONGO_URI)
db = client.matching_service
users_collection = db.users
matches_collection = db.matches
