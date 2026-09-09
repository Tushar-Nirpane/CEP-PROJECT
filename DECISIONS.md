# DECISIONS.md — SIR-Assist P0 Build

Every assumption made in lieu of explicit specification is documented here.

---

## 1. Duplicate Applicant Detection: Return existing result (not 409)

**Situation:** The spec says "do not silently create duplicate applicant rows" but does not specify what to return.

**Decision:** Within the `DUPLICATE_WINDOW_MINUTES` window (default: 60 min), if an identical submission (same normalized `full_name` + `dob` + `father_or_husband_name`) is received, return the existing applicant's previously computed match results. The response is indistinguishable from a fresh search (same `applicant_id`, same matches). No 409 is raised.

**Why:** Field workers re-submitting the same form (e.g., after a network hiccup) should get a seamless result, not a confusing 409 error. The audit trail is preserved — the same `applicant` row and its `lineage_match_result` rows remain. A fresh submission after the window creates a new row (e.g., re-submission the next day is treated as new).

---

## 2. Confidence Scoring: Python-side re-scoring after DB pre-filter

**Situation:** The spec says "confidence scoring formula must be explicit." It does not specify where computation happens.

**Decision:** The DB pre-filters candidates using `similarity(elector_name, :name) >= 0.2` (leveraging the GIN index for speed), then returns up to `top_n × 10` rows (capped at 250). Python scores all candidates using Jaro-Winkler similarity (via `jellyfish`) + Soundex + address + DOB proximity, then sorts and takes the top N.

**Why:** SQL-only scoring would require storing confidence weights in the DB and updating SQL when weights change. Python scoring is easier to test, easier to read, and the pre-filter keeps the candidate pool small enough that Python scoring is negligible overhead.

---

## 3. Jaro-Winkler vs. pure pg_trgm for final name score

**Situation:** The spec says "50% trigram name similarity." Both pg_trgm and Jaro-Winkler are reasonable choices.

**Decision:** pg_trgm `similarity()` is used for the DB-side pre-filter (it leverages the GIN index). Jaro-Winkler (`jellyfish.jaro_winkler_similarity`) is used for the Python-side final score. Jaro-Winkler is generally more accurate for transliterated Indian names because it gives extra weight to common prefix matching (e.g., "Shr" in Shreekant/Shrikant).

**Why:** The spec's intent is to find transliteration variants reliably. Jaro-Winkler performs better on short name tokens like Indian given names than raw trigram overlap.

---

## 4. testcontainers for test isolation

**Situation:** The spec says tests must run against "real Postgres via testcontainers or a docker-compose test DB."

**Decision:** testcontainers is the default. If `TEST_DATABASE_URL` is set in the environment, that DB is used instead (useful for CI pipelines with a service container).

**Why:** testcontainers provides complete isolation per test run with no external setup. The fallback to `TEST_DATABASE_URL` makes CI integration straightforward.

---

## 5. Soundex pre-computation at seed/insert time (not via DB trigger)

**Situation:** The spec mentions "generated/populated at insert time" for soundex columns.

**Decision:** Soundex is computed in Python (`jellyfish.soundex()`) at insert time — in the seed script for legacy records, and in the lineage matcher service for any future writes.

**Why:** Adding a `BEFORE INSERT` trigger would require a migration change and makes the DB schema harder to reason about. The extension point for a trigger is explicitly noted in the README. The Python computation uses `jellyfish`, which produces the same Soundex as PostgreSQL's `soundex()` function (both implement the standard US Soundex algorithm).

**Verification:** The seed script and the lineage matcher both use `jellyfish.soundex(name.strip().upper())` consistently.

---

## 6. CORS: Single origin, not a list

**Situation:** The spec says "CORS explicitly configured to allow only the test frontend's origin."

**Decision:** `CORS_ORIGIN` is a single string from env. The FastAPI CORS middleware receives `allow_origins=[settings.CORS_ORIGIN]`. To add multiple origins in production, change this to a comma-separated env var and split it.

**Why:** A single origin is correct for this P0 build. The extension point (comma-split) is mentioned in comments.

---

## 7. DOB bracket for `pre_1987`: upper bound is 1986-12-31 (not 1986-12-32 or 1987-01-01)

**Situation:** The spec says "born before 1987-01-01" for the pre-1987 bracket.

**Decision:** `max_dob = 1986-12-31` for `pre_1987`. The `1987_2004` bracket starts at `min_dob = 1987-01-01`. There is no gap between them.

**Why:** The brackets are designed to be contiguous and non-overlapping. A DOB of exactly 1987-01-01 falls in `1987_2004` (correct per statute).

---

## 8. Zero-match submissions: persist a null-match row

**Situation:** The spec says "persist a null-match row so the audit trail exists later."

**Decision:** When `matches == []`, a single `lineage_match_result` row with `legacy_record_id = NULL`, `confidence_score = 0.0`, and `match_basis = {"no_candidates_found": true}` is persisted.

**Why:** This maintains a complete audit trail — every submission (successful or not) has a corresponding row in `lineage_match_result`. The GET endpoint filters out null-legacy_record rows when building responses for existing applicants.

---

## 9. Request body size limit: 1 MB

**Situation:** The spec says "add a basic request timeout and sane size limit."

**Decision:** `MAX_REQUEST_BODY_BYTES = 1_048_576` (1 MB) via a FastAPI HTTP middleware that checks the `Content-Length` header. The fuzzy-match query has `DB_QUERY_TIMEOUT_SECONDS = 10` (set as `statement_timeout` per session via `SET LOCAL statement_timeout`).

**Why:** 1 MB is generous for JSON payloads (the largest valid lineage request is ~500 bytes). The per-session `statement_timeout` is preferred over a global setting because it resets automatically when the session closes, with no side effects on other sessions.

---

## 10. `scripts/` directory: not a Python package

**Situation:** The seed script must be runnable as `python scripts/seed_legacy_roll.py`.

**Decision:** `scripts/` is not a Python package (no `__init__.py`). Scripts add the parent directory to `sys.path` at runtime so they can import from `app.*`.

**Why:** This is the conventional approach for standalone management scripts in FastAPI/Django-style projects. No package machinery needed.
