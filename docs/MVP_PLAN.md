# MVP Implementation Plan

## Phase 1: Foundation

- Create Docker Compose setup for PostgreSQL, backend, and frontend.
- Implement SQLAlchemy models and Pydantic schemas.
- Add JWT authentication, password hashing, and RBAC dependencies.
- Build public club, announcement, and content listing APIs.

## Phase 2: Core Workflows

- Implement student/parent registration and login.
- Add application submission and status tracking.
- Add administrator CRUD for clubs, users, applications, educational content, and news.
- Add teacher workflows for assigned students, material uploads, and announcements.

## Phase 3: Frontend Portal

- Build public portal pages for guests.
- Build student dashboard: profile, applications, schedule, materials.
- Build teacher dashboard: assigned students, upload materials, announcements.
- Build administrator dashboard: users, clubs, applications, content, analytics.
- Add responsive layouts and typed API integration.

## Phase 4: AI Recommendation Assistant

- Add `/api/ai/recommend` endpoint.
- Rank clubs by age fit, interests, skills, category, availability, and enrollment status.
- Return transparent explanations for every recommendation.
- Add frontend recommendation panel for staff and public exploration.

## Phase 5: Production Readiness

- Add Alembic migrations.
- Add backend tests for RBAC, auth, CRUD, and recommendation scoring.
- Add frontend tests for route guards and dashboard workflows.
- Add CI for linting, type checks, tests, and Docker image builds.
- Add object storage for real attachments.
- Add observability: structured logs, metrics, and error tracking.
