from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_db, require_roles
from app.core.rbac import is_admin
from app.models.announcement import Announcement
from app.models.user import User, UserRole
from app.schemas.announcement import AnnouncementCreate, AnnouncementRead, AnnouncementUpdate

router = APIRouter(prefix="/announcements", tags=["announcements"])


def _serialize_announcement(item: Announcement) -> dict:
    return AnnouncementRead.model_validate(
        {
            "id": item.id,
            "title": item.title,
            "body": item.body,
            "announcement_type": item.announcement_type,
            "published": item.published,
            "author_id": item.author_id,
            "author_name": item.author.full_name if item.author else None,
            "created_at": item.created_at,
            "updated_at": item.updated_at,
        }
    ).model_dump()


@router.get("", response_model=list[AnnouncementRead])
def list_announcements(db: Session = Depends(get_db)) -> list[dict]:
    items = (
        db.query(Announcement)
        .options(joinedload(Announcement.author))
        .filter(Announcement.published.is_(True))
        .order_by(Announcement.created_at.desc())
        .all()
    )
    return [_serialize_announcement(item) for item in items]


@router.post("", response_model=AnnouncementRead, status_code=status.HTTP_201_CREATED)
def create_announcement(
    announcement_in: AnnouncementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.TEACHER, UserRole.ADMIN)),
) -> dict:
    item = Announcement(**announcement_in.model_dump(), author_id=current_user.id)
    db.add(item)
    db.commit()
    db.refresh(item)
    item = (
        db.query(Announcement)
        .options(joinedload(Announcement.author))
        .filter(Announcement.id == item.id)
        .one()
    )
    return _serialize_announcement(item)


@router.put("/{announcement_id}", response_model=AnnouncementRead)
def update_announcement(
    announcement_id: int,
    announcement_in: AnnouncementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.TEACHER, UserRole.ADMIN)),
) -> dict:
    item = db.get(Announcement, announcement_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found")
    if not is_admin(current_user) and item.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the author or admin can update announcement")

    for field, value in announcement_in.model_dump(exclude_unset=True).items():
        setattr(item, field, value)

    db.add(item)
    db.commit()
    db.refresh(item)
    item = (
        db.query(Announcement)
        .options(joinedload(Announcement.author))
        .filter(Announcement.id == item.id)
        .one()
    )
    return _serialize_announcement(item)


@router.delete("/{announcement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.TEACHER, UserRole.ADMIN)),
) -> None:
    item = db.get(Announcement, announcement_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found")
    if not is_admin(current_user) and item.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the author or admin can delete announcement")
    db.delete(item)
    db.commit()
