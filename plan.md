# CircleStore — Build Plan

Schema-driven secondhand marketplace listing system.
Tracked live. Update this file after each phase commit.

Legend: `[x]` done · `[ ]` pending · `[~]` in progress

---

## Phases (Spec §43)

### PHASE 1 — Project setup `[x]`
- Monorepo: `apps/web`, `apps/api`, `packages/shared`, `prisma/`, root workspace `package.json`
- Scripts: `dev`, `dev:api`, `dev:web`, `build`, `db:*`, `test`
- Stack locked: React18+TS+Vite+Tailwind+RHForm / Express+TS+Prisma5+Zod / PG16 / Vitest+Supertest

### PHASE 2 — Prisma + PostgreSQL `[x]`
- `docker-compose.yml` postgres:16-alpine, healthcheck
- Port conflict mitigation: `POSTGRES_PORT` env (host uses 5433 because local PG on 5432)

### PHASE 3 — Database models `[x]`
- `prisma/schema.prisma`: Category, FieldDefinition, CategoryField, SchemaVersion, Listing, ListingImage + 3 enums
- Migration applied: `20260829190250_init`

### PHASE 4 — Seed data `[x]`
- `prisma/seed.ts`: 14 reusable fields, 3 categories (mobile-phone/laptop/sofa), published SchemaVersion v1, 7 sample listings w/ images
- Verified: `npx prisma db seed` → "Seeded 7 sample listings"

### PHASE 5 — Category APIs `[x]`
- `/api/categories` (seller: active only) + `/api/admin/categories` (CRUD, archive, stats)

### PHASE 6 — Field APIs `[x]`
- `/api/admin/fields` CRUD, usedBy count

### PHASE 7 — Schema/version APIs `[x]`
- `/api/categories/:id/schema` (seller, latest published), `/api/admin/categories/:id/draft-schema`, `/schemas`, `/schema/draft`, `/schema/publish`
- CategoryField attach/update/remove/reorder

### PHASE 8 — Listing APIs `[x]`
- `/api/listings` GET list, GET :id, POST create — **verify end-to-end, confirm route ordering**
- [x] Smoke GET /api/listings (7), GET /api/listings/:id + schema snapshot attrs
- [x] POST valid listing → 201 w/ schemaVersionId pinned (tested Test iPhone 14 -> id cmtesm4ze...)
- [x] POST invalid listing → 400 VALIDATION_ERROR (common + dynamic batteryHealth max 100)
- [x] Bug fixed: `GET /api/categories/:id/schema` missing on public router — added `publicCategories.ts:8` route `/:id/schema` before `/:id`

### PHASE 9 — Dynamic schema/validation engine (harden) `[x]`
- [x] Shared `packages/shared/src/conditional.ts` (single source, bool-as-string), web local copy for Vite CJS interop, backend re-export
- [x] `validateAttributes` + `createResolver` both use conditional + type checks; hidden fields stripped via `shouldUnregister:true`

### PHASE 10 — Homepage `[x]`
- [x] Hero, search (`?q` title/category), ProductGrid, EmptyState, loading spinner

### PHASE 11 — Seller flow `[x]`
- [x] 5-step category→common→DynamicForm→review→success; `formatValue` used in ReviewStep

### PHASE 12 — Dynamic form renderer `[x]`
- [x] Verified no `if(category===)` in `components/forms`; `FieldRenderer` dispatches on `field.type` literals for all 8 types

### PHASE 13 — PDP `[x]`
- [x] `DynamicProductAttributes` loops `schema.fields`; `GET /api/listings/:id` embeds snapshot by `schemaVersionId`

### PHASE 14 — Admin dashboard `[x]`
- [x] Stats, recent categories, links, loading/error/empty

### PHASE 15 — Category editor `[x]`
- [x] Fixed draft mapping (`draftVersion`→`CategorySchema`), add/remove/required/reorder(`▲/▼` + `/reorder` tx), conditional editor, preview (`DynamicForm compact`), draft/publish

### PHASE 16 — Field editor `[x]`
- [x] Type-aware `FieldConfigEditor` (TEXT/NUMBER/SELECT…), options editor, duplicate-key 409 via `ApiError.conflict`

### PHASE 17 — Conditional fields `[x]`
- [x] `equals/not_equals/in/not_in` wired both sides, hidden skipped + not required, `in` splits comma

### PHASE 18 — Schema publishing `[x]`
- [x] `ensureDraft` → `buildSchemaFields` snapshot → archive old PUBLISHED → publish; listings pinned

### PHASE 19 — Testing `[x]`
- [x] Backend 11 tests (create cat/field, attach, publish, get schema, valid/invalid, conditional (hidden/visible), version pinning, bicycle)
- [x] Frontend 6 tests (text/select/number, required, conditional visibility, bicycle 5-field extensibility)
- [x] **Critical** bicycle via API → `GET /api/categories/bicycle/schema` returns 5 keys, `DynamicForm` renders them, listing `201` without code change (verified live)

### PHASE 20 — UI polish `[x]`
- [x] cards/spacing/typography, spinners, empty/error/success states, responsive, inline validation, no `alert()` (replaced with inline confirm)

### PHASE 21 — README `[x]`
- [x] Overview, architecture ASCII (sec 41), DB design, flows, API table, validation, versioning, running locally, env, sample data, testing, Bicycle demo, future improvements

---

## Definition of Done (Spec §49) — checklist

- [x] PostgreSQL works (Docker pg16, healthcheck) · migrations run · seed runs
- [x] Mobile / Laptop / Sofa categories exist · fields persisted
- [x] Fields reusable across categories
- [x] Categories/fields create+edit, attach, reorder (▲/▼ + tx)
- [x] Seller gets schema from API · no category-specific seller forms · all field types supported
- [x] Required / min-max / min-max length / default / placeholder validations
- [x] Conditional fields work (front + back)
- [x] Listings created, dynamic attributes in JSONB, schemaVersionId stored
- [x] Homepage + cards + PDP render, PDP dynamic attributes (snapshot)
- [x] Admin preview works · schema publishing · old schemas retained · existing listings after schema change (version pin tested)
- [x] Bicycle extensibility test works (live: bicycle 5 fields, POST 201, homepage 9 listings)
- [x] Loading/error/empty states · responsive
- [x] Tests pass (17/17) · README complete · .env.example · Docker Compose works (`docker compose up -d` healthy, `POSTGRES_PORT` param)
