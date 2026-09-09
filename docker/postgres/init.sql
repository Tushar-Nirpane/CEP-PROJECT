-- Enable required PostgreSQL extensions for SIR-Assist
-- fuzzystrmatch: provides soundex(), difference(), levenshtein()
-- pg_trgm: provides similarity(), word_similarity(), GIN trigram indexes

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
