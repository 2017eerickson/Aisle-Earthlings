# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aisle Earthlings is a vegan centric grocery shopping assistant app. The stack is:
- **Backend**: Django 6 + DRF + PostgreSQL, served by Gunicorn
- **Frontend**: React 19 + Vite, served by Nginx
- **Infra**: Docker Compose orchestrates all services

## Development Commands

### Docker (primary development environment)

```bash
# Start all services
docker compose up

# Rebuild after dependency changes
docker compose up --build

# Run Django management commands inside the container
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py shell
```

### Backend (running locally without Docker)

```bash
cd server
pip install -r requirements.txt
python manage.py runserver
python manage.py migrate
```

### Testing

```bash
# Run all tests (inside container or local venv)
docker compose exec backend pytest

# Run a single test file
docker compose exec backend pytest users_app/tests.py

# Run a specific test
docker compose exec backend pytest users_app/tests.py::TestClassName::test_method_name
```

### Frontend

```bash
cd client
npm install
npm run dev      # Dev server
npm run build    # Production build
npm run lint     # ESLint
```

## Architecture

### Service Layout

```
Nginx (port 80)
  ├── /api/*  → proxied to Django backend (port 8000)
  └── /*      → React SPA static files
```

### Django Apps

- **users_app**: Custom user model and JWT cookie authentication (the most complete app)
- **kroger_app**: Kroger API OAuth2 integration (partial — token fetch only)
- **gemini_app**: Google Gemini API integration (scaffolding only)
- **list_app**: Shopping list functionality (scaffolding only)
- **images_app**: Image handling (scaffolding only)

### Custom User Model

`AUTH_USER_MODEL = 'users_app.AppUser'` — email is the unique identifier (no username field). A `UserProfile` (zip_code, preferred_location_id) is auto-created via signal on registration.

### Authentication Flow

JWT tokens are stored in HTTP-only cookies (not Authorization headers). The custom `CookieAuthentication` class in `users_app/utilities.py` reads from the `'acess'` cookie (note: intentional typo in cookie name — changing it will break existing sessions). Token lifetimes: access = 15 min, refresh = 2 days with rotation + blacklisting.

All protected views should inherit from `UserView` (defined in `users_app/views.py`), which applies `CookieAuthentication` and `IsAuthenticated`.

### URL Structure

```
/admin/              → Django admin
/api/v1/users/       → users_app.urls
```

### Environment Variables

Backend reads from `server/.env`:
- `SECRET_KEY`, `DEBUG`, `DB_*` — Django/Postgres config
- `CLIENT_ID`, `CLIENT_SECRET`, `TOKEN_URL`, `KROGER_PRODUCTS_URL` — Kroger API

Root `.env` is used by Docker Compose for the `db` service credentials.

### Database

PostgreSQL runs as `AE-postgres-container` (Docker network hostname). Host port is 5433; internal port is 5432. Migrations live in each app's `migrations/` directory.
