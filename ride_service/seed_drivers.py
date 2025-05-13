import random
from datetime import datetime
from bson import ObjectId
from faker import Faker
from pymongo import MongoClient, GEOSPHERE

# Setup
fake = Faker()
client = MongoClient("mongodb://localhost:27017/")
db = client["ride_service"]

drivers_col = db["drivers"]
vehicles_col = db["vehicles"]
locations_col = db["driver_locations"]

# Create geospatial index for driver locations if not exist
locations_col.create_index([("location", GEOSPHERE)])

# Sample Vietnam provinces (name and approximate coordinates)
vietnam_provinces = [
    {"name": "Ha Noi", "lat": 21.0285, "lng": 105.8542},
    {"name": "Ho Chi Minh City", "lat": 10.762622, "lng": 106.660172},
    {"name": "Da Nang", "lat": 16.047079, "lng": 108.206230},
    {"name": "Hai Phong", "lat": 20.8449, "lng": 106.6881},
    {"name": "Can Tho", "lat": 10.0452, "lng": 105.7469},
    {"name": "Thanh Hoa", "lat": 19.8067, "lng": 105.7760},  # Required
    {"name": "Hue", "lat": 16.4637, "lng": 107.5909},
    {"name": "Nha Trang", "lat": 12.2388, "lng": 109.1967},
    {"name": "Vung Tau", "lat": 10.4114, "lng": 107.1362},
    {"name": "Buon Ma Thuot", "lat": 12.6667, "lng": 108.0500}
]

# Clean collections
drivers_col.delete_many({})
vehicles_col.delete_many({})
locations_col.delete_many({})

def seed_driver_with_location(user_id: int, province):
    now = datetime.utcnow()

    # Create vehicle
    vehicle = {
        "driver_id": user_id,
        "plate_number": fake.license_plate(),
        "model": fake.word().title() + " " + str(random.randint(100, 999)),
        "color": fake.safe_color_name(),
        "capacity": random.choice([4, 7]),
        "status": "active",
        "created_at": now
    }
    vehicle_id = vehicles_col.insert_one(vehicle).inserted_id

    # Create driver
    driver = {
        "user_id": user_id,
        "vehicle_id": vehicle_id,
        "driver_license": fake.uuid4(),
        "rating_average": round(random.uniform(3.5, 5.0), 2),
        "status": "active",
        "created_at": now
    }
    drivers_col.insert_one(driver)

    # Create location
    location = {
        "driver_id": user_id,
        "location": {
            "type": "Point",
            "coordinates": [province["lng"], province["lat"]]
        },
        "updated_at": now
    }
    locations_col.insert_one(location)

    print(f"Seeded driver {user_id} in {province['name']}")

# Seed N drivers
N = 30
for i in range(N):
    user_id = 1000 + i
    province = random.choice(vietnam_provinces)
    seed_driver_with_location(user_id, province)
