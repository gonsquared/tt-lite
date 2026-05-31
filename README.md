# Task Tracker Lite

A full-stack task management application. Users can create, edit, complete, filter, and delete tasks. Data is persisted in a SQLite database on the backend.

---

## Table of Contents

1. [Architecture Decisions](#architecture-decisions)
2. [Project Structure](#project-structure)
3. [Quick Start (Local Development)](#quick-start-local-development)
4. [Environment Variables](#environment-variables)
5. [Scripts Reference](#scripts-reference)
6. [API Reference](#api-reference)
7. [Testing](#testing)
8. [Docker](#docker)
9. [Troubleshooting](#troubleshooting)
10. [Known Limitations / TODOs](#known-limitations--todos)

---

## Architecture Decisions

| Concern | Decision | Rationale |
|---|---|---|
| Backend language | TypeScript on Node.js | Type safety, shared language with frontend, strong ecosystem |
| Backend framework | Fastify v4 | Low overhead, built-in schema validation hooks, Pino logger included |
| Input validation | Zod | Composable schemas, precise error messages, TypeScript inference |
| Database | SQLite via better-sqlite3 | Zero-dependency server, synchronous API simplifies service layer, appropriate for a single-node app |
| Frontend framework | React 18 with Vite | Fast dev server, native ESM, minimal configuration |
| Rendering strategy | Client-Side Rendering (SPA) | Simple deployment, no SSR complexity needed at this scale |
| API style | REST over HTTP/JSON | Straightforward CRUD, no query complexity requiring GraphQL |
| State management | React Context + useReducer | Sufficient for this data shape; avoids adding Redux/Zustand as a dependency |
| Styling | CSS Modules | Scoped styles without a runtime, no utility-class sprawl |
| Backend tests | Vitest + Supertest | In-process Fastify server; fast, no network round-trip |
| Frontend tests | Vitest + React Testing Library | Component-level unit tests that exercise real DOM behaviour |
| E2E tests | Cypress | Full browser automation covering the 6 critical user flows |
| Containerisation | Docker multi-stage builds | Small production images; native module compilation (better-sqlite3) handled in the builder stage |

---

## Project Structure

```
tt-lite/
  docker-compose.yml          # Orchestrates backend + frontend services
  backend/
    src/
      index.ts                # Fastify app factory and server entry point
      routes/
        health.ts             # GET /api/health
        tasks.ts              # CRUD task endpoints
      services/
        taskService.ts        # Database access layer
      db/
        database.ts           # better-sqlite3 singleton, schema init (WAL mode)
      schemas/
        taskSchemas.ts        # Zod schemas: createTaskSchema, updateTaskSchema
      types/
        task.ts               # Task type: { id, title, completed, createdAt }
    tests/
      unit/
        taskService.test.ts   # 21 unit tests (in-memory SQLite)
      integration/
        tasks.routes.test.ts  # 27 integration tests via Supertest
    Dockerfile                # Multi-stage: node:20-alpine builder -> runtime
    .dockerignore
    package.json
  frontend/
    src/
      App.tsx                 # Root: wraps TaskProvider around AppLayout
      main.tsx                # React DOM entry point
      context/
        TaskContext.tsx       # Context + useReducer state, async action creators
      services/
        taskApi.ts            # fetch wrappers for all REST endpoints
      components/             # 12 components, each with a CSS Module
        AppFooter/
        AppHeader/
        AppLayout/
        EmptyState/
        ErrorMessage/
        FilterBar/
        InlineEditInput/
        LoadingSpinner/
        TaskForm/
        TaskItem/
        TaskList/
        TaskPage/
      types/
        task.ts               # Task + FilterType shared types
      styles/
        global.css
    cypress/
      e2e/
        tasks.cy.ts           # 24 E2E tests across 6 critical user flows
      support/
        commands.ts           # Custom commands: createTaskViaApi, clearAllTasksViaApi
        e2e.ts                # Imports commands
    Dockerfile                # Multi-stage: node:20-alpine builder -> nginx:alpine
    .dockerignore
    nginx.conf                # Proxies /api/ to backend, SPA fallback routing, gzip
    cypress.config.ts
    package.json
```

---

## Quick Start (Local Development)

### Prerequisites

- Node.js 20 or later
- npm 9 or later

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Start the backend

```bash
npm run dev
```

The backend starts on `http://localhost:3001`. It creates `tasks.db` in the current directory on first run.

### 3. Install frontend dependencies

Open a second terminal.

```bash
cd frontend
npm install
```

### 4. Start the frontend

```bash
npm run dev
```

The Vite dev server starts on `http://localhost:5173`. API calls to `/api/*` are proxied to `http://localhost:3001` by the Vite dev server configuration, so no CORS configuration is needed during local development.

Open `http://localhost:5173` in a browser.

---

## Environment Variables

### Backend

Set these in the shell or in a `.env` file before running the backend. All variables have working defaults for local development.

| Variable | Default | Description |
|---|---|---|
| `DATABASE_PATH` | `./tasks.db` | Path to the SQLite database file. Use `:memory:` for ephemeral test databases. |
| `PORT` | `3001` | TCP port the Fastify server listens on. |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin. Must match the frontend URL in production. |
| `LOG_LEVEL` | `info` | Pino log level. Accepted values: `trace`, `debug`, `info`, `warn`, `error`, `fatal`. |

### Frontend

Vite bakes `VITE_*` variables into the bundle at build time. They cannot be changed at runtime.

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | Base path for all API requests. When using Docker Compose the default `/api` is correct because nginx proxies `/api/` to the backend. In local dev the Vite proxy handles it. Set this before running `npm run build`. |

---

## Scripts Reference

### Backend (`backend/`)

| Script | Command | Description |
|---|---|---|
| `dev` | `tsx src/index.ts` | Runs the server with hot reload via tsx. |
| `build` | `tsc` | Compiles TypeScript to `dist/`. |
| `start` | `node dist/index.js` | Runs the compiled production build. |
| `test` | `vitest run` | Runs all unit and integration tests once. |
| `test:coverage` | `vitest run --coverage` | Runs tests with v8 coverage report. |

### Frontend (`frontend/`)

| Script | Command | Description |
|---|---|---|
| `dev` | `vite` | Starts the Vite dev server on port 5173 with `/api` proxy. |
| `build` | `tsc && vite build` | Type-checks then produces a production bundle in `dist/`. |
| `preview` | `vite preview` | Serves the production build locally for inspection. |
| `test` | `vitest run` | Runs all Vitest unit tests once. |
| `test:coverage` | `vitest run --coverage` | Runs unit tests with v8 coverage report. |
| `cy:open` | `cypress open` | Opens the Cypress interactive test runner. |
| `cy:run` | `cypress run` | Runs Cypress tests headlessly. |
| `test:e2e` | `cypress run --headless` | Alias for headless Cypress execution. |

---

## API Reference

All endpoints are prefixed with `/api`. Request and response bodies use `application/json`.

### Error format

Every error response follows this shape:

```json
{ "error": "Human-readable message", "statusCode": 400 }
```

### Task object

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy oat milk",
  "completed": false,
  "createdAt": "2026-05-31T10:00:00.000Z"
}
```

- `id` — UUID v4, assigned by the server.
- `title` — 1–500 characters, whitespace is trimmed before storage.
- `completed` — boolean, defaults to `false` on creation.
- `createdAt` — ISO 8601 string set at creation time, never updated.

### Endpoints

| Method | Path | Request body | Success | Description |
|---|---|---|---|---|
| `GET` | `/api/health` | — | `200 { "status": "ok" }` | Liveness and database connectivity check. Returns `503` if the database is unreachable. |
| `GET` | `/api/tasks` | — | `200 Task[]` | Returns all tasks ordered by `createdAt` descending (newest first). |
| `POST` | `/api/tasks` | `{ "title": string }` | `201 Task` | Creates a task. `title` is required, must be 1–500 characters. |
| `PUT` | `/api/tasks/:id` | `{ "title"?: string, "completed"?: boolean }` | `200 Task` | Updates one or both fields. At least one field must be provided. `:id` must be a valid UUID. Returns `404` when the task does not exist. |
| `DELETE` | `/api/tasks/:id` | — | `204` (no body) | Deletes the task. Returns `404` when the task does not exist. Returns `400` when `:id` is not a valid UUID. |

---

## Testing

### Backend tests

Both test suites use an in-memory SQLite database (`DATABASE_PATH=:memory:`) and are fully isolated from the file system.

```bash
cd backend

# Run unit tests (21 tests) + integration tests (27 tests)
npm test

# Run with coverage report
npm run test:coverage
```

**Unit tests** (`tests/unit/taskService.test.ts`) exercise the service layer functions (`createTask`, `getAllTasks`, `getTaskById`, `updateTask`, `deleteTask`) directly against an in-memory database.

**Integration tests** (`tests/integration/tasks.routes.test.ts`) build the full Fastify application and send HTTP requests via Supertest, covering all five endpoints including validation and error paths.

### Frontend unit tests

```bash
cd frontend

# Run all Vitest unit tests (60 tests across 11 test files)
npm test

# Run with coverage report
npm run test:coverage
```

Test files live in `frontend/src/__tests__/`. Each component and the `taskApi` service module has a corresponding test file.

### Cypress E2E tests

Cypress tests require both the backend and frontend to be running before execution.

**1. Start the backend** (in one terminal):

```bash
cd backend
npm run dev
```

**2. Start the frontend dev server** (in a second terminal):

```bash
cd frontend
npm run dev
```

**3. Run Cypress** (in a third terminal):

```bash
cd frontend

# Interactive mode (opens the Cypress GUI)
npm run cy:open

# Headless mode (CI-friendly)
npm run cy:run
# or
npm run test:e2e
```

Cypress is configured with `baseUrl: http://localhost:5173` and `apiUrl: http://localhost:3001`. The 24 E2E tests cover 6 critical user flows:

1. Create a task (4 tests)
2. Edit a task inline (5 tests)
3. Mark a task as completed / uncompleted (4 tests)
4. Delete a task (3 tests)
5. Filter tasks by All / Active / Completed (5 tests)
6. Persistence across page reload (3 tests)

Two custom Cypress commands defined in `cypress/support/commands.ts` support fast test setup:

- `cy.createTaskViaApi(title)` — creates a task directly via the REST API.
- `cy.clearAllTasksViaApi()` — deletes all tasks before each test for isolation.

---

## Docker

### Prerequisites

- Docker Engine 24 or later
- Docker Compose v2 or later (`docker compose` or `docker-compose`)

### docker-compose.yml

The `docker-compose.yml` at the project root orchestrates both services. The backend mounts a named Docker volume so the SQLite file persists across container restarts.

```bash
# Build images and start both services
docker-compose up --build

# Run in the background
docker-compose up --build -d

# Stop and remove containers (volume is preserved)
docker-compose down

# Stop and remove containers AND the SQLite volume
docker-compose down -v
```

Once running, the application is available at `http://localhost` (port 80, served by nginx). nginx proxies all `/api/` requests to the backend container on port 3001.

### Build images individually

```bash
# Backend image
docker build -t tt-lite-backend ./backend

# Frontend image
docker build -t tt-lite-frontend ./frontend
```

### Image details

**Backend** (`backend/Dockerfile`):
- Builder stage: `node:20-alpine` — installs all dependencies and compiles TypeScript.
- Runtime stage: `node:20-alpine` — installs production-only dependencies, copies compiled `dist/`.
- Runs as a non-root user (`appuser`).
- `HEALTHCHECK` polls `GET /api/health` every 30 seconds.
- Exposes port `3001`.

**Frontend** (`frontend/Dockerfile`):
- Builder stage: `node:20-alpine` — installs dependencies and runs `npm run build`.
- Production stage: `nginx:alpine` — serves the static bundle from `/usr/share/nginx/html`.
- Custom `nginx.conf` enables gzip compression, long-lived cache headers for hashed assets, proxies `/api/` to `http://backend:3001`, and uses a SPA fallback (`try_files`) for client-side routing.
- Exposes port `80`.

### Environment variables in Docker

Set backend variables in `docker-compose.yml` under the backend service's `environment` block. The `VITE_API_BASE_URL` frontend variable must be set as a Docker build argument (`--build-arg`) before the frontend image is built, because Vite bakes it into the bundle at build time.

---

## Troubleshooting

**Tasks do not persist after restarting Docker containers.**
Ensure the `sqlite-data` volume in `docker-compose.yml` is declared as a named top-level volume, not an anonymous bind mount. Run `docker volume ls` to verify `tt-lite_sqlite-data` (or equivalent) exists.

**CORS errors in the browser when running locally without Docker.**
The backend defaults `CORS_ORIGIN` to `http://localhost:5173`. If the frontend runs on a different port or origin, set the `CORS_ORIGIN` environment variable on the backend before starting it. When using the Vite dev server, the built-in proxy handles `/api/` requests on the same origin, so CORS does not apply.

**`VITE_API_BASE_URL` is not picking up changes.**
This variable is baked into the bundle at `npm run build` time. Set it in the environment before building; changing it afterwards has no effect without rebuilding.

**`better-sqlite3` native compilation fails during `npm install`.**
`better-sqlite3` contains a native Node.js addon and requires build tools (`python3`, `make`, `g++`). The Docker builder stage (`node:20-alpine`) installs these automatically. For local development on a machine without build tools, install `build-essential` (Debian/Ubuntu) or `xcode-select --install` (macOS).

**Cypress tests fail with "cannot connect to http://localhost:5173" or "http://localhost:3001".**
Both the frontend dev server and the backend must be running before Cypress is started. Start them in separate terminals as described in the [Testing](#testing) section.

**Cypress tests leave behind tasks that pollute later test runs.**
Each test in `tasks.cy.ts` calls `cy.clearAllTasksViaApi()` in `beforeEach`, which deletes all tasks via the REST API. If this command fails (for example because the backend is not running), subsequent tests will see stale data.

---

## Known Limitations / TODOs

- **No authentication or authorisation.** All tasks are globally shared; any client can read, create, update, or delete any task.
- **Single-node only.** SQLite is not designed for concurrent writes from multiple processes. Horizontal scaling of the backend is not supported without replacing the database.
- **No pagination.** `GET /api/tasks` always returns the full task list. Large task counts may impact performance.
- **docker-compose.yml is not yet committed.** The file must be created at the project root before Docker Compose commands will work. See the Docker section above for the required service definitions.
- **No frontend `.env.example` file.** Developers must know to set `VITE_API_BASE_URL` manually when building for environments other than Docker Compose.
- **No CI pipeline.** Automated test runs on pull requests are not yet configured.
- **Cypress requires manual service startup.** There is no script that starts both servers and runs Cypress in a single command.
