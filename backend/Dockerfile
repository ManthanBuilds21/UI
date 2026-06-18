FROM node:22-alpine AS build
WORKDIR /app

COPY backend/package.json ./backend/package.json
COPY backend/tsconfig.json ./backend/tsconfig.json
COPY backend/logs ./backend/logs
COPY backend/prisma ./backend/prisma
COPY backend/src ./backend/src
COPY frontend/src/data ./frontend/src/data
COPY frontend/src/types ./frontend/src/types

RUN npm install --prefix backend
RUN npm --prefix backend run prisma:generate
RUN npm --prefix backend run build

FROM node:22-alpine AS runtime
WORKDIR /app

COPY --from=build /app/backend/package.json ./backend/package.json
COPY --from=build /app/backend/node_modules ./backend/node_modules
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/prisma ./backend/prisma
COPY --from=build /app/backend/logs ./backend/logs
COPY --from=build /app/frontend/src/data ./frontend/src/data
COPY --from=build /app/frontend/src/types ./frontend/src/types

EXPOSE 4000
CMD ["sh", "-c", "cd backend && npx prisma migrate deploy && npm run db:seed && npm run start"]
