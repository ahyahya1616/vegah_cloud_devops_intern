# VEGAH Cloud Engineering & DevOps Assessment

Full-stack containerized distributed system with automated CI/CD pipeline, Redis-backed asynchronous worker processing, and AWS cloud deployment.

---

## 1. Architecture Overview

```
                          ┌───────────────────────────┐
                          │   Client Web Browser      │
                          └─────────────┬─────────────┘
                                        │ HTTP (Port 80/3000)
                                        ▼
                          ┌───────────────────────────┐
                          │   Next.js 16 Frontend     │
                          │   (SSR / App Router)      │
                          └─────────────┬─────────────┘
                                        │ /api/* reverse proxy
                                        ▼
                          ┌───────────────────────────┐
                          │    NestJS 12 REST API     │
                          └───────┬───────────┬───────┘
                                  │           │
                   Enqueues Job   │           │ Writes Record
                  (BullMQ Client) │           │ (TypeORM)
                                  ▼           ▼
                      ┌───────────────┐   ┌─────────────────┐
                      │ Redis 7 Queue │   │  PostgreSQL 16  │
                      └───────┬───────┘   └────────┬────────┘
                              │                    │
              Pulls & Consumes│                    │ Updates Status
                              ▼                    │ (COMPLETED)
                      ┌───────────────────────┐    │
                      │  NestJS Redis Worker  │────┘
                      │  (Asynchronous Engine)│
                      └───────────────────────┘
```

### Component Details
| Component | Technology | Responsibility |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16 (React, TailwindCSS) | User interface, live task dispatching & real-time status polling |
| **Backend** | NestJS 12 (TypeScript, Express) | REST API endpoints (`/api/tasks`, `/health`), DB persistence & job dispatching |
| **Database** | PostgreSQL 16 (Alpine) | Persistent relational storage for tasks and execution state |
| **Queue** | Redis 7 (Alpine) | In-memory message queue for asynchronous job delivery |
| **Background Worker** | NestJS + BullMQ Processor | Dedicated async background worker handling queue tasks independently |

---

## 2. Quickstart: Run Locally in One Command

### Prerequisites
- Docker Engine & Docker Compose (`v2.20+`)

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/ahyahya1616/vegah_cloud_devops_intern.git
   cd vegah_cloud_devops_intern
   ```

2. Copy the sample environment file:
   ```bash
   cp .env.example .env
   ```

3. Launch the full distributed system:
   ```bash
   docker compose up -d --build
   ```

4. Verify running containers and health checks:
   ```bash
   docker compose ps
   ```

5. Access the services:
   - **Frontend UI**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:4000/api/tasks](http://localhost:4000/api/tasks)
   - **Healthcheck**: [http://localhost:4000/health](http://localhost:4000/health)

---

## 3. Asynchronous Job Workflow (Task 4 Demonstration)

1. **User Action**: The user enters a task title & parameters in the Next.js UI and clicks **"+ Dispatch Job to Redis"**.
2. **REST Ingestion**: NestJS receives `POST /api/tasks`, inserts a row into PostgreSQL with status `PENDING`.
3. **Queue Enqueue**: The backend pushes the job payload into the Redis `tasks` queue via BullMQ.
4. **Worker Processing**: The isolated background worker pulls the job from Redis, sets task status to `PROCESSING`, simulates intensive work (4 seconds), and updates the row to `COMPLETED` with timestamped results.
5. **State Synchronization**: The Next.js frontend polls `/api/tasks` every 2.5 seconds, dynamically updating the status badge from `PENDING` ➔ `PROCESSING` ➔ `COMPLETED`.

---

## 4. Production Deployment & Reliability (Task 5)

### How do you handle application crashes?
- **Container Level**: All services define `restart: unless-stopped` in Docker Compose. If an uncaught exception or crash occurs, Docker automatically restarts the container.
- **Service Level**: Built-in health checks (`pg_isready` for Postgres, `redis-cli ping` for Redis, and `/health` curl check for the API) enable orchestrators to detect deadlocks or unhealthy containers and restart them automatically.
- **Worker Level**: BullMQ implements automatic job retries with exponential backoff so that temporary network blips do not permanently fail tasks.

### How do you prevent secrets from being exposed?
- Secrets are excluded from version control via `.gitignore` (`.env` is ignored; only `.env.example` is committed).
- Multi-stage Docker builds ensure that compilation dependencies, build logs, and environment variables are discarded before generating lean production runner images.
- Non-root users (`nextjs:nodejs` and `node`) are enforced in production runner stages.
- In CI/CD, sensitive cloud keys and database credentials are stored exclusively in **GitHub Actions Secrets**.

### How do you manage database persistence?
- Named Docker volumes (`postgres_data` and `redis_data`) are mounted outside container storage layers.
- Even when containers are stopped, removed, or updated during deployment (`docker compose pull && docker compose up -d`), data persists untouched on host storage volumes.
- In a full cloud production tier, data would be backed up using periodic automated EBS snapshots or managed RDS automated point-in-time restores.

### How would you roll back a failed deployment?
- Our CI/CD pipeline stamps every container image with the traceable Git Commit SHA (`ghcr.io/...:sha-${{ github.sha }}`) alongside `latest`.
- If a regression or issue is detected, rollback is achieved by executing:
  ```bash
  IMAGE_TAG=<previous_commit_sha> docker compose -f docker-compose.prod.yml up -d
  ```
- Alternatively, triggering GitHub Actions rollback workflow or reverting the commit on `main` initiates an automated redeploy of the previous working state.

### How would you investigate a failing container?
1. Inspect container status: `docker compose ps` to identify non-zero exit codes.
2. Read runtime logs: `docker logs <container_name> --tail 100 -f`.
3. Check exit codes and OOM events: `docker inspect <container_name> | grep -E "ExitCode|OOMKilled"`.
4. Inspect resource bottlenecks: `docker stats`.
5. Execute shell inside container: `docker exec -it <container_name> sh` to verify connectivity (e.g. `nc -zv postgres 5432`).

### How would you monitor application health?
- Use HTTP health probes: `/health` endpoint returning system timestamp and operational readiness.
- Integrate container monitoring using lightweight agents (e.g. Prometheus Node Exporter + Grafana, Datadog, or AWS CloudWatch Container Insights).
- Configure alerts on CPU/memory thresholds and failed HTTP health response rates.

---

## 5. Walkthrough Video Guide (Strictly Under 3 Minutes)

| Time | Demonstration Point |
| :--- | :--- |
| **0:00–0:30** | Explain high-level architecture: Next.js + NestJS + Redis Worker + PostgreSQL and cloud infrastructure setup. |
| **0:30–1:00** | Walk through Dockerfiles (multi-stage builds, non-root users, healthchecks) and `docker-compose.yml` dependency graph. |
| **1:00–1:40** | Show GitHub Actions CI/CD workflow executing tests, image builds, GHCR publishing, and deployment trigger. |
| **1:40–2:20** | Live app demo: submit task from UI, watch BullMQ worker pick up job in real time, and show PostgreSQL status update to `COMPLETED`. |
| **2:20–2:50** | Briefly address production questions: Docker restart policies, named persistent volumes, secrets injection, and rollback strategy. |
