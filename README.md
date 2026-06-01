# Digital Urpaq

Digital Urpaq is a full-stack educational portal for managing student clubs, registrations, learning materials, announcements, applications, and role-based dashboards for an educational center.

## Stack

- Frontend: React, Vite, TypeScript, TailwindCSS, React Router
- Backend: FastAPI, SQLAlchemy, Pydantic, JWT authentication
- Database: PostgreSQL
- Runtime: Docker and Docker Compose

## Quick Start

1. Copy environment values:

```bash
cp .env.example .env
```

2. Start the full stack:

```bash
docker compose up --build
```

3. Open the apps:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api
- API docs: http://localhost:8000/docs

On a clean database the backend creates only the bootstrap administrator from
`INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD`. No clubs, applications,
materials, announcements, teachers, students, parents, or other records are
created automatically. Set a production-strength `SECRET_KEY` and admin password
before the first production start.

## Default Local Services

- PostgreSQL: `localhost:5432`
- Backend container: `backend`
- Frontend container: `frontend`

## Project Map

- `backend/` FastAPI application, SQLAlchemy models, schemas, services, and API routers.
- `frontend/` React/Vite app with public pages, dashboards, and API client.
- `docs/` architecture, ERD, API surface, and MVP plan.
- `docker-compose.yml` local orchestration for PostgreSQL, API, and web app.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API Endpoints](docs/API.md)
- [Database ERD](docs/ERD.md)
- [Folder Structure](docs/FOLDER_STRUCTURE.md)
- [MVP Implementation Plan](docs/MVP_PLAN.md)
