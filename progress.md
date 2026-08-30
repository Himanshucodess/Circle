# CircleStore — Progress Log

Live append-only log. Add a row after every phase/task completion with evidence.

Format: `Date | Phase/Task | Status | Evidence`

---

## 2026-08-29 (session 1)

| Phase | Status | Evidence |
|-------|--------|----------|
| 1-7 scaffold + DB + seed + shared + API + frontend | DONE | DB healthy `marketplace-db`; `prisma migrate dev --name init` applied; `npx prisma db seed` → "Seeded 7 sample listings"; `npm run build -w @marketplace/shared` ok |
| Docker PG | DONE | postgres:16-alpine, `POSTGRES_PORT` param (host 5433, local PG holds 5432) |
| Schema | DONE | 6 models + 3 enums, migration `20260829190250_init` |
| Seed | DONE | 14 fields, 3 categories, v1 published, 7 listings w/ images |
| API | DONE | layered route→controller→service→repo; validation engine + conditional; schema publishing w/ draft |
| Web | DONE | Vite+React+TS+Tailwind; DynamicForm/FieldRenderer; SellPage 5-step; PDP; Admin Dashboard/Category/Field editor |

## 2026-08-30 (session 2 — resume)

| Phase | Status | Evidence |
|-------|--------|----------|
| plan.md / progress.md / AGENT.md | DONE | tracking files created |
| Phase 8 — Listing API verify | DONE | Fixed publicCategories missing `GET /:id/schema` (was only on admin router); verified: GET /api/categories/mobile-phone/schema → 8 fields, laptop 7, sofa 5; GET /api/listings count 7, GET /api/listings/:id attrs snapshot; POST valid 201 pinned schemaVersionId; POST invalid 400 common (title/price) + dynamic (batteryHealth max 100) |
| Phase 9 — Conditional unify + Phase 12/15/11 fixes | DONE | Created `shared/src/conditional.ts` + re-export; fixed api build `rootDir`/`strict`/`Json` casts; fixed web build `FIELD_TYPES` CJS named-export (switched FieldRenderer to literals, local conditional, preview draft mapping, ReviewStep `formatValue`); builds pass `api tsc` + `web tsc+vite` |
| Bicycle E2E (spec §37) | DONE | Created Bicycle (🚲) + 5 fields (brand, frame_size x4 opts, wheel_size x3, gear_count 1-30, frame_material x4) → attach → publish v1 → GET /api/categories/bicycle/schema 5 fields → POST bicycle listing 201 id=cmteth9fu… → GET /api/listings count 9, detail schema 5, validation max30 ok; no frontend change |
| Phase 19 — Tests | DONE | `apps/api/tests/api.test.ts` 11/11 pass, `apps/web/.../DynamicForm.test.tsx` 6/6 pass (17 total) — includes bicycle critical |
| Phase 21 — README/.env/.gitignore | DONE | README with arch ASCII (§41), DB, flows, API table, validation, versioning, run-locally, env, sample data, tests, Bicycle demo; .env.example with POSTGRES_PORT note; .gitignore; `npm run build` (shared+api+web) ok |

## Verification commands used
```ps
docker compose up -d
npx prisma migrate dev --name init
npx prisma db seed
npm run build -w @marketplace/shared
```
