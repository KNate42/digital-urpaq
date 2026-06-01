from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.club import EnrollmentStatus


class ClubBase(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    description: str = Field(min_length=10)
    category: str = Field(min_length=2, max_length=100)
    age_min: int = Field(ge=3, le=25)
    age_max: int = Field(ge=3, le=25)
    teacher_id: int | None = None
    schedule: str = Field(min_length=2, max_length=255)
    classroom: str = Field(min_length=1, max_length=100)
    available_seats: int = Field(ge=0)
    enrollment_status: EnrollmentStatus = EnrollmentStatus.OPEN


class ClubCreate(ClubBase):
    pass


class ClubUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = Field(default=None, min_length=10)
    category: str | None = Field(default=None, min_length=2, max_length=100)
    age_min: int | None = Field(default=None, ge=3, le=25)
    age_max: int | None = Field(default=None, ge=3, le=25)
    teacher_id: int | None = None
    schedule: str | None = Field(default=None, min_length=2, max_length=255)
    classroom: str | None = Field(default=None, min_length=1, max_length=100)
    available_seats: int | None = Field(default=None, ge=0)
    enrollment_status: EnrollmentStatus | None = None


class ClubRead(ClubBase):
    id: int
    age_group: str
    teacher_name: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
