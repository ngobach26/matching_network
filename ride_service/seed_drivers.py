import random
from datetime import datetime
from faker import Faker
from pymongo import MongoClient

# Setup
fake = Faker()
client = MongoClient("mongo:27017")
db = client["ride_service"]
drivers_col = db["drivers"]

vehicle_types = ["bike", "car", "premium"]
driver_statuses = ["pending", "active", "rejected", "info_required", "inactive"]
vehicle_brands = ["Honda", "Toyota", "Kia", "Mazda", "VinFast", "Yamaha", "Mercedes"]
vehicle_models = {
    "bike": ["Vision", "Lead", "SH", "Airblade", "Wave"],
    "car": ["Vios", "Accent", "Cerato", "Mazda3", "Lux A2.0", "E-Class"],
    "premium": ["S-Class", "C-Class", "Camry", "GLC"]
}

def random_vehicle(vehicle_type):
    brand = random.choice(vehicle_brands)
    model = random.choice(vehicle_models[vehicle_type])
    plate_number = f"{random.randint(10,99)}-{random.randint(10000,99999)}"
    return {
        "vehicle_type": vehicle_type,
        "brand": brand,
        "model": model,
        "plate_number": plate_number,
        "capacity": random.choice([1,2,4,5,7]) if vehicle_type != "bike" else 1,
        "color": fake.color_name(),
        "created_at": datetime.now()
    }

def fake_driver_license():
    # 50% dạng A1-1234567, 50% dạng H123456-1234
    if random.random() < 0.5:
        prefix = random.choice(["A1", "A2", "B1", "B2", "C", "D", "E", "F"])
        number = random.randint(1000000, 9999999)
        return f"{prefix}-{number}"
    else:
        first = random.randint(100000, 999999)
        last = random.randint(1000, 9999)
        return f"H{first}-{last}"

for user_id in range(24, 44):   # 24 -> 43
    vtype = random.choice(vehicle_types)
    vehicle = random_vehicle(vtype)
    driver = {
        "user_id": user_id,
        "driver_license": fake_driver_license(),
        "status": random.choice(driver_statuses),
        "vehicle": vehicle,
        "total_rides": 0,
        "rating_average": None,
        "rating_count": None,
        "created_at": datetime.now()
    }
    drivers_col.insert_one(driver)

print("Seeded drivers for user_id 24 -> 43 successfully!")
