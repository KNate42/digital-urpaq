from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_active_user, get_db, require_roles
from app.core.rbac import is_admin
from app.models.application import Application
from app.models.club import Club
from app.models.user import User, UserRole
from app.schemas.application import ApplicationCreate, ApplicationRead, ApplicationStatusUpdate

router = APIRouter(prefix="/applications", tags=["applications"])


def _serialize_application(application: Application) -> dict:
    return ApplicationRead.model_validate(
        {
            "id": application.id,
            "applicant_id": application.applicant_id,
            "club_id": application.club_id,
            "club_name": application.club.name if application.club else None,
            "applicant_email": application.applicant.email if application.applicant else None,
            "student_full_name": application.student_full_name,
            "age": application.age,
            "contacts": application.contacts,
            "comment": application.comment,
            "status": application.status,
            "created_at": application.created_at,
            "updated_at": application.updated_at,
        }
    ).model_dump()


def _can_read_application(user: User, application: Application) -> bool:
    if is_admin(user):
        return True
    if user.role in {UserRole.STUDENT, UserRole.PARENT} and application.applicant_id == user.id:
        return True
    if user.role == UserRole.TEACHER and application.club and application.club.teacher_id == user.id:
        return True
    return False


@router.post("", response_model=ApplicationRead, status_code=status.HTTP_201_CREATED)
def create_application(
    application_in: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.STUDENT, UserRole.PARENT, UserRole.ADMIN)),
) -> dict:
    club = db.get(Club, application_in.club_id)
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")

    application = Application(**application_in.model_dump(), applicant_id=current_user.id)
    db.add(application)
    db.commit()
    db.refresh(application)
    application = (
        db.query(Application)
        .options(joinedload(Application.club), joinedload(Application.applicant))
        .filter(Application.id == application.id)
        .one()
    )
    return _serialize_application(application)


@router.get("", response_model=list[ApplicationRead])
def list_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> list[dict]:
    query = db.query(Application).options(joinedload(Application.club), joinedload(Application.applicant))

    if current_user.role in {UserRole.STUDENT, UserRole.PARENT}:
        query = query.filter(Application.applicant_id == current_user.id)
    elif current_user.role == UserRole.TEACHER:
        query = query.join(Club).filter(Club.teacher_id == current_user.id)

    return [_serialize_application(application) for application in query.order_by(Application.created_at.desc()).all()]


@router.get("/{application_id}", response_model=ApplicationRead)
def read_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> dict:
    application = (
        db.query(Application)
        .options(joinedload(Application.club), joinedload(Application.applicant))
        .filter(Application.id == application_id)
        .first()
    )
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    if not _can_read_application(current_user, application):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
    return _serialize_application(application)


@router.patch("/{application_id}/status", response_model=ApplicationRead)
def update_application_status(
    application_id: int,
    status_in: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN)),
) -> dict:
    application = db.get(Application, application_id)
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    application.status = status_in.status
    db.add(application)
    db.commit()
    db.refresh(application)
    application = (
        db.query(Application)
        .options(joinedload(Application.club), joinedload(Application.applicant))
        .filter(Application.id == application.id)
        .one()
    )
    return _serialize_application(application)
