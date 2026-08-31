# Production deployment

The `CI/CD` workflow runs tests and a production build for every pull request
and push. A push to `master` deploys the tracked repository files to the EC2
Docker host, preserves the server-only `.env`, rebuilds the containers, runs
Prisma migrations, and verifies the public API health endpoint.

Add these GitHub Actions secrets:

- `EC2_HOST`: the EC2 public IP or hostname
- `EC2_USER`: `ubuntu`
- `EC2_SSH_KEY`: the complete contents of the EC2 private key

If GitHub changes the PEM line breaks, add `EC2_SSH_KEY_B64` instead with the
base64-encoded PEM contents. The workflow supports either form.

The EC2 host must already have Docker, Docker Compose, and `/home/ubuntu/circlestore/.env`.
The `.env` file must contain the Clerk keys, `VITE_CLERK_PUBLISHABLE_KEY`, and
the backend-only Cloudinary values `CLOUDINARY_CLOUD_NAME`,
`CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` (or `CLOUDINARY_URL`). It is
never transferred to GitHub or committed to the repository. Cloudinary values
are passed only to the API container by `docker-compose.prod.yml`; they are
not passed to the web container.

Allow inbound TCP ports 80 and 443 in the EC2 security group. Caddy handles
HTTPS certificates for `circle.lightchan.online` automatically.
