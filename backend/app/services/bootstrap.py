from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.announcement import Announcement, AnnouncementType
from app.models.club import Club, EnrollmentStatus
from app.models.content import ContentType, EducationalContent
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
        admin = _get_or_create_user(
            db,
            email=settings.INITIAL_ADMIN_EMAIL,
            password=settings.INITIAL_ADMIN_PASSWORD,
            full_name="Digital Urpaq Administrator",
            role=UserRole.ADMIN,
        )

        if settings.ENABLE_DEMO_SEED and db.query(Club).count() == 0:
            teacher = _get_or_create_user(
                db,
                email="teacher@digitalurpaq.local",
                password="ChangeMe123!",
                full_name="Aigerim Sadykova",
                phone="+7 700 000 0101",
                role=UserRole.TEACHER,
            )

            clubs = [
                Club(
                    name="Robotics Lab",
                    description="Build robots, learn sensors, motors, Arduino basics, and teamwork through hands-on challenges.",
                    category="Robotics",
                    age_min=10,
                    age_max=16,
                    teacher_id=teacher.id,
                    schedule="Mon, Wed 16:00-17:30",
                    classroom="STEM Lab 1",
                    available_seats=8,
                    enrollment_status=EnrollmentStatus.OPEN,
                ),
                Club(
                    name="Python Foundations",
                    description="Learn programming fundamentals, problem solving, games, and automation with Python.",
                    category="Programming",
                    age_min=11,
                    age_max=17,
                    teacher_id=teacher.id,
                    schedule="Tue, Thu 15:30-17:00",
                    classroom="Computer Room 2",
                    available_seats=12,
                    enrollment_status=EnrollmentStatus.OPEN,
                ),
                Club(
                    name="Digital Design Studio",
                    description="Explore UI design, presentation design, visual storytelling, and creative portfolio projects.",
                    category="Design",
                    age_min=9,
                    age_max=15,
                    teacher_id=teacher.id,
                    schedule="Sat 10:00-12:00",
                    classroom="Creative Room",
                    available_seats=4,
                    enrollment_status=EnrollmentStatus.WAITLIST,
                ),
            ]
            db.add_all(clubs)
            db.flush()

            db.add_all(
                [
                    EducationalContent(
                        title="Intro to Robotics Sensors",
                        description="A beginner guide to distance, color, and touch sensors.",
                        content_type=ContentType.ARTICLE,
                        body="Students learn how sensors convert real-world signals into program input.",
                        club_id=clubs[0].id,
                        author_id=teacher.id,
                        is_public=True,
                    ),
                    EducationalContent(
                        title="Python Variables Homework",
                        description="Practice variables, numbers, strings, and input/output.",
                        content_type=ContentType.HOMEWORK,
                        body="Complete five short exercises before the next lesson.",
                        club_id=clubs[1].id,
                        author_id=teacher.id,
                        is_public=False,
                    ),
                    Announcement(
                        title="Spring STEM Showcase",
                        body="Students will present robotics, design, and coding projects for parents and guests.",
                        announcement_type=AnnouncementType.EVENT,
                        author_id=admin.id,
                        published=True,
                    ),
                ]
            )

        db.commit()
    finally:
        db.close()
