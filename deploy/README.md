# Production deployment

The `CI/CD` workflow runs tests and a production build for every pull request
and push. A push to `master` deploys the tracked repository files to the EC2
Docker host, preserves the server-only `.env`, rebuilds the containers, runs
Prisma migrations, and verifies the public API health endpoint.

Add these GitHub Actions secrets:

- `EC2_HOST`: the EC2 public IP or hostname
- `EC2_USER`: `ubuntu`
- `EC2_SSH_KEY`: the complete contents of the EC2 private key

The EC2 host must already have Docker, Docker Compose, and `/home/ubuntu/circlestore/.env`.
The `.env` file must contain the Clerk keys and `VITE_CLERK_PUBLISHABLE_KEY`;
it is never transferred to GitHub or committed to the repository.

Allow inbound TCP ports 80 and 443 in the EC2 security group. Caddy handles
HTTPS certificates for `circle.lightchan.online` automatically.
