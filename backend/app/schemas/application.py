from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.application import ApplicationStatus


class ApplicationBase(BaseModel):
    student_full_name: str = Field(min_length=2, max_length=255)
    age: int = Field(ge=3, le=25)
    contacts: str = Field(min_length=3, max_length=255)
    club_id: int
    comment: str | None = None


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus


class ApplicationRead(ApplicationBase):
    id: int
    applicant_id: int | None
    status: ApplicationStatus
    club_name: str | None = None
    applicant_email: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
