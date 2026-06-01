import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class ContentType(str, enum.Enum):
    ARTICLE = "article"
    VIDEO = "video"
    PRESENTATION = "presentation"
    ATTACHMENT = "attachment"
    HOMEWORK = "homework"


class EducationalContent(Base):
    __tablename__ = "educational_content"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    club_id: Mapped[int | None] = mapped_column(ForeignKey("clubs.id", ondelete="CASCADE"))
    author_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text)
    content_type: Mapped[ContentType] = mapped_column(Enum(ContentType, name="content_type"), nullable=False)
    body: Mapped[str | None] = mapped_column(Text)
    url: Mapped[str | None] = mapped_column(String(500))
    is_public: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    club = relationship("Club", back_populates="content_items")
    author = relationship("User", back_populates="content_items")
