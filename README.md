# CircleStore

CircleStore is a schema-driven secondhand marketplace. Sellers choose from published categories and receive a form generated from that category's published schema. Administrators manage the taxonomy, fields, schema versions, and seller category requests without changing seller-flow code.

## Stack

- React, Vite, TypeScript, React Hook Form, Zod
- Express, TypeScript, Prisma, PostgreSQL
- Clerk for marketplace users
- Docker Compose and Caddy for production

## Local setup

```bash
git clone <repository-url>
cd CircleStore
cp .env.example .env
npm install
docker compose up -d
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

The web app runs at `http://localhost:5173` and the API at `http://localhost:4000`. The seeded marketplace includes Mobile Phone, Laptop, Sofa, and Bicycle categories with published schemas and listings.

Required environment values are documented in `.env.example`. `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` are server-only values and must never use a `VITE_` prefix.

### Cloudinary photo uploads

CircleStore stores seller photos in Cloudinary and stores only the secure URL, public ID, and display order in PostgreSQL.

1. Create a Cloudinary account.
2. Obtain the Cloud Name, API Key, and API Secret.
3. Add them to the backend `.env` as `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
4. Keep these values server-side; never prefix them with `VITE_` and never commit `.env`.
5. Alternatively, set `CLOUDINARY_URL` in the backend environment.
6. Start the application with the commands above.
7. Open `/sell` and upload photos through the seller flow.

## Tests and builds

```bash
npm test
npm run build
```

## Main journeys

- Browse and search: `/`
- Sell with a dynamic category form: `/sell`
- Product detail, views, pricing insight, and private offers: `/products/:id`
- Admin login: `/admin/login`
- Admin dashboard: `/admin`
- Category requests: `/admin/requests`

The default local admin credentials are `admin1` / `CircleStore`; change them before sharing a deployment.

## Extensibility

To add a category, an administrator creates it, attaches reusable field definitions, configures validation and conditional rules, previews the shared dynamic renderer, and publishes a schema. Publishing creates an immutable schema version. Listings retain their `schemaVersionId`, so old listings continue rendering with the schema they were created against.

Sellers may request a category from `/sell`. Requests are reviewed at `/admin/requests`; approval creates a draft category that remains unavailable until its fields and schema are published.

## Production deployment

Production uses `docker-compose.prod.yml` with PostgreSQL, API, web, and Caddy. Caddy serves `circle.lightchan.online`, proxies `/api/*` to the API container, and serves the web container for all other paths. Containers communicate through Compose service names; the API uses `db`, never `localhost`.

Pushes to `master` run the GitHub Actions workflow. A successful CI build automatically archives tracked source to the EC2 deployment directory, rebuilds the Compose stack, applies Prisma migrations, and checks the public health endpoint. Secrets and `.env` files are excluded from Git.
