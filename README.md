# SIR-Assist P0 Backend

Digital lineage and document verification platform for India's Special Intensive Revision (SIR) process.

This repository contains the **P0 backend core**:
1. **DOB Rule Engine** — deterministic eligibility/document-requirement logic based on statutory birth cut-off brackets.
2. **Lineage Matcher** — fuzzy cross-reference of applicant records against a legacy 2002–2004 electoral roll archive (Soundex + Levenshtein + pg_trgm, with a confidence score).

---

## Prerequisites

| Tool | Version |
|------|---------|
| Docker | 24+ |
| Docker Compose | v2.x (plugin, not standalone) |
| Python | 3.11+ (for local dev only) |
| Node.js | 20+ (for local dev only) |

---

## 🚀 Quick Start (Docker — recommended)

```bash
# 1. Clone / enter the project directory
cd "SIR Assist"

# 2. Copy env files (values are already correct for docker-compose)
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# 3. Build and start all services
docker compose up --build

# 4. Open the test frontend
open http://localhost:3000

# 5. Open the API docs
open http://localhost:8000/api/docs
```

`docker compose up` will:
1. Start PostgreSQL 15 with `fuzzystrmatch` and `pg_trgm` extensions pre-enabled.
2. Wait for DB to be healthy (via `pg_isready` health check).
3. Run Alembic migrations (creates all four tables + GIN indexes).
4. Run the seed script (inserts ≥500 synthetic legacy records).
5. Start uvicorn on port 8000.
6. Build and start the Next.js frontend on port 3000.

---

## 🗄️ Database Setup (local dev without Docker)

```bash
# Requires: PostgreSQL 15 running locally with extensions
psql -U postgres -c "CREATE DATABASE sir_assist;"
psql -U postgres -d sir_assist -c "CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;"
psql -U postgres -d sir_assist -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"

cd backend
cp .env.example .env
# Edit .env: set DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/sir_assist

pip install ".[test]"

# Run migrations
alembic upgrade head

# Seed legacy roll
python scripts/seed_legacy_roll.py

# Start API
uvicorn app.main:app --reload --port 8000
```

---

## 🧪 Running Tests

```bash
cd backend
pip install ".[test]"

# Tests use testcontainers to spin up a fresh Postgres 15 container.
# Requires Docker running.
pytest tests/ -v --asyncio-mode=auto

# If you have a Postgres already running, skip testcontainers:
TEST_DATABASE_URL="postgresql+asyncpg://sir_user:sir_password@localhost:5432/sir_assist_test" \
  pytest tests/ -v --asyncio-mode=auto
```

### Test coverage areas

| Test file | What it covers |
|-----------|----------------|
| `test_dob_eligibility.py` | All 3 brackets, boundary dates, 422 for future/malformed/pre-1900 dates, stack trace leak checks |
| `test_lineage.py` | Shreekant/Shrikant fuzzy match >70%, zero-match 200, unicode names, duplicate dedup, top_n validation, GET by ID, 404 |
| `test_health.py` | 200 when DB up, 503 when DB down (via mock), response structure, timestamp |

---

## 📋 API Reference

Base URL: `http://localhost:8000`

### POST `/api/v1/dob-eligibility/evaluate`
Evaluates a date of birth against the statutory DOB bracket table.

**Request:**
```json
{ "dob": "1985-06-15" }
```

**Response 200:**
```json
{
  "bracket": "pre_1987",
  "description": "...",
  "required_documents": ["Aadhaar Card", "..."],
  "notes": ""
}
```

**Errors:** `422` malformed/future date · `404` no bracket configured

---

### POST `/api/v1/lineage/search`
Fuzzy-matches applicant against the 2002–2004 legacy electoral roll.

**Request:**
```json
{
  "full_name": "Shreekant Ramrao Deshmukh",
  "father_or_husband_name": "Ramrao Deshmukh",
  "mother_name": "Savita Deshmukh",
  "dob": "1975-06-15",
  "declared_address_code": "MH-05-0001",
  "top_n": 5
}
```

**Response 200:**
```json
{
  "applicant_id": "uuid",
  "matches": [
    {
      "legacy_record_id": "uuid",
      "elector_name": "Shrikant Ramrao Deshmukh",
      "father_or_husband_name": "Ramrao Deshmukh",
      "polling_station_id": "PS-0042",
      "confidence_score": 87.5,
      "match_basis": {
        "name_similarity": 0.9,
        "father_name_soundex_match": true,
        "address_code_match": true,
        "dob_proximity_score": 1.0
      }
    }
  ],
  "match_count": 1
}
```

**Errors:** `422` missing required fields · `200` with `match_count: 0` for no matches (valid outcome)

---

### GET `/api/v1/lineage/match/{match_result_id}`
Fetch a previously computed match result by UUID.

**Errors:** `404` if not found

---

### GET `/api/v1/health`
Liveness + DB connectivity check. Returns `503` if DB is unreachable.

---

## 🔑 Confidence Score Formula

```
score = (
    name_similarity     × 0.50   # pg_trgm trigram on elector_name
  + father_soundex      × 0.25   # Soundex match on father/husband name
  + address_code_match  × 0.15   # Exact address_code match
  + dob_proximity       × 0.10   # 1.0 = exact, 0.5 = same year, 0.0 = unknown
) × 100
```

---

## 📁 Project Structure

```
SIR Assist/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app + CORS + exception handlers
│   │   ├── config.py          # pydantic-settings (fail-fast on missing env vars)
│   │   ├── database.py        # Async engine + per-request session dependency
│   │   ├── models/            # SQLAlchemy ORM models
│   │   ├── schemas/           # Pydantic v2 request/response schemas
│   │   ├── api/v1/            # Route handlers (thin — business logic in services)
│   │   ├── services/          # DOB rule engine + lineage matcher
│   │   └── exceptions.py      # Global exception handlers
│   ├── alembic/               # Migrations
│   ├── scripts/
│   │   └── seed_legacy_roll.py
│   └── tests/
├── frontend/
│   ├── app/
│   │   ├── dob-wizard/        # Page 1
│   │   ├── lineage-matcher/   # Page 2
│   │   └── health/            # Page 3
│   ├── components/
│   └── lib/api.ts             # Typed fetch wrappers
├── docker/postgres/init.sql   # Extension setup
└── docker-compose.yml
```

---

## 🔭 Future Extension Points

These are **explicitly out of scope** for this P0 build but the architecture is designed to accommodate them without rewrites:

| Feature | Where to hook in |
|---------|-----------------|
| **OCR / Document Redaction** | New `POST /api/v1/documents/scan` endpoint. Add a `document` table. The `lineage_match_result` table has a FK-ready `legacy_record_id` for cross-referencing. |
| **Node-Graph Lineage API** | Add a `lineage_graph` table and a graph-traversal service. The `applicant` ↔ `lineage_match_result` ↔ `legacy_electoral_roll` chain is already the backbone. |
| **Offline PWA / IndexedDB Sync** | Add a `sync_token` column to `applicant` and a `GET /api/v1/sync/delta` endpoint returning changes since a given token. |
| **GPS Geo-tagging** | Add `latitude`/`longitude` (PostGIS or plain numeric) to `applicant`. One Alembic migration. |
| **Admin No-Code Rule Editor** | The `dob_rule_bracket` table is already DB-driven. Build a CRUD UI over `GET/POST/PUT /api/v1/admin/brackets`. Add auth middleware (FastAPI `Depends` on an admin role claim). |
| **Audit Logging UI** | `lineage_match_result` already stores all match events. Add a `GET /api/v1/admin/audit` endpoint with pagination and filters. |

---

## ⚙️ Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ | — | asyncpg URL, e.g. `postgresql+asyncpg://user:pass@host:5432/db` |
| `CORS_ORIGIN` | ✅ | — | Frontend origin, e.g. `http://localhost:3000` |
| `APP_ENV` | No | `development` | `development` / `production` |
| `DB_QUERY_TIMEOUT_SECONDS` | No | `10` | Statement timeout for fuzzy queries |
| `MAX_REQUEST_BODY_BYTES` | No | `1048576` | 1 MB request size cap |
| `DUPLICATE_WINDOW_MINUTES` | No | `60` | Dedup window for applicant submissions |

App **fails fast on startup** if `DATABASE_URL` or `CORS_ORIGIN` are missing.
