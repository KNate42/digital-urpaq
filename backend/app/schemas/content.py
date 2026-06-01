from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.content import ContentType


class EducationalContentBase(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    description: str | None = None
    content_type: ContentType
    body: str | None = None
    url: str | None = Field(default=None, max_length=500)
    club_id: int | None = None
    is_public: bool = False


class EducationalContentCreate(EducationalContentBase):
    pass


class EducationalContentUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = None
    content_type: ContentType | None = None
    body: str | None = None
    url: str | None = Field(default=None, max_length=500)
    club_id: int | None = None
    is_public: bool | None = None


class EducationalContentRead(EducationalContentBase):
    id: int
    author_id: int | None
    club_name: str | None = None
    author_name: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
