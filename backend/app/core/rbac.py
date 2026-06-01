from app.models.user import User, UserRole


def has_any_role(user: User, roles: tuple[UserRole, ...]) -> bool:
    return user.role in roles


def is_admin(user: User) -> bool:
    return user.role == UserRole.ADMIN


def is_teacher_or_admin(user: User) -> bool:
    return user.role in {UserRole.TEACHER, UserRole.ADMIN}
