from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_active_user, get_db, get_optional_current_active_user, require_roles
from app.core.rbac import is_admin
from app.models.application import Application, ApplicationStatus
from app.models.club import Club
from app.models.content import ContentType, EducationalContent
from app.models.user import User, UserRole
from app.schemas.content import EducationalContentCreate, EducationalContentRead, EducationalContentUpdate

router = APIRouter(prefix="/content", tags=["educational content"])


def _serialize_content(item: EducationalContent) -> dict:
    return EducationalContentRead.model_validate(
        {
            "id": item.id,
            "title": item.title,
            "description": item.description,
            "content_type": item.content_type,
            "body": item.body,
            "url": item.url,
            "club_id": item.club_id,
            "club_name": item.club.name if item.club else None,
            "author_id": item.author_id,
            "author_name": item.author.full_name if item.author else None,
            "is_public": item.is_public,
            "created_at": item.created_at,
            "updated_at": item.updated_at,
        }
    ).model_dump()


def _validate_club(db: Session, club_id: int | None) -> None:
    if club_id is None:
        return
    if not db.get(Club, club_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")


def _can_read_content(item: EducationalContent, user: User | None, db: Session) -> bool:
    if item.is_public:
        return True
    if user is None:
        return False
    if is_admin(user):
        return True
    if user.role == UserRole.TEACHER:
        return item.author_id == user.id or bool(item.club and item.club.teacher_id == user.id)
    if user.role in {UserRole.STUDENT, UserRole.PARENT} and item.club_id is not None:
        return (
            db.query(Application.id)
            .filter(Application.applicant_id == user.id)
            .filter(Application.club_id == item.club_id)
            .filter(Application.status == ApplicationStatus.APPROVED)
            .first()
            is not None
        )
    return False


@router.get("", response_model=list[EducationalContentRead])
def list_public_content(
    club_id: int | None = None,
    content_type: ContentType | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[dict]:
    query = (
        db.query(EducationalContent)
        .options(joinedload(EducationalContent.club), joinedload(EducationalContent.author))
        .filter(EducationalContent.is_public.is_(True))
    )
    if club_id:
        query = query.filter(EducationalContent.club_id == club_id)
    if content_type:
        query = query.filter(EducationalContent.content_type == content_type)
    return [_serialize_content(item) for item in query.order_by(EducationalContent.created_at.desc()).all()]


@router.get("/assigned", response_model=list[EducationalContentRead])
def list_assigned_content(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> list[dict]:
    query = db.query(EducationalContent).options(
        joinedload(EducationalContent.club),
        joinedload(EducationalContent.author),
    )
    if is_admin(current_user):
        pass
    elif current_user.role == UserRole.TEACHER:
        query = query.outerjoin(Club).filter(
            (EducationalContent.author_id == current_user.id) | (Club.teacher_id == current_user.id)
        )
    else:
        approved_club_ids = select(Application.club_id).where(
            Application.applicant_id == current_user.id,
            Application.status == ApplicationStatus.APPROVED,
        )
        query = query.filter(
            (EducationalContent.is_public.is_(True)) | (EducationalContent.club_id.in_(approved_club_ids))
        )
    return [_serialize_content(item) for item in query.order_by(EducationalContent.created_at.desc()).all()]


@router.get("/{content_id}", response_model=EducationalContentRead)
def read_content(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_active_user),
) -> dict:
    item = (
        db.query(EducationalContent)
        .options(joinedload(EducationalContent.club), joinedload(EducationalContent.author))
        .filter(EducationalContent.id == content_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")
    if not _can_read_content(item, current_user, db):
        if current_user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
    return _serialize_content(item)


@router.post("", response_model=EducationalContentRead, status_code=status.HTTP_201_CREATED)
def create_content(
    content_in: EducationalContentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.TEACHER, UserRole.ADMIN)),
) -> dict:
    _validate_club(db, content_in.club_id)
    item = EducationalContent(**content_in.model_dump(), author_id=current_user.id)
    db.add(item)
    db.commit()
    db.refresh(item)
    item = (
        db.query(EducationalContent)
        .options(joinedload(EducationalContent.club), joinedload(EducationalContent.author))
        .filter(EducationalContent.id == item.id)
        .one()
    )
    return _serialize_content(item)


@router.put("/{content_id}", response_model=EducationalContentRead)
def update_content(
    content_id: int,
    content_in: EducationalContentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.TEACHER, UserRole.ADMIN)),
) -> dict:
    item = db.get(EducationalContent, content_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")
    if not is_admin(current_user) and item.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the author or admin can update content")

    updates = content_in.model_dump(exclude_unset=True)
    if "club_id" in updates:
        _validate_club(db, updates["club_id"])

    for field, value in updates.items():
        setattr(item, field, value)

    db.add(item)
    db.commit()
    db.refresh(item)
    item = (
        db.query(EducationalContent)
        .options(joinedload(EducationalContent.club), joinedload(EducationalContent.author))
        .filter(EducationalContent.id == item.id)
        .one()
    )
    return _serialize_content(item)


@router.delete("/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_content(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.TEACHER, UserRole.ADMIN)),
) -> None:
    item = db.get(EducationalContent, content_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")
    if not is_admin(current_user) and item.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the author or admin can delete content")
    db.delete(item)
    db.commit()
