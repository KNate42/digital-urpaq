from fastapi import APIRouter

from app.api.v1.routes import ai, announcements, applications, auth, clubs, content, users

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(clubs.router)
api_router.include_router(applications.router)
api_router.include_router(content.router)
api_router.include_router(announcements.router)
api_router.include_router(ai.router)
