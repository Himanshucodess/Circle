# CircleStore

CircleStore is a schema-driven second-hand marketplace designed to support dynamic product categories and category-specific listing fields without requiring category-specific frontend forms. The core architecture stores categories, field definitions, validation rules, options, and schema versions as configurable data in PostgreSQL. When a seller selects a category, the frontend fetches its active schema through the API and dynamically renders the appropriate form fields, allowing administrators to introduce new categories and fields without rewriting the seller flow. Sellers can browse categories, create listings, upload product images, manage their listings, make and receive offers, and request new categories when a required category is unavailable. Administrators can manage categories, configure reusable fields, publish schemas, and review seller category requests. The backend is built with Node.js, Express.js, TypeScript, Prisma, and follows a clean layered architecture using routes, controllers, services, and repositories. PostgreSQL is used as the persistent source of truth, while Redis provides cache-aside caching for frequently accessed categories, schemas, listings, and pricing insights with TTL-based expiration and cache invalidation. Redis is designed to fail open so the application can fall back to PostgreSQL if the cache becomes unavailable. Clerk is used for authentication, Cloudinary for product image storage, and Zod for frontend and backend validation. The frontend is built with React, Vite, TypeScript, React Hook Form, shadcn/ui, and React Router. The complete application is containerized using Docker and Docker Compose and deployed on an Ubuntu AWS EC2 instance, with Caddy acting as the reverse proxy and HTTPS layer. The marketplace also includes Product Detail Pages, marketplace activity such as views and active offers, offer competitiveness feedback, pricing insights, category requests, and listing management. The main design goal is extensibility: adding a new category such as a bicycle, camera, furniture item, or any other product should primarily require configuration through the category and field management system rather than new hard-coded frontend forms.

## Demo

Live Demo: https://circle.lightchan.online/

Admin Panel: https://circle.lightchan.online/admin/login

## Source Code

https://github.com/Himanshucodess/Circle

## Setup

Clone the repository, install dependencies, configure the required environment variables using `.env.example`, start the Docker Compose services, run the Prisma migrations, seed the database, and start the development server. The project includes sample categories, fields, listings, offers, and category requests for testing the complete marketplace workflow.

## Tech Stack

React, Vite, TypeScript, React Hook Form, shadcn/ui, Zod, Node.js, Express.js, Prisma, PostgreSQL, Redis, ioredis, Clerk, Cloudinary, Docker, Docker Compose, Caddy, AWS EC2, Ubuntu, Git and GitHub.
