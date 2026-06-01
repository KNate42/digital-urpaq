# Folder Structure

```text
Digital Urpaq
|-- backend
|   |-- Dockerfile
|   |-- requirements.txt
|   `-- app
|       |-- main.py
|       |-- api
|       |   |-- deps.py
|       |   `-- v1
|       |       |-- router.py
|       |       `-- routes
|       |-- core
|       |   |-- config.py
|       |   |-- rbac.py
|       |   `-- security.py
|       |-- db
|       |   |-- base.py
|       |   `-- session.py
|       |-- models
|       |-- schemas
|       `-- services
|-- frontend
|   |-- Dockerfile
|   |-- package.json
|   |-- vite.config.ts
|   |-- tailwind.config.js
|   `-- src
|       |-- api
|       |-- components
|       |-- data
|       |-- layouts
|       `-- pages
|-- docs
|   |-- API.md
|   |-- ARCHITECTURE.md
|   |-- ERD.md
|   |-- FOLDER_STRUCTURE.md
|   |-- MVP_PLAN.md
|   `-- digital-urpaq-ui-concept.png
|-- docker-compose.yml
|-- .env.example
|-- .gitignore
`-- README.md
```

## Ownership

- Backend route modules own API behavior and authorization.
- Backend services own business logic that should not live in route functions.
- Frontend pages own routed screens.
- Frontend components own reusable controls and display primitives.
- Documentation files describe architecture decisions and delivery scope.
