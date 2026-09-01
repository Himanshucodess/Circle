# CircleStore

**A schema-driven second-hand marketplace** — built so new product categories (Bicycle, Camera, Furniture, etc.) can be added through configuration alone, without writing a new form or backend model for every category.

**Live Demo:** https://circle.lightchan.online/
**Admin Panel:** https://circle.lightchan.online/admin/login 
**Source Code:** https://github.com/Himanshucodess/Circle

---

## The Problem

In a marketplace, different categories need different fields — a phone needs RAM and storage, a sofa needs seating capacity and material. Hard-coding a form per category (`PhoneForm.tsx`, `SofaForm.tsx`, ...) doesn't scale as the catalog grows.

## The Solution

Categories and their fields are stored as **data**, not code. An admin creates a category, defines reusable fields (label, type, validation, options), and publishes a schema. The seller flow fetches the active schema for the selected category and a single **dynamic form renderer** builds the UI at runtime. Adding a brand-new category — say, Bicycle with Brand, Frame Material, Wheel Size, Gear Count, and Electric — never requires touching the frontend or backend code, only the admin panel. Schema **versioning** means changing a category's fields later doesn't break listings created under the old version.

Sellers can't publish new categories directly — they submit a **category request**, which an admin reviews, configures, and publishes. This keeps the taxonomy consistent while still letting the marketplace grow.

## Architecture at a Glance


| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript, shadcn/ui |
| Forms | React Hook Form + Zod |
| Backend | Node.js + Express + TypeScript (clean/layered: routes → controllers → services → repositories) |
| ORM / DB | Prisma + PostgreSQL (source of truth) |
| Cache | Redis + ioredis (cache-aside, fail-open) |
| Auth | Clerk |
| Images | Cloudinary |
| Deployment | Docker Compose (Postgres, Redis, API, Web, Caddy) on AWS EC2 (Ubuntu), behind Caddy for HTTPS |

**Redis** is a performance layer only — never the source of truth. It follows a cache-aside pattern (check Redis → miss → query Postgres → populate Redis with a TTL) and fails open, so a Redis outage never takes the app down.

**Authorization** is enforced on the backend regardless of frontend route protection: `401` for unauthenticated requests, `403` for authenticated users acting outside their permissions (e.g. deleting someone else's listing).

## Key Design Decisions

- **Schema-driven forms over hard-coded ones** — more metadata/runtime rendering complexity, in exchange for real extensibility.
- **PostgreSQL as source of truth, Redis for performance only** — adds cache-invalidation work but keeps correctness decoupled from the cache.
- **Cloudinary for images** — keeps large binaries out of the relational database.
- **Clean/layered backend** — more files than a monolithic route handler, but better separation of concerns and testability.

## Sample Data

The seed script populates the database with a few pre-configured categories (with their field schemas), sample listings under each, a couple of offers, and a sample category request — so the app is fully explorable immediately after setup, with no manual data entry required.

---

## Setup Instructions

### Prerequisites

- Git
- Node.js 20+
- npm
- Docker
- Docker Compose

```bash
node --version
npm --version
git --version
docker --version
docker compose version
```

### 1. Clone the repository

```bash
git clone https://github.com/Himanshucodess/Circle.git
cd Circlen
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in `.env` with your own values (use the exact variable names in `.env.example`):

```env
# PostgreSQL
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/circlestore

# Redis
REDIS_URL=redis://redis:6379

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Admin Authentication
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
```

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection |
| `REDIS_URL` | Redis connection |
| `CLERK_PUBLISHABLE_KEY` | Clerk frontend auth |
| `CLERK_SECRET_KEY` | Clerk backend auth |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary config |
| `CLOUDINARY_API_KEY` | Cloudinary API access |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `ADMIN_USERNAME` | Admin login username |
| `ADMIN_PASSWORD` | Admin login password |

**Never commit `.env` or any real secrets — only `.env.example` should be in source control.**

### 4. Start Docker services

```bash
docker compose up -d
docker compose ps
```

This starts five services: PostgreSQL, Redis, API, Web, and Caddy.

### 5. Run database migrations

```bash
npx prisma migrate deploy
```

*(For local development, use `npx prisma migrate dev` instead when creating new migrations.)*

### 6. Seed the database

```bash
npx prisma db seed
```

This loads sample categories, fields, listings, offers, and a category request (see [Sample Data](#sample-data) above).

### 7. Verify Redis

```bash
docker compose exec redis redis-cli ping
# → PONG
```

### 8. Start the app

```bash
npm run dev
```

### 9. Run tests

```bash
npm test
```

Before considering setup complete, manually verify: homepage, sign-in, seller listing flow, dynamic category fields, image upload, Product Detail Page, offers, marketplace activity, listing management, category requests, admin panel, and Redis caching.

---

## Production Deployment

Deployed via Docker Compose on an Ubuntu AWS EC2 instance, behind Caddy for automatic HTTPS.

```bash
docker compose -f docker-compose.prod.yml up -d --build --force-recreate --wait
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml exec redis redis-cli ping
```

Request path: **User → Custom Domain → DNS → AWS EC2 → Caddy → Web/API → Redis/PostgreSQL**

Configure production secrets directly on the server — never commit production `.env` files, database credentials, or API keys.

## Troubleshooting

```bash
docker compose ps
docker compose logs            # all services
docker compose logs api
docker compose logs web
docker compose logs db
docker compose logs redis

# Restart everything
docker compose down && docker compose up -d

# Rebuild after code changes
docker compose up -d --build
```
