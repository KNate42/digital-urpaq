from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.announcement import AnnouncementType


class AnnouncementBase(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    body: str = Field(min_length=5)
    announcement_type: AnnouncementType = AnnouncementType.ANNOUNCEMENT
    published: bool = True


class AnnouncementCreate(AnnouncementBase):
    pass


class AnnouncementUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=255)
    body: str | None = Field(default=None, min_length=5)
    announcement_type: AnnouncementType | None = None
    published: bool | None = None


class AnnouncementRead(AnnouncementBase):
    id: int
    author_id: int | None
    author_name: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
