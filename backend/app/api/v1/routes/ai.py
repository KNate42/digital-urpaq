from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.club import Club, EnrollmentStatus
from app.schemas.ai import RecommendationRequest, RecommendationResponse
from app.services.recommendation import recommend_clubs

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/recommend", response_model=RecommendationResponse)
def recommend(payload: RecommendationRequest, db: Session = Depends(get_db)) -> RecommendationResponse:
    clubs = (
        db.query(Club)
        .filter(Club.enrollment_status.in_([EnrollmentStatus.OPEN, EnrollmentStatus.WAITLIST]))
        .order_by(Club.available_seats.desc())
        .all()
    )
    return RecommendationResponse(recommendations=recommend_clubs(payload, clubs))
