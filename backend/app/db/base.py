from app.db.session import Base

# Import models so SQLAlchemy registers metadata before create_all/migrations.
from app.models.announcement import Announcement  # noqa: F401
from app.models.application import Application  # noqa: F401
from app.models.club import Club  # noqa: F401
from app.models.content import EducationalContent  # noqa: F401
from app.models.user import User  # noqa: F401

__all__ = ["Base"]
