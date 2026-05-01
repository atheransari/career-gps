-- ═══════════════════════════════════════════════════════════════════════════
-- CareerPilot — Supabase SQL Setup
-- Run these in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. resume_versions  (Phase 4)
--    Auto-saves every ATS score when a logged-in user uploads/re-scores a resume.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.resume_versions (
  id           BIGSERIAL PRIMARY KEY,
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_text  TEXT        NOT NULL,
  ats_score    INTEGER     NOT NULL CHECK (ats_score BETWEEN 0 AND 100),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Row-Level Security: users can only read/write their own rows
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own resume versions"
  ON public.resume_versions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own resume versions"
  ON public.resume_versions FOR SELECT
  USING (auth.uid() = user_id);

-- Index for fast per-user queries
CREATE INDEX IF NOT EXISTS idx_resume_versions_user_id
  ON public.resume_versions (user_id, created_at DESC);


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. interview_sessions  (Phase 5)
--    Stores each completed interview answer + AI scores for history & progress.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.interview_sessions (
  id                BIGSERIAL PRIMARY KEY,
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type      TEXT        NOT NULL CHECK (session_type IN ('Technical', 'HR', 'Behavioural', 'General')),
  question          TEXT        NOT NULL,
  transcript        TEXT        NOT NULL,
  overall_score     INTEGER     NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  fluency_score     INTEGER     NOT NULL CHECK (fluency_score BETWEEN 0 AND 100),
  confidence_score  INTEGER     NOT NULL CHECK (confidence_score BETWEEN 0 AND 100),
  content_score     INTEGER     NOT NULL CHECK (content_score BETWEEN 0 AND 100),
  duration_seconds  INTEGER     NOT NULL DEFAULT 0,
  words_per_minute  INTEGER     NOT NULL DEFAULT 0,
  filler_count      INTEGER     NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Row-Level Security
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own interview sessions"
  ON public.interview_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own interview sessions"
  ON public.interview_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Index for fast per-user history queries
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id
  ON public.interview_sessions (user_id, created_at DESC);
