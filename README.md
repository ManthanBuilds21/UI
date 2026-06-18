# MANTHAN Monorepo

Production-ready monorepo structure for the MANTHAN storefront.

## Structure

```txt
.
├── frontend
├── backend
├── docs
└── package.json
```

## Apps

- `frontend/`: React 18 + TypeScript + Vite storefront
- `backend/`: Express + TypeScript + Prisma API
- `docs/`: API and database documentation

## Setup

1. Install dependencies from the repository root:

```bash
npm install
```

2. Create your backend environment file from `backend/.env.example`.

3. Optional frontend override: copy `frontend/.env.example` if you want to point the UI at a non-default API URL.

4. Configure PostgreSQL in `backend/.env`.

5. Generate Prisma client:

```bash
npm run prisma:generate
```

6. Generate and validate the SQL migration plan from the Prisma schema:

```bash
npm run prisma:migrate
```

7. Apply the checked-in migrations to your configured database:

```bash
npm run prisma:deploy --workspace backend
```

8. Seed the catalog:

```bash
npm run seed
```

9. Optional database utility commands:

```bash
npm run db:seed
npm run db:reset
```

## Development

Run frontend and backend together:

```bash
npm run dev
```

Run each app separately:

```bash
npm run dev:frontend
npm run dev:backend
```

## Docker Setup

Start the full stack with PostgreSQL, backend, and frontend:

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:4173`
- Backend: `http://localhost:4000`
- Health: `http://localhost:4000/api/health`
- PostgreSQL: `localhost:5432`

## Production

Build both apps:

```bash
npm run build
```

Start the backend:

```bash
npm run start
```

## Deployment Guide

1. Set production values in `backend/.env`.
2. Run `npm run prisma:deploy`.
3. Run `npm run db:seed` if you need catalog seed data.
4. Build the monorepo with `npm run build`.
5. Start the backend with `npm run start`.
6. Serve the frontend build output from `frontend/dist` behind your preferred web server or container.

## Troubleshooting

- `JWT_SECRET` missing:
  Set it in `backend/.env` before starting the backend.
- Prisma generation or migration fails:
  Verify `DATABASE_URL`, database reachability, and run `npm run prisma:generate`.
- Frontend cannot reach backend:
  Check `frontend/src/config/env.ts`, `VITE_API_URL`, and CORS settings in `backend/.env`.
- Docker startup issues:
  Rebuild with `docker compose up --build` after dependency or schema changes.
- Rate limiting during auth testing:
  Increase `AUTH_RATE_LIMIT_MAX_REQUESTS` in non-production environments.

## Notes

- Frontend API calls are centralized in `frontend/src/services/`.
- Frontend API base URL is centralized in [frontend/src/config/env.ts](/D:/ui/frontend/src/config/env.ts).
- Backend startup verifies the database connection before serving requests.
- Admin credentials are bootstrapped from `ADMIN_EMAIL` and `ADMIN_PASSWORD` if provided.
- Request and error logs are written to `backend/logs/`.
- API reference: [docs/API.md](/D:/ui/docs/API.md)
- Database schema reference: [docs/DB_SCHEMA.md](/D:/ui/docs/DB_SCHEMA.md)
