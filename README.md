# Aisle Earthlings

A vegan-centric grocery shopping assistant that lets you search, compare, and track plant-based products across nearby Kroger affliated stores.

---

## Launched site

https://aisleearthlings.com/

## Purpose

Finding vegan products across multiple stores is tedious. This is for vegans who want to find specific grocery items and compare price or availability for grocery stores near them. Aisle Earthlings is a comprehensive compendium of vegan grocery items for kroger associated stores near you. Unlike other grocery shopping apps our product will be able to find the vegan items that other filters fail to properly categorize and clearly display in a comparitive mannor.

## Figma design 

https://www.figma.com/design/oI25xwaR20Jj0u6C70VHi5/Aisle-Earthings?node-id=0-1&m=dev&t=NEBNF9tYDB6A4ey5-1

## Features

- The Compare page lets you search multiple stores simultaneously, side by side, so you can spot the best price and availability without tab-hopping. A     equipped with idividual search bars and a global search bar.
- A built-in Gemini-powered vegan badge checker analyzes ingredient lists and returns a verdict (green / yellow / red) on any product you're unsure about.
- A grocery checklist where you can see product names, thier locations and thier quantities.
- A page to log favorite stores and products for easy reference with respective search bars.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django 6 + Django REST Framework |
| Database | PostgreSQL 15 |
| Cache / Queue | Redis 7 |
| Frontend | React 19 + Vite |
| Reverse Proxy | Nginx |
| Orchestration | Docker Compose |
| External APIs | Kroger Products API, Google Gemini , Framer motion|
 
---

## Architecture

```
Browser
  └── Nginx (port 80)
        ├── /api/*  →  Django / Gunicorn (port 8000)
        └── /*      →  React SPA (static files)
```

Four Docker services run together:

- **db** — PostgreSQL, exposed on host port 5433
- **redis** — Redis, port 6379
- **backend** — Django served by Gunicorn, port 8000
- **frontend** — Nginx serving the React build, port 80

---

## Backend — Django Apps

| App | Responsibility |
|---|---|
| `users_app` | Custom user model, JWT cookie auth, registration/login |
| `kroger_app` |  Kroger OAuth2 token fetch + Products API integration |
| `gemini_app` | Google Gemini vegan ingredient analysis |
| `list_app` | Shopping list management |
| `user_favorites_app` | Saved/favorited products per user |

### Authentication

- Email is the unique identifier — no username field.
- JWT tokens are stored in HTTP-only cookies (not `Authorization` headers).
- A `UserProfile` (zip code, preferred store location, gemini uses ) is auto created for each user .
- All protected views inherit from `UserView`, which applies `CookieAuthentication` + `IsAuthenticated`.

### URL Structure

```
/admin/          →  Django admin
/api/v1/users/   →  users_app
/api/v1/kroger/  →  kroger_app
/api/v1/gemini/  →  gemini_app
```

---

## Frontend — React SPA

All pages live under `client/src/pages/`. Routing is handled by React Router v7 (`createBrowserRouter`).

| Route | Page | Description |
|---|---|---|
| `/` | `LoginPage` | Login / create account |
| `/homepage/` | `HomePage` | Zip code store search |
| `/compare/` | `ComparePage` | Side-by-side multi-store product search |
| `/store/:location_id/` | `StorePage` | Products for a single store |
| `/product/:upc/` | `ProductPage` | Product detail + vegan badge check |
| `/favorites/` | `FavoritesPage` | Saved favorite products |
| `/about/` | `About` | App story and feature overview |

Shared UI components live in `client/src/components/`. API calls are organized by domain in `client/src/utils/` (e.g. `krogerUtils.jsx`, `authUtils.jsx`).

Styling uses **Tailwind CSS v4** utility classes with CSS custom property tokens (`var(--accent)`, `var(--border)`) defined in `App.css` / `index.css`.

---

## Development Setup

### Prerequisites

- Docker + Docker Compose
- A `server/.env` file with the required environment variables (see below)

### Start Everything

```bash
docker compose up
```

```bash
# Rebuild after dependency changes
docker compose up --build
```

### Run Tests

```bash
docker compose exec backend pytest
cd client npm run cy:run
```

## Environment Variables

`server/.env` is required by the backend:

| Variable | Purpose |
|---|---|
| `SECRET_KEY` | Django secret key |
| `DEBUG` | Django debug flag |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | PostgreSQL connection |
| `CLIENT_ID`, `CLIENT_SECRET` | Kroger API OAuth2 credentials |
| `TOKEN_URL`, `KROGER_PRODUCTS_URL` | Kroger API endpoints |
| `GEMINI_API_KEY` | Google Gemini API key |

The root `.env` supplies credentials for the Docker `db` service.
