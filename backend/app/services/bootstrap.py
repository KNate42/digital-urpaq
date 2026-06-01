from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.user import User, UserRole


def _get_or_create_user(
    db: Session,
    *,
    email: str,
    password: str,
    full_name: str,
    role: UserRole,
    phone: str | None = None,
) -> User:
    user = db.query(User).filter(User.email == email).first()
    if user:
        return user
    user = User(
        email=email,
        hashed_password=hash_password(password),
        full_name=full_name,
        phone=phone,
        role=role,
        is_active=True,
    )
    db.add(user)
    db.flush()
    return user


def bootstrap_database() -> None:
    db = SessionLocal()
    try:
        _get_or_create_user(
            db,
            email=settings.INITIAL_ADMIN_EMAIL,
            password=settings.INITIAL_ADMIN_PASSWORD,
            full_name="Digital Urpaq Administrator",
            role=UserRole.ADMIN,
        )
        db.commit()
    finally:
        db.close()
