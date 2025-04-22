from fastapi import APIRouter, Query
from services.matching_service import search_clubs

router = APIRouter

# Search for clubs based on search parameters and optional category
@router.get("/login/student/Search")
async def match_user_with_club(search_param: str = Query(...), category: str = Query(None)):
    try:
        results = search_clubs(search_param, category)
        return {"Matching clubs: results": results}
    except Exception as e:
        return {"Error": str(e)}
