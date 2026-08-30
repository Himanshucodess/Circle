# AGENT.md — CircleStore Handoff (compress & keep TIGHT on read)

Compressed context so the next LLM picks up instantly. Scan this + `plan.md` + `progress.md`.

## Project
Schema-driven secondhand marketplace. **Goal:** add a new category (Bicycle) + fields via admin, publish, seller form + PDP render it with NO frontend code change.

## Stack & Ports
- Web: React18 + TS + Vite + Tailwind + React-Hook-Form + React Router
- API: Express + TS + Prisma5 + Zod (backend dynamic validation)
- DB: PostgreSQL 16 in Docker | Host port **5433** (POSTGRES_PORT; local PG owns 5432)
- Shared types/constants: `@marketplace/shared` (built to `packages/shared/dist`)
- API:4000 | Web:5173 (vite proxy /api→4000)
- Root: `C:\Users\himan\Desktop\CircleStore` | DB creds `marketplace/marketplace`

## Data Model (prisma/schema.prisma)
Category(slug unique,status ACTIVE/ARCHIVED) · FieldDefinition(key unique,type en,config Json)
CategoryField(unique categoryId+fieldId, displayOrder, isRequired, conditionalRule Json?)
SchemaVersion(unique categoryId+version, status DRAFT/PUBLISHED/ARCHIVED, schemaJson snapshot)
Listing(schemaVersionId FK→snapshot, attributes Json JSONB, price/condition/location rel) · ListingImage
Field types en: TEXT TEXTAREA NUMBER SELECT RADIO CHECKBOX MULTI_SELECT DATE
Condition ops: equals not_equals in not_in

## Architecture
Admin edits Categories/Fields → CategoryField (working config) → Publish builds `SchemaField[]` snapshot
→ SchemaVersion PUBLISHED (archive old) → seller GET /api/categories/:id/schema → DynamicForm (category-agnostic)
→ POST /api/listings validates common(Zod)+dynamic(validateAttributes) & pins schemaVersionId →
PDP loads listing's snapshot, DynamicProductAttributes renders. Old listings keep old version (immutable).

## Key files
- prisma/schema.prisma, prisma/seed.ts
- packages/shared/src/constants.ts, types.ts
- apps/api/src/app.ts, services/{schema,listing,field,category}Service.ts, utils/{dynamicValidation,conditional}.ts, validators/index.ts, repositories/*
- apps/web/src/components/forms/{DynamicForm,FieldRenderer,*}Field.tsx
- apps/web/src/pages/{SellPage,ProductDetailPage,HomePage}, pages/admin/*
- apps/web/src/utils/{formValidation,conditional,formatValue}.ts

## Run
```
docker compose up -d
npx prisma migrate deploy
npx prisma db seed
npm run build -w @marketplace/shared   # required before api dev (bare specifier→dist)
npm run dev:api   # or concurrently npm run dev
npm run dev:web
```

## Current position / next steps — DONE (2026-08-30)
- All phases 1-21 DONE. Builds pass (`shared+api+web`), tests 17/17 pass, Bicycle E2E verified live (bicycle 5 fields, listing 201, homepage 9).
- API running http://localhost:4000, Web http://localhost:5173 (if `npm run dev`).
- Next: `docker compose down` to stop DB if needed; keep bicycle category for demo (do not delete).

## Known fixes to make
- `apps/api/src/routes/adminCategories.ts`: confirm `/stats` defined before `/:id` (it is) — verify no swallow.
- `CategoryEditorPage.tsx`: uses `fetchDraftSchema` (service name) — schemaService has `getDraftSchema`; ensure front service `fetchDraftSchema` exists in adminApi (it does).
- SellPage review shows raw `String(val)` — switch to `formatValue(field,val)`.
- Conditional evaluator bool normalization differs api vs web — move to shared.

## Bicycle acceptance demo (proof of extensibility)
Admin → create "Bicycle" category → add fields: Brand, Frame Size, Wheel Size, Gear Count, Frame Material → Publish → /sell → select Bicycle → form auto-renders 5 fields (NO code change) → submit → homepage card → /products/:id shows attributes.

## Guards
- Never hardcode category-specific forms/if(category===x) in seller flow.
- Old published silos stay immutable; listings keep their schemaVersionId.
- Validation MUST exist on both FE (createResolver) & BE (validateAttributes + Zod common).
- No alert()/confirm()/browser dialogs in UI.
