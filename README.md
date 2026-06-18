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

3. Configure PostgreSQL in `backend/.env`.

4. Generate Prisma client:

```bash
npm run prisma:generate
```

5. Generate and validate the SQL migration plan from the Prisma schema:

```bash
npm run prisma:migrate
```

6. Apply the checked-in migrations to your configured database:

```bash
npm run prisma:deploy --workspace backend
```

7. Seed the catalog:

```bash
npm run seed
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

## Production

Build both apps:

```bash
npm run build
```

Start the backend:

```bash
npm run start
```

## Notes

- Frontend API calls are centralized in `frontend/src/services/`.
- Admin credentials are bootstrapped from `ADMIN_EMAIL` and `ADMIN_PASSWORD` if provided.
- Backend startup verifies the database connection before serving requests.
- API reference: `docs/API.md`
- Database schema reference: `docs/DB_SCHEMA.md`
