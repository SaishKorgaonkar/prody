-- Optional: run on Neon Postgres for production waitlist storage.
-- Without DATABASE_URL, signups save locally to landing/.data/waitlist.json

CREATE TABLE IF NOT EXISTS waitlist_signups (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL UNIQUE,
  source     TEXT,
  role       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS waitlist_signups_created_at_idx
  ON waitlist_signups (created_at DESC);
