import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class EnrollmentStatus(str, enum.Enum):
    OPEN = "open"
    WAITLIST = "waitlist"
    CLOSED = "closed"


class Club(Base):
    __tablename__ = "clubs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    age_min: Mapped[int] = mapped_column(Integer, nullable=False)
    age_max: Mapped[int] = mapped_column(Integer, nullable=False)
    teacher_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    schedule: Mapped[str] = mapped_column(String(255), nullable=False)
    classroom: Mapped[str] = mapped_column(String(100), nullable=False)
    available_seats: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    enrollment_status: Mapped[EnrollmentStatus] = mapped_column(
        Enum(EnrollmentStatus, name="enrollment_status"),
        default=EnrollmentStatus.OPEN,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    teacher = relationship("User", back_populates="taught_clubs")
    applications = relationship("Application", back_populates="club", cascade="all, delete-orphan")
    content_items = relationship("EducationalContent", back_populates="club", cascade="all, delete-orphan")
