from fastapi import APIRouter, Depends
from app.matching_engine import stable_matching, hungarian_algorithm
from app.schemas import MatchRequest
from app.database import users_collection

router = APIRouter()

@router.post("/match")
def match_users(request: MatchRequest):
    """ API for performing matching """
    users = users_collection.find()
    preferences = {user["_id"]: user["preferences"] for user in users}

    if request.criteria.get("algorithm") == "stable":
        result = stable_matching(preferences)
    else:
        cost_matrix = np.random.rand(len(preferences), len(preferences))  # Dummy cost matrix
        result = hungarian_algorithm(cost_matrix)

    return {"matching_result": result}
