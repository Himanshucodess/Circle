# CircleStore — Dynamic Marketplace Listing System

A production-quality schema-driven secondhand marketplace (Circle-inspired). The whole point: **categories and their fields are data, not code**. An admin can create a brand-new category like *Bicycle* and configure its fields in the admin UI, publish it, and the seller flow + PDP instantly render the new form **without any frontend code change**.

> Single reusable `DynamicForm` / `FieldRenderer` — no `MobileForm.tsx`, `LaptopForm.tsx`, `SofaForm.tsx`.

---

## Overview

Traditional marketplaces hardcode per-category forms. Every new category means a new component, new validation branch, new PDP block. CircleStore inverts that:

- **Metadata-driven**: `FieldDefinition` + `CategoryField` + `SchemaVersion` describe the form.
- **JSONB attributes**: category-specific answers live in `Listing.attributes` (PostgreSQL JSONB), while common fields stay relational.
- **Immutable snapshots**: each publish freezes a `SchemaVersion`; listings pin `schemaVersionId`, so old listings never break when the schema evolves.

Seller flow: `Select category → fetch published schema → DynamicFormRenderer → frontend + backend validation → create listing`.

## Core Idea

```
BAD:  if (category === "mobile") show RAM
GOOD: GET /api/categories/mobile-phone/schema → FieldRenderer[type] → Text | Select | Number | Radio | …
```

Adding *Bicycle* = inserting rows, not shipping React code.

## Architecture

```
                         ADMIN
                           |
                           v
               Category / Field Management
                           |
                           v
                    Schema Service
                           |
                 +---------+---------+
                 |                   |
                 v                   v
           Field Metadata      Schema Version
                 |   (DRAFT→PUBLISHED→ARCHIVED, immutable snapshot)
                 +---------+---------+
                           |
                           v
                      PostgreSQL
                      (Prisma)
                           |
                           v
                    Seller API
                     (Express)
                           |
                           v
                Dynamic Form Engine
             (DynamicForm → FieldRenderer)
                           |
                           v
                       Listing
                   (attributes JSONB)
                           |
                  +--------+--------+
                  |                 |
                  v                 v
               Homepage           PDP
              ProductGrid   DynamicAttributes
```

Detailed:

```
Admin ──► Category + Field config (isRequired, order, conditionalRule)
       ──► Save Draft / Publish ──► SchemaVersion {version, status, schemaJson}
                                        │
Seller ──► GET /api/categories/:id/schema (latest PUBLISHED)
        ──► DynamicFormRenderer (field.type → component)
        ──► POST /api/listings (Zod common + validateAttributes dynamic, conditional aware)
        ──► Listing {schemaVersionId} ──► PDP resolves snapshot by listing.schemaVersionId
```

## Why This Architecture

- **No category-specific forms** — one `DynamicForm` for any current or future category.
- **Reusable fields** — `RAM` once, attached to Mobile + Laptop via `CategoryField` (own `isRequired`/`displayOrder`/`conditionalRule`).
- **Dynamic validation** — `min`/`max`/`minLength`/`maxLength`/options come from `FieldDefinition.config`; validated on both client (`createResolver`) and server (`validateAttributes` + Zod).
- **Conditional fields** — `conditionalRule {field, operator, value}` (`equals`/`not_equals`/`in`/`not_in`); evaluated on both sides; hidden fields are skipped and not required.
- **Schema versioning** — publish creates an immutable snapshot; old listings render with their original version (`GET /api/listings/:id` embeds its snapshot).
- **JSONB flexibility + relational stability** — common marketplace data (title/price/condition/location/images) stays typed; per-category data is schemaless but validated.

## Database Design

Prisma + PostgreSQL (`prisma/schema.prisma`):

| Model | Purpose |
|-------|---------|
| `Category` | `id, name, slug(unique), description, icon, status(ACTIVE/ARCHIVED)` |
| `FieldDefinition` | `id, key(unique), label, type(TEXT…DATE), description, config(JSON)` — reusable |
| `CategoryField` | Join: `categoryId, fieldId(unique pair), displayOrder, isRequired, conditionalRule(Json?)` |
| `SchemaVersion` | `categoryId, version(unique per cat), status(DRAFT/PUBLISHED/ARCHIVED), schemaJson(Json fields[]), publishedAt` — immutable snapshots |
| `Listing` | `categoryId, schemaVersionId?, title, description, price, condition, location, attributes(JsonB)` |
| `ListingImage` | `listingId, url, displayOrder` |

`FieldDefinition.config` example: `{required, placeholder, min, max, minLength, maxLength, options:[{label,value}], unit, helpText}`.  
`CategoryField.conditionalRule` example: `{"field":"underWarranty","operator":"equals","value":"true"}`.

## Seller Flow

1. `GET /api/categories` → category cards (icon/name/description)
2. Seller picks `mobile-phone` → `GET /api/categories/mobile-phone/schema` (latest PUBLISHED)
3. Enters common fields (title≥5, description≥10, price≥0, condition, location, image URL)
4. `DynamicForm` renders `schema.fields` (filtered by `evaluateCondition` live via `watch()`, `shouldUnregister:true` drops hidden values)
5. Review step (formatted with `formatAttributeValue`) → `POST /api/listings` → backend re-validates common(Zod) + dynamic(`validateAttributes`) + conditional, sanitizes, saves with `schemaVersionId`
6. Success (`View Listing` → `GET /api/listings/:id` with embedded `schema`)

## Admin Flow

- `/admin` — stats (categories/active/fields/listings) + recent + quick links
- `/admin/categories` — table (fields count via `GET /:id/fields`, status) + create (name→slug) + archive
- `/admin/categories/:id` — fields list with `▲/▼` reorder (`POST /:id/fields/reorder` transaction), add existing field (filter not-in), create new field (inline), required toggle, remove, conditional editor (trigger field ∈ same category, `equals`/`not_equals`/`in`/`not_in`), `Preview Seller Form` (renders live `DynamicForm` from draft), `Save Draft` vs `Publish`, versions list
- `/admin/fields` — `usedBy` count, create/edit (type-aware config, options editor)

Publishing: `POST /:id/schema/publish` → validates each `FieldDefinition.config` per type, checks conditional targets exist, ensures draft, snapshots `buildSchemaFields` into `schemaJson`, then `$transaction` archives old PUBLISHED → marks draft PUBLISHED.

## API Documentation

Base `http://localhost:4000`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health |
| GET | `/api/categories` | Active categories (seller) |
| GET | `/api/categories/:id` | Category by id/slug |
| GET | `/api/categories/:id/schema` | Latest **published** schema (seller) |
| GET | `/api/listings?limit=&q=` | Recent listings |
| GET | `/api/listings/:id` | Listing + embedded `schema` snapshot |
| POST | `/api/listings` | Create listing (validates common + dynamic) |
| GET | `/api/admin/categories` | All categories |
| GET | `/api/admin/categories/stats` | Dashboard counts |
| POST | `/api/admin/categories` | Create |
| PATCH | `/api/admin/categories/:id` | Update |
| DELETE | `/api/admin/categories/:id` | Archive |
| GET | `/api/admin/categories/:id/fields` | CategoryField with field |
| POST | `/api/admin/categories/:id/fields` | Attach `{fieldId, isRequired, conditionalRule}` |
| PATCH | `/api/admin/categories/:id/fields/:fieldId` | Update required/order/conditional |
| DELETE | `/api/admin/categories/:id/fields/:fieldId` | Detach |
| POST | `/api/admin/categories/:id/fields/reorder` | `{fieldIds:[]}` |
| GET | `/api/admin/categories/:id/schemas` | Versions |
| GET | `/api/admin/categories/:id/draft-schema` | Draft schema (for editor/preview) |
| POST | `/api/admin/categories/:id/schema/draft` | Save draft |
| POST | `/api/admin/categories/:id/schema/publish` | Publish |
| GET | `/api/admin/fields` | All fields (+usedBy) |
| POST | `/api/admin/fields` | Create field |
| GET | `/api/admin/fields/:id` | Field |
| PATCH | `/api/admin/fields/:id` | Update field |

Consistent envelope: `{success:true,data}` / `{success:false,error:{code,message,fields}}` with proper HTTP codes (200/201/400/404/409/500).

## Validation

- **Frontend**: `utils/formValidation.ts` `createResolver(fields)` evaluates `conditionalRule` via shared `evaluateCondition`, validates required/min/max/minLength/maxLength/options/date, returns RHF `{type,message}` errors; `shouldUnregister:true` auto-drops hidden fields.
- **Backend**: `validators/index.ts` (Zod) for common fields + `utils/dynamicValidation.ts` `validateAttributes(fields,attributes)` with identical conditional + type rules + sanitization (NUMBER→number, MULTI_SELECT→array, CHECKBOX→bool). Reject → `400 VALIDATION_ERROR {fields:{key:msg}}`.
- **Shared conditional**: `packages/shared/src/conditional.ts` `evaluateCondition` (used by both, web via type-only duplicate for Vite CJS interop) handles `equals/not_equals/in/not_in` with bool-as-string normalization.

## Schema Versioning

`SchemaVersion` is append-only. Publish never mutates an existing `PUBLISHED` row — it creates a new row (`version = max+1`, `schemaJson = buildSchemaFields(...)`) and archives the previous `PUBLISHED` via transaction. `Listing.schemaVersionId` pins the version it was created with; `GET /api/listings/:id` loads `schemaVersion.schemaJson` for rendering, so a `Mobile v1` listing (Brand/Model/Storage/RAM) still renders after `Mobile v2` adds `Battery Health`.

## Running Locally

Prerequisites: Node 20+, Docker Desktop

```ps
npm install
docker compose up -d                # postgres:16-alpine on 5432 (or 5433 if host PG occupies 5432)
npx prisma migrate deploy           # or: npx prisma migrate dev --name init
npx prisma db seed                  # seeds 14 fields, 3 categories, 7 listings
npm run build -w @marketplace/shared
npm run dev                         # concurrently api :4000 and web :5173
# separate:
npm run dev:api   # http://localhost:4000/api/health
npm run dev:web   # http://localhost:5173
```

Visit: `/` marketplace, `/sell` seller flow, `/products/:id` PDP, `/admin` dashboard.

If Docker fails on 5432 (local Postgres running), either stop the local service or set `POSTGRES_PORT=5433` in `.env` and `DATABASE_URL` to `...@localhost:5433/...` — `docker-compose.yml` uses `${POSTGRES_PORT:-5432}:5432`.

## Environment Variables

`.env.example`:

```
DATABASE_URL="postgresql://marketplace:marketplace@localhost:5432/marketplace?schema=public"
PORT=4000
# optional host override: POSTGRES_PORT=5433
```

## Sample Data

Seed creates: **Mobile Phone** (Brand, Model, Storage, RAM, OS, Color, Original Box, Battery Health), **Laptop** (Brand, Model, Processor, RAM, Storage, Graphics, Battery Health), **Sofa** (Material, Seating Capacity, Pet Friendly, Dimensions, Color) + 7 listings (iPhone 15, Galaxy S23 Ultra, Pixel 8 Pro, MacBook Air M2, Dell XPS 13 Plus, 2 sofas) with Unsplash URLs.

## Testing

```ps
npm test                     # both
npm run test -w @marketplace/api   # 11 tests: create cat/field, attach, publish, get schema, valid/invalid listing, conditional, version pinning, bicycle extensibility
npm run test -w @marketplace/web   # 6 tests: DynamicForm text/select/number, required, conditional visibility, bicycle critical
```

Most important test: create a new category + fields via API, publish, fetch `GET /api/categories/:slug/schema`, assert `DynamicForm` renders the new fields **without any category-specific component**.

## Future Improvements

- Auth/RBAC for `/api/admin/*` (JWT, roles)
- S3 pre-signed uploads instead of image URLs
- Full-text / JSONB GIN search, pagination, filters
- Moderation queue, audit logs, analytics
- Drag-and-drop reorder (dnd-kit)
- E2E Playwright suite

---

> Admin auth is intentionally simplified for assignment scope. In production these endpoints would be protected by authentication and role-based authorization.

## Demo Script (for HR)

1. `docker compose up -d && npx prisma migrate deploy && npx prisma db seed && npm run dev`
2. Open `/admin` → Create category **Bicycle** (🚲) → add fields *Brand, Frame Size (S/M/L), Wheel Size (26/27.5/29), Gear Count (1-30), Frame Material* → Publish
3. Open `/sell` → pick **Bicycle** → form shows the 5 fields instantly (no code change) → fill → Review → Publish → see on `/` → open `/products/:id` → attributes rendered dynamically via `DynamicProductAttributes`.

