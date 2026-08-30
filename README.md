# CircleStore — Dynamic Secondhand Marketplace

A production-quality, schema-driven secondhand marketplace. **Categories and fields are data, not frontend code.** An admin can create a brand-new category like *Bicycle* or *Musical Instruments* and configure its fields in `/admin`, publish, and the seller flow + product page instantly render the new form **without any frontend code change**.

> Single reusable `DynamicForm` / `FieldRenderer` — no `MobileForm.tsx`, `LaptopForm.tsx`, `SofaForm.tsx`.

---

## Problem & Solution

Traditional marketplaces hardcode per-category forms. Every new category means a new component, validation branch, and PDP block.

CircleStore inverts that:

- **Metadata-driven**: `FieldDefinition` + `CategoryField` + `SchemaVersion` describe the form.
- **JSONB attributes**: category-specific answers live in `Listing.attributes` (PostgreSQL JSONB), while common fields stay relational.
- **Immutable snapshots**: each publish freezes a `SchemaVersion`; listings pin `schemaVersionId`, so old listings never break.

Seller flow: `Select category → fetch published schema → DynamicFormRenderer → frontend + backend validation → create listing`.

```
BAD:  if (category === "mobile") show RAM
GOOD: GET /api/categories/mobile-phone/schema → FieldRenderer[type] → Text | Select | Number | Radio | …
```

Adding *Bicycle* = inserting rows, not shipping React code.

---

## Architecture

```
                         ADMIN (/admin)
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
                       PostgreSQL (Prisma)
                            |
                            v
                     Seller API (Express)
                            |
                            v
                 Dynamic Form Engine
              (DynamicForm → FieldRenderer)
                            |
                            v
                        Listing (attributes JSONB + viewCount + offers)
                            |
                   +--------+--------+
                   |                 |
                   v                 v
                Homepage           PDP
               ProductGrid   DynamicAttributes + Pricing + Offers + Views
```

Detailed:

```
Admin ──► Category + Field config (isRequired, order, conditionalRule)
       ──► Save Draft / Publish ──► SchemaVersion {version, status, schemaJson}
                                        │
Seller ──► GET /api/categories/:id/schema (latest PUBLISHED)
        ──► DynamicFormRenderer (field.type → component)
        ──► POST /api/listings (Zod common + validateAttributes dynamic, conditional aware)
        ──► Listing {schemaVersionId, viewCount} ──► PDP resolves snapshot by listing.schemaVersionId + pricing/offers
```

**Public vs Admin separation**

- Public: `/` (browse, search, category pills), `/sell` (5-step seller), `/products/:id` (gallery, pricing, offers, views) — consumer-focused, no admin jargon.
- Admin: `/admin`, `/admin/categories`, `/admin/categories/:id`, `/admin/fields` — schema-driven concepts, reusable fields, publish, preview.

---

## Database Design

Prisma + PostgreSQL (`prisma/schema.prisma`):

| Model | Purpose |
|-------|---------|
| `User` | `id, email(unique), name, avatar, provider(google|github|facebook|demo), providerId, createdAt` — OAuth + demo, linked to listings/offers |
| `Category` | `id, name, slug(unique), description, icon, status(ACTIVE/ARCHIVED)` |
| `FieldDefinition` | `id, key(unique), label, type(TEXT…DATE), description, config(JSON)` — reusable |
| `CategoryField` | Join: `categoryId, fieldId(unique pair), displayOrder, isRequired, conditionalRule(Json?)` |
| `SchemaVersion` | `categoryId, version(unique per cat), status(DRAFT/PUBLISHED/ARCHIVED), schemaJson(Json fields[]), publishedAt` — immutable snapshots |
| `Listing` | `categoryId, sellerId?, schemaVersionId?, title, description, price, condition, location, viewCount(Int), attributes(JsonB)` |
| `ListingImage` | `listingId, url, displayOrder` |
| `Offer` | `listingId, bidderId?, amount(Int), message(String?), status(PENDING/ACCEPTED/REJECTED), createdAt` |

`FieldDefinition.config` example: `{required, placeholder, min, max, minLength, maxLength, options:[{label,value}], unit, helpText}`.  
`CategoryField.conditionalRule` example: `{"field":"underWarranty","operator":"equals","value":"true"}`.

**Why JSONB + relational?** Common marketplace data (title/price/condition/location/viewCount) stays typed and indexable; per-category data is schemaless but strictly validated against the published schema.

---

## Dynamic Form Architecture

- **One `DynamicForm`** for any current or future category. `FieldRenderer` maps `field.type` → `TextField | TextareaField | NumberField | SelectField | RadioField | CheckboxField | MultiSelectField | DateField`.
- **Reusable fields**: `brand` once, attached to Mobile + Laptop + Bicycle via `CategoryField` (own `isRequired`/`displayOrder`/`conditionalRule`).
- **Validation**: `min`/`max`/`minLength`/`maxLength`/options from `FieldDefinition.config`; validated on both client (`utils/formValidation.ts` `createResolver`) and server (`utils/dynamicValidation.ts` `validateAttributes` + Zod). Conditional hidden fields are skipped and not required (`shouldUnregister:true` drops stale values).
- **Shared conditional**: `packages/shared/src/conditional.ts` `evaluateCondition` handles `equals/not_equals/in/not_in` with bool-as-string normalization, used by both sides.

Adding *Musical Instruments* with 7 fields = inserting rows, zero seller-flow code change.

---

## Seller Flow

1. `GET /api/categories` → category cards (icon/name/description) — only active with published schema.
2. Picks `mobile-phone` → `GET /api/categories/mobile-phone/schema` (latest PUBLISHED)
3. Enters common fields (title≥5, description≥10, price>0, condition, location, image URL) — Zod + RHF validation.
4. `DynamicForm` renders `schema.fields` (filtered by `evaluateCondition` live via `watch()`)
5. Review step (formatted with `formatAttributeValue`) → `POST /api/listings` → backend re-validates common(Zod) + dynamic(`validateAttributes`) + conditional, sanitizes, saves with `schemaVersionId`
6. Success (`View Listing` → `GET /api/listings/:id` with embedded `schema`, `viewCount`, `pricingInsight`, `offers`)

Progress: `Category → Details → Specs → Review → Published`.

---

## Product Detail Page

Route `/products/:id`:

- Gallery (`ProductImages`), category badge, condition, location, `Listed 2d ago`, `👁 128 views · 7 offers`
- Price + **Price Insight** (competitive pricing vs same-category median)
- **PricingService**: finds comparable listings (same `categoryId`, up to 20), median, diff%, rating `EXCELLENT/GOOD/COMPETITIVE/HIGH/TOO_HIGH` (thresholds ±5%, ±15%), range bar.
- **Product Details** — `DynamicProductAttributes` rendered from listing's pinned `schemaVersion`.
- Description, Seller card, **Make an Offer** (amount + message → `POST /api/listings/:id/offers`), recent offers.

**View tracking**: `GET /api/listings/:id` increments `viewCount` (simple, not deduped per user for assignment scope; documented). Displayed on card and PDP.

**Offers**: `Offer` model, `POST /api/listings/:id/offers` validates `amount>0`, `GET /api/listings/:id/offers` lists. Status `PENDING/ACCEPTED/REJECTED` (minimal viable for demo, no auth).

---

## Admin Flow

- `/admin` — stats (categories/active/fields/listings) + recent + quick links (no fake metrics, real counts from `GET /api/admin/categories/stats`)
- `/admin/categories` — grid/table toggle, search, `+ Create Category` wizard (name→slug auto, emoji picker 20 options, live preview, review step), archive
- `/admin/categories/:id` — tabs `Fields | Preview | Versions`, fields list with `▲/▼` reorder (`POST /:id/fields/reorder` transaction), add existing field (search, filter not-in), create new field (inline `FieldConfigEditor` with visual type cards, options editor), required toggle, remove, conditional editor (trigger field ∈ same category, `equals`/`not_equals`/`in`/`not_in`), `Preview` (renders live `DynamicForm` from draft via `GET /:id/draft-schema`), `Save Draft` vs `Publish`, versions timeline
- `/admin/fields` — `usedBy` count, create/edit (type-aware config, options editor)
- `/admin/fields/new`, `/admin/fields/:id` — `FieldConfigEditor` (label/key/type/description/required/placeholder/number min/max/unit/text minLength/maxLength/options)

Publishing: `POST /:id/schema/publish` → validates each `FieldDefinition.config` per type, checks conditional targets exist, ensures draft, snapshots `buildSchemaFields` into `schemaJson`, then `$transaction` archives old PUBLISHED → marks draft PUBLISHED.

Preview uses **same** `DynamicForm` as seller — no second implementation.

---

## Schema Versioning

`SchemaVersion` is append-only. Publish never mutates an existing `PUBLISHED` row — creates new row (`version = max+1`, `schemaJson = buildSchemaFields(...)`) and archives previous `PUBLISHED` via transaction. `Listing.schemaVersionId` pins the version it was created with; `GET /api/listings/:id` loads `schemaVersion.schemaJson`, so a `Mobile v1` listing still renders after `Mobile v2` adds `Battery Health`. New listings use latest.

---

## Search & Category Browsing

- Header search → `navigate("/?q=iphone")` or `/?category=mobile-phone`
- `GET /api/listings?search=iphone` — title/description `contains` insensitive (Prisma), or `?category=mobile-phone` filters by `category.slug`
- Homepage client also filters by `q` and `category` for instant feedback, but API supports server filtering for pagination.
- Empty states: “No listings yet — Be the first to sell” / “No products match your search. Try another.” with CTA.
- Categories in homepage `Popular Categories` come from `GET /api/categories` (DB, not hardcoded) — clicking pill sets `?category=`.

---

## API Documentation

Base `http://localhost:4000`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health |
| GET | `/api/auth/providers` | OAuth providers status (google/github/facebook booleans) |
| GET | `/api/auth/google` | Start Google OAuth → redirect |
| GET | `/api/auth/github` | Start GitHub OAuth |
| GET | `/api/auth/facebook` | Start Facebook OAuth |
| GET | `/api/auth/me` | Current user (JWT optional) |
| POST | `/api/auth/demo` | Demo login `{email?, name?}` → JWT |
| POST | `/api/auth/logout` | Clear cookie |
| GET | `/api/categories` | Active categories (seller) |
| GET | `/api/categories/:id` | Category by id/slug |
| GET | `/api/categories/:id/schema` | Latest **published** schema (seller) |
| GET | `/api/listings?limit=&search=&category=&q=` | Recent listings (search/category filter) |
| GET | `/api/listings/:id` | Listing + embedded `schema` + `viewCount` + `pricingInsight` + `offers` |
| POST | `/api/listings` | Create listing (validates common + dynamic, stores sellerId if authed) |
| GET | `/api/listings/:id/offers` | List offers for listing |
| POST | `/api/listings/:id/offers` | Create offer `{amount, message}` (stores bidderId if authed) |
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

Envelope: `{success:true,data}` / `{success:false,error:{code,message,fields}}` (200/201/400/404/409/500).

**Services**: `listingService` (toDto, view increment), `pricingService` (median, rating), `offerService` (create/list), `schemaService` (build, publish), `categoryService`/`fieldService`.

---

## Validation

- **Frontend**: `utils/formValidation.ts` `createResolver(fields)` + shared `evaluateCondition`, `shouldUnregister:true`.
- **Backend**: `validators/index.ts` (Zod) for common + `utils/dynamicValidation.ts` `validateAttributes`.
- **Conditional**: hidden fields not required, stale values dropped.

---

## Authentication (OAuth)

CircleStore now supports **Google, GitHub, Facebook OAuth** + **Demo login** for HR review without real credentials.

**Backend** (`apps/api`):
- `User` model (`id, email(unique), name, avatar, provider, providerId`) linked to `Listing.sellerId` and `Offer.bidderId`
- `passport` strategies `passport-google-oauth20`, `passport-github2`, `passport-facebook` (only initialized if env vars present)
- `JWT` (`jsonwebtoken`, 7d, `JWT_SECRET`) — issued on OAuth callback, set as `httpOnly` cookie + returned via `?token=` for `localStorage`
- `GET /api/auth/providers` → `{google, github, facebook}` booleans
- `GET /api/auth/google|github|facebook` → OAuth start, `GET /api/auth/.../callback` → `signToken` → redirect `FRONTEND_URL/auth/callback?token=...`
- `POST /api/auth/demo` → creates mock user (`demo@...`, pravatar) + JWT — used when OAuth not configured
- `GET /api/auth/me` (optional auth via `Authorization: Bearer` or cookie) and `POST /api/auth/logout`
- `authenticateOptional` middleware populates `req.user` if token present; `createListing`/`createOffer` store `sellerId`/`bidderId` when authed, otherwise anonymous (still works for demo)

**Frontend** (`apps/web`):
- `AuthContext.tsx:1` stores `token` in `localStorage`, `user` in state, `refresh()` calls `GET /api/auth/me`
- `utils/api.ts:16` automatically adds `Authorization: Bearer <token>` and `credentials: include`
- `Header.tsx:1` shows **Browse + Sell** for public, **Sign in** when anonymous, **avatar + name + logout** when authed
- `LoginPage.tsx:1` at `/login` — three OAuth buttons (disabled with “not configured” when env missing) + Demo form (email/name) → `POST /api/auth/demo`
- `AuthCallbackPage.tsx:1` at `/auth/callback` reads `?token` from OAuth redirect, stores via `login()` and navigates to `/`
- Selling and offering work with or without login; when logged in, listings/offers are attributed.

**Setup OAuth**

1. Create apps:
   - Google: https://console.cloud.google.com/apis/credentials → OAuth 2.0 Client → Authorized redirect `http://localhost:4000/api/auth/google/callback`
   - GitHub: https://github.com/settings/developers → New OAuth App → Callback `http://localhost:4000/api/auth/github/callback`
   - Facebook: https://developers.facebook.com/apps/ → Facebook Login → Valid OAuth redirect `http://localhost:4000/api/auth/facebook/callback` (requires HTTPS for production, use `https://localhost` or ngrok)
2. Copy Client IDs/Secrets to `.env`:
   ```
   GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=xxx
   GITHUB_CLIENT_ID=xxx
   GITHUB_CLIENT_SECRET=xxx
   FACEBOOK_CLIENT_ID=xxx
   FACEBOOK_CLIENT_SECRET=xxx
   JWT_SECRET=your-super-secret
   FRONTEND_URL=http://localhost:5173
   ```
3. Restart `npm run dev` — `GET /api/auth/providers` will now show `true` and buttons become active. Demo login still works as fallback.

> For HR review, **no OAuth setup is needed** — just use **Demo login** on `/login` (creates a JWT user instantly).

---

## Running Locally

Prerequisites: Node 20+, Docker Desktop (or local Postgres on 5432)

```ps
npm install
docker compose up -d                # postgres:16-alpine on 5432 (or 5433 if host PG occupies 5432)
npx prisma migrate deploy           # or: npx prisma migrate dev --name init
npx prisma db seed                  # seeds 20 fields, 4 categories (Mobile, Laptop, Sofa, Bicycle), 9 listings
npm run build -w @marketplace/shared
npm run dev                         # concurrently api :4000 and web :5173
# separate:
npm run dev:api   # http://localhost:4000/api/health
npm run dev:web   # http://localhost:5173
```

Visit: `/` marketplace, `/sell` seller flow, `/products/:id` PDP, `/admin` dashboard.

If Docker fails on 5432 (local Postgres running), either stop the local service or set `POSTGRES_PORT=5433` in `.env` and `DATABASE_URL` to `...@localhost:5433/...` — `docker-compose.yml` uses `${POSTGRES_PORT:-5432}:5432`. For this repo, `POSTGRES_PORT=5432` is default and works with a fresh Docker install; if you have a local Postgres, set to `5433`.

**Fresh setup (guaranteed):**
```ps
npm install
docker compose up -d
npx prisma migrate deploy
npx prisma db seed
npm run dev
```
`docker compose` has healthcheck `pg_isready -U marketplace -d marketplace` (interval 5s, retries 10).

## Environment Variables

`.env.example`:
```
DATABASE_URL="postgresql://marketplace:marketplace@localhost:5432/marketplace?schema=public"
PORT=4000
# optional host override: POSTGRES_PORT=5433
```

## Sample Data

Seed creates:

- **Mobile Phone** (Brand, Model, Storage, RAM, OS, Color, Original Box, Battery Health)
- **Laptop** (Brand, Model, Processor, RAM, Storage, Graphics, Battery Health)
- **Sofa** (Material, Seating Capacity, Pet Friendly, Dimensions, Color)
- **Bicycle** (Brand, Frame Size S/M/L/XL, Wheel Size 26/27.5/29, Gear Count 1-30, Frame Material, Brake Type, Suspension) — demonstrates extensibility
- 9 listings: 3 mobiles (iPhone 15, Galaxy S23 Ultra, Pixel 8 Pro), 2 laptops (MacBook Air M2, Dell XPS 13 Plus), 2 sofas, 2 bicycles (Trek, Giant) with Unsplash URLs, `viewCount` 0, `offerCount` 0 (increment on view/offer).

## Testing

```ps
npm test                     # both
npm run test -w @marketplace/api   # 11 tests: create cat/field, attach, publish, get schema, valid/invalid listing, conditional, version pinning, bicycle extensibility
npm run test -w @marketplace/web   # 6 tests: DynamicForm text/select/number, required, conditional visibility, bicycle critical
```

Most important test: create a new category + fields via API, publish, fetch `GET /api/categories/:slug/schema`, assert `DynamicForm` renders the new fields **without any category-specific component**.

Also tested: **Musical Instruments** extensibility (API creates 7 fields, publishes, seller flow renders).

## Demo Script (for HR)

1. `docker compose up -d && npx prisma migrate deploy && npx prisma db seed && npm run dev`
2. Open `/` — see hero “Buy and sell things you love. Find great pre-owned...”, Popular Categories from DB, Latest Listings with real images, views/offers, competitive pricing on PDP.
3. Open `/admin` → Dashboard shows real stats (4 categories, 20 fields, 9 listings) + Recent Categories.
4. Create category **Bicycle** (already seeded) or **Musical Instruments**: Add fields *Instrument Type (SELECT), Brand (TEXT), Year (NUMBER), Material (SELECT), Number of Strings (NUMBER), Type (RADIO), Accessories (MULTI_SELECT)* → Publish.
5. Open `/sell` → pick **Bicycle** or **Musical Instruments** → form shows the new fields instantly (no code change) → fill → Review → Publish → see on `/` → open `/products/:id` → attributes + pricing insight + views/offers + Make Offer.
6. Test versioning: Add field *Condition of Instrument* to Musical Instruments → Publish v2 → old listing still shows v1, new uses v2.
7. Test pricing: Open iPhone 15 PDP — see “Excellent price — 18% below median” with range bar.
8. Test offers: PDP → Make an Offer 50000 → offer count updates.

> Adding *Bicycle* = inserting rows, not shipping React code. Public marketplace stays consumer-focused; admin shows schema power.

---

> Authentication is implemented with Passport OAuth (Google/GitHub/Facebook) + JWT + Demo login. For stricter RBAC, wrap `/api/admin/*` with `authenticateRequired` (currently optional for assignment demo).

## Future Improvements

- S3 pre-signed uploads instead of image URLs
- Full-text / JSONB GIN search, pagination, filters (currently simple `contains`)
- Moderation queue, audit logs, analytics
- Drag-and-drop reorder (dnd-kit)
- E2E Playwright suite
- Unique view deduping (IP/user + window)

## Limitations

- View counting is simple increment per `GET /:id` (no dedup window)
- Offer auth is demo (no user accounts)
- Search is `contains` insensitive, no ranking
- Pricing uses only same-category median (not attribute-weighted, but threshold logic is explainable)
