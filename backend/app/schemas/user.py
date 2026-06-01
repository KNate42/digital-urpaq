from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.core.security import MAX_BCRYPT_PASSWORD_BYTES
from app.models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=255)
    phone: str | None = Field(default=None, max_length=50)
    role: UserRole = UserRole.STUDENT


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def validate_password_bcrypt_length(cls, password: str) -> str:
        if len(password.encode("utf-8")) > MAX_BCRYPT_PASSWORD_BYTES:
            raise ValueError(f"Password must be at most {MAX_BCRYPT_PASSWORD_BYTES} bytes")
        return password


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=255)
    phone: str | None = Field(default=None, max_length=50)
    role: UserRole | None = None
    is_active: bool | None = None


class UserRead(UserBase):
    email: str
    id: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
