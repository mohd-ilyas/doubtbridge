# DoubtBridge !

> **A smart academic doubt-management platform** that intelligently routes student questions to the right faculty — based on subject expertise, availability, and workload.

---

##  What is DoubtBridge?

DoubtBridge eliminates the chaos of academic Q&A. Students submit doubts; the system automatically assigns them to the most qualified available faculty using a **scoring-based routing engine**. Faculty members can accept, work on, respond to, and transfer doubts — all through a clean, role-based interface.

### Key Highlights

-  **Smart Routing Engine** — Scores faculty on expertise, topic match, availability, and workload to pick the best match
-  **Three Role System** — Students, Faculty, and Admin each get a tailored dashboard
-  **Full Doubt Lifecycle** — `SUBMITTED ? QUEUED ? ASSIGNED ? ACCEPTED ? IN_PROGRESS ? ANSWERED ? RESOLVED ? CLOSED`
-  **JWT Authentication** — Secure, stateless auth with role-based access control
-  **Swagger API Docs** — Interactive documentation served at `/api-docs`
-  **Docker Ready** — One-command Postgres setup for local dev
-  **Render Deploy** — Production-ready `render.yaml` included

---

##  Architecture

```
doubtbridge/
+-- backend/                  # Node.js / Express / TypeScript API
¦   +-- prisma/
¦   ¦   +-- schema.prisma              # SQLite schema (local dev)
¦   ¦   +-- schema.postgresql.prisma  # PostgreSQL schema (production)
¦   +-- src/
¦       +-- config/           # Environment variable validation
¦       +-- controllers/      # Request handlers
¦       +-- middlewares/      # Auth, error handling, validation
¦       +-- routes/           # Express routers
¦       +-- services/         # Business logic (routing, auth, doubts)
¦       +-- validators/       # Zod schemas
¦       +-- __tests__/        # Integration & E2E tests
¦
+-- frontend/                 # React 19 / Vite / TailwindCSS SPA
    +-- src/
        +-- components/       # Reusable UI components
        +-- contexts/         # Auth context (global state)
        +-- pages/
        ¦   +-- student/      # Student dashboard & doubt forms
        ¦   +-- faculty/      # Faculty dashboard & settings
        ¦   +-- admin/        # Admin dashboard & faculty management
        +-- lib/              # API client (axios)
```

---

##  Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | v18+ |
| npm | v9+ |
| Docker & Docker Compose | (for local Postgres) |

### 1. Clone the repository

```bash
git clone https://github.com/your-username/doubtbridge.git
cd doubtbridge
```

### 2. Set up environment variables

**Root (backend):**
```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="file:./prisma/dev.db"   # SQLite for local dev
JWT_SECRET="your-super-secret-key"
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
DEMO_PASSWORD=your-demo-password
```

**Frontend:**
```bash
cp frontend/.env.example frontend/.env
```
```env
VITE_API_URL=http://localhost:5000
```

### 3. Install dependencies

```bash
# Install root (backend) dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 4. Set up the database

**Option A — SQLite (simplest, no Docker needed):**
```bash
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to SQLite
npm run db:seed        # Seed with demo data
```

**Option B — PostgreSQL via Docker:**
```bash
docker-compose up -d   # Start Postgres container

# Then in a new terminal:
npm run db:generate:postgres
npm run db:migrate:deploy
npm run db:seed:postgres
```

### 5. Start the development servers

```bash
# Terminal 1 — Backend (runs on :5000)
npm run dev

# Terminal 2 — Frontend (runs on :5173)
cd frontend && npm run dev
```

Open http://localhost:5173 ??

---

##  API Reference

The full interactive API is available at **`http://localhost:5000/api-docs`** (Swagger UI).

### Auth Routes — `/auth`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/auth/register` | Register a new student | Public |
| `POST` | `/auth/login` | Login and receive JWT | Public |
| `GET` | `/auth/me` | Get current user info | ?? Any |

### Academic Routes — `/api`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/departments` | List all departments | ?? Any |
| `GET` | `/api/departments/:id/subjects` | List subjects in a department | ?? Any |
| `GET` | `/api/subjects/:id/topics` | List topics in a subject | ?? Any |

### Doubt Routes — `/doubts`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/doubts` | Submit a new doubt | ?? Student |
| `GET` | `/doubts/student` | Get your submitted doubts | ?? Student |
| `POST` | `/doubts/:id/resolve` | Mark a doubt as resolved | ?? Student |
| `POST` | `/doubts/:id/reopen` | Reopen a resolved doubt | ?? Student |
| `POST` | `/doubts/:id/close` | Permanently close a doubt | ?? Student / ??? Admin |

### Faculty Routes — `/faculty`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `PATCH` | `/faculty/availability` | Set availability window | ????? Faculty |
| `POST` | `/faculty/expertise` | Add a subject/topic expertise | ????? Faculty |
| `GET` | `/faculty/doubts` | Get assigned doubts | ????? Faculty |
| `POST` | `/faculty/doubts/:id/accept` | Accept an assigned doubt | ????? Faculty |
| `POST` | `/faculty/doubts/:id/start` | Start working on a doubt | ????? Faculty |
| `POST` | `/faculty/doubts/:id/respond` | Post a response | ????? Faculty |
| `POST` | `/faculty/doubts/:id/transfer` | Transfer doubt back to queue | ????? Faculty |

### Admin Routes — `/admin`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/admin/faculty` | Create a new faculty account | ??? Admin |
| `GET` | `/admin/dashboard` | Get platform statistics | ??? Admin |

---

##  Smart Routing Engine

When a student submits a doubt, `RoutingService.routeDoubt()` runs automatically. It scores every eligible faculty member in the department:

```
Score = subjectScore + topicScore + availabilityScore + workloadScore
```

| Factor | Without Topic | With Topic |
|--------|--------------|------------|
| Subject Expertise (required) | 50 pts | 40 pts |
| Topic Expertise (bonus) | — | 25 pts |
| Availability | 25 pts | 20 pts |
| Free Workload Ratio | up to 25 pts | up to 15 pts |

**Eligibility rules (all must pass):**
1. Faculty must have subject expertise for the doubt's subject
2. Faculty must be within their set availability window
3. Faculty must not have reached their `maxWorkload` (default: 5 active doubts)

If no faculty is eligible, the doubt is set to `QUEUED`. Queued doubts are automatically retried whenever a faculty member updates their availability via `retryQueuedDoubts`.

---

##  Data Model

```
User ---- StudentProfile ---- Doubts
     +--- FacultyProfile ---- FacultyExpertise (Subject)
                         +--- FacultyTopicExpertise (Topic)
                         +--- AvailabilitySlot
                         +--- DoubtAssignment

Doubt ---- DoubtAssignment ---- FacultyProfile
      +--- DoubtResponse
      +--- ActivityLog

Department ---- Subject ---- Topic
           +--- StudentProfile
           +--- FacultyProfile
```

---

##  Testing

The project uses **Jest** with **Supertest** for API integration and E2E testing.

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage
```

Test suites include:

| File | Coverage |
|------|----------|
| `e2e.test.ts` | Full user journey: register ? submit ? respond ? resolve |
| `integration.test.ts` | Core API flow and routing logic |
| `lifecycle.test.ts` | Doubt status transition edge cases |
| `facultyEndpoint.test.ts` | Faculty-specific endpoint contracts |
| `academicContract.test.ts` | Academic data endpoint contracts |

---

##  Deployment (Render)

The `render.yaml` is pre-configured for zero-config deployment on [Render](https://render.com).

**Services deployed:**
- `doubtbridge-api` — Node.js web service (backend)
- `doubtbridge-web` — Static site (frontend)

**Steps:**
1. Push your code to GitHub
2. Create a new Render Blueprint and connect your repo
3. Set the required environment variables:

| Variable | Service | Description |
|----------|---------|-------------|
| `DATABASE_URL` | Backend | PostgreSQL connection string |
| `JWT_SECRET` | Backend | Auto-generated by Render |
| `FRONTEND_URL` | Backend | Your Render frontend URL |
| `DEMO_PASSWORD` | Backend | Password for seeded demo users |
| `VITE_API_URL` | Frontend | Your Render backend URL |

4. Deploy — Render will run migrations and seed automatically via `npm run start:production`

---

##  Tech Stack

### Backend

| Technology | Role |
|-----------|------|
| **Express 5** | HTTP framework |
| **TypeScript** | Type safety |
| **Prisma 5** | ORM & migrations |
| **PostgreSQL / SQLite** | Database (prod / dev) |
| **JWT + bcryptjs** | Authentication |
| **Zod** | Request validation |
| **Helmet + CORS** | Security headers |
| **Swagger UI** | API documentation |
| **Jest + Supertest** | Testing |

### Frontend

| Technology | Role |
|-----------|------|
| **React 19** | UI framework |
| **Vite 8** | Build tool & dev server |
| **TypeScript** | Type safety |
| **TailwindCSS 3** | Styling |
| **TanStack Query** | Server state & caching |
| **React Router 7** | Client-side routing |
| **Axios** | HTTP client |
| **Lucide React** | Icons |

---

##  Available Scripts

### Root (Backend)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start backend with nodemon (hot reload) |
| `npm run build:backend` | Compile TypeScript to `backend/dist/` |
| `npm run start:backend` | Run compiled backend |
| `npm test` | Run Jest test suite |
| `npm run type-check` | TypeScript type check (no emit) |
| `npm run db:generate` | Generate Prisma client (SQLite) |
| `npm run db:push` | Push schema to SQLite (dev) |
| `npm run db:seed` | Seed the database |
| `npm run db:generate:postgres` | Generate Prisma client (PostgreSQL) |
| `npm run db:migrate:deploy` | Run migrations (production) |
| `npm run start:production` | Migrate + seed + start (Render) |

### Frontend

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server on :5173 |
| `npm run build` | TypeScript check + Vite production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Lint with oxlint |

---

##  Health Check

```bash
curl http://localhost:5000/health
# ? { "success": true, "message": "Server is healthy" }
```

---
