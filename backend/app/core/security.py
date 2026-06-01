from datetime import UTC, datetime, timedelta
from typing import Any

import bcrypt
import jwt

from app.core.config import settings

MAX_BCRYPT_PASSWORD_BYTES = 72


def password_to_bcrypt_bytes(password: str) -> bytes:
    password_bytes = password.encode("utf-8")
    if len(password_bytes) > MAX_BCRYPT_PASSWORD_BYTES:
        raise ValueError(f"Password must be at most {MAX_BCRYPT_PASSWORD_BYTES} bytes")
    return password_bytes


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(password_to_bcrypt_bytes(plain_password), hashed_password.encode("utf-8"))
    except (TypeError, ValueError):
        return False


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password_to_bcrypt_bytes(password), bcrypt.gensalt()).decode("utf-8")


def create_access_token(subject: str | int, claims: dict[str, Any] | None = None) -> str:
    expire = datetime.now(UTC) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload: dict[str, Any] = {"sub": str(subject), "exp": expire}
    if claims:
        payload.update(claims)
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
