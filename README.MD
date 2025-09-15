## Technical Test: Fullstack Todo List with OpenAI Integration for ICN

# Development with Docker

This project uses Docker Compose for local development with three services:

- **database**: Postgres (persistent volume)
- **backend**: Bun + Hono API
- **frontend**: Next.js (Bun)

---

## 1) Prerequisites

- **Docker** ≥ 24.x
- **Docker Compose** (built into recent Docker Desktop / Docker Engine)
- (Optional) **Make** for command shortcuts

---

## 2) Environment Setup

Each service has its own `.env` file. You should copy from the provided `.env.example`:

### Backend

```bash
cp backend/.env.example backend/.env
```

Then edit `backend/.env` with your secrets:

```dotenv
DATABASE_URL=postgres://postgres:postgres@database:5432/icn_todos
JWT_SECRET=your_secret_here
OPENAI_API_KEY=your_openai_key_here
OPENAI_MODEL=gpt-3.5-turbo
PORT=3001
NODE_ENV=development
```

---

### Frontend

```bash
cp frontend/.env.example frontend/.env
```

Then edit `frontend/.env` as needed (for dev you can leave `NEXT_PUBLIC_API_BASE_URL` pointing to backend):

```dotenv
NODE_ENV=development
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

---

## 3) Running the Dev Stack

Start everything:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Run detached:

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

---

## 4) Service Details

### Database

- Runs Postgres on **localhost:5432**
- Data persisted in `database-data` Docker volume
- Credentials:
  - User: `postgres`
  - Password: `postgres`
  - Database: `icn_todos`

### Backend

- Bun + Hono API
- Runs on **localhost:3001**
- Auto-reloads code changes (mounted volume)
- Depends on `database`

### Frontend

- Next.js (Bun)
- Runs on **localhost:3000**
- Hot-reload enabled with file watching
- Depends on `backend`

---

## 5) Useful Commands

### Logs

```bash
docker compose -f docker-compose.dev.yml logs -f
```

Logs for a single service:

```bash
docker compose -f docker-compose.dev.yml logs -f backend
```

### Stop containers

```bash
docker compose -f docker-compose.dev.yml down
```

### Stop and remove volumes (⚠️ resets DB data)

```bash
docker compose -f docker-compose.dev.yml down -v
```

### Rebuild without cache

```bash
docker compose -f docker-compose.dev.yml build --no-cache
```

### Access a container shell

```bash
docker exec -it <container_name> sh
```

---

## 6) Database Setup (first time)

Once containers are up, run migrations/seeds inside backend:

```bash
docker exec -it <backend-container> bun run drizzle:push
docker exec -it <backend-container> bun run drizzle:seed
```

(Adjust to your actual migration/seeding commands.)

---

## 7) Troubleshooting

- **Env not loaded**: Ensure `.env` exists in `backend/` and `frontend/`.
- **Port in use**: Change ports in `docker-compose.dev.yml`.
- **Changes not reflecting**: Ensure volumes are mounted and dev servers (`bun run dev`) are watching files.
- **Database connection errors**: Verify `DATABASE_URL` in `backend/.env` matches Postgres container.
