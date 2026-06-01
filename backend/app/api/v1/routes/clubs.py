from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_db, require_roles
from app.models.club import Club
from app.models.user import User, UserRole
from app.schemas.club import ClubCreate, ClubRead, ClubUpdate

router = APIRouter(prefix="/clubs", tags=["clubs"])


def _serialize_club(club: Club) -> dict:
    data = ClubRead.model_validate(
        {
            "id": club.id,
            "name": club.name,
            "description": club.description,
            "category": club.category,
            "age_min": club.age_min,
            "age_max": club.age_max,
            "age_group": f"{club.age_min}-{club.age_max}",
            "teacher_id": club.teacher_id,
            "teacher_name": club.teacher.full_name if club.teacher else None,
            "schedule": club.schedule,
            "classroom": club.classroom,
            "available_seats": club.available_seats,
            "enrollment_status": club.enrollment_status,
            "created_at": club.created_at,
            "updated_at": club.updated_at,
        }
    ).model_dump()
    return data


def _validate_teacher(db: Session, teacher_id: int | None) -> None:
    if teacher_id is None:
        return
    teacher = db.get(User, teacher_id)
    if not teacher or teacher.role != UserRole.TEACHER:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="teacher_id must reference a teacher")


def _validate_age_range(age_min: int, age_max: int) -> None:
    if age_min > age_max:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="age_min cannot exceed age_max")


@router.get("", response_model=list[ClubRead])
def list_clubs(
    category: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[dict]:
    query = db.query(Club).options(joinedload(Club.teacher)).order_by(Club.name.asc())
    if category:
        query = query.filter(Club.category.ilike(f"%{category}%"))
    return [_serialize_club(club) for club in query.all()]


@router.get("/{club_id}", response_model=ClubRead)
def read_club(club_id: int, db: Session = Depends(get_db)) -> dict:
    club = db.query(Club).options(joinedload(Club.teacher)).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")
    return _serialize_club(club)


@router.post("", response_model=ClubRead, status_code=status.HTTP_201_CREATED)
def create_club(
    club_in: ClubCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN)),
) -> dict:
    _validate_age_range(club_in.age_min, club_in.age_max)
    _validate_teacher(db, club_in.teacher_id)
    club = Club(**club_in.model_dump())
    db.add(club)
    db.commit()
    db.refresh(club)
    return _serialize_club(club)


@router.put("/{club_id}", response_model=ClubRead)
def update_club(
    club_id: int,
    club_in: ClubUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN)),
) -> dict:
    club = db.get(Club, club_id)
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")

    updates = club_in.model_dump(exclude_unset=True)
    next_age_min = updates.get("age_min", club.age_min)
    next_age_max = updates.get("age_max", club.age_max)
    _validate_age_range(next_age_min, next_age_max)
    _validate_teacher(db, updates.get("teacher_id", club.teacher_id))

    for field, value in updates.items():
        setattr(club, field, value)

    db.add(club)
    db.commit()
    db.refresh(club)
    return _serialize_club(club)


@router.delete("/{club_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_club(
    club_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN)),
) -> None:
    club = db.get(Club, club_id)
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")
    db.delete(club)
    db.commit()
