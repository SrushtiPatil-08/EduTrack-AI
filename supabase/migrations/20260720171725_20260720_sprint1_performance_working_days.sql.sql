/*
# Sprint 1 — Performance Type & Working Days (Additive)

## Purpose
Completes the remaining Sprint 1 student-profile fields without touching
existing data. Adds flexible academic-performance tracking (GPA / CGPA /
Percentage) and working-days configuration used by attendance calculations.

## New Columns (all on `profiles`, all nullable / defaulted — backward compatible)
1. `performance_type` text — one of 'gpa', 'cgpa', 'percentage'. Default 'cgpa'
   so existing rows keep the old CGPA behaviour. Used to label "Current …" /
   "Target …" dynamically throughout the app.
2. `current_score` numeric(5,2) — the student's current score in the chosen
   performance system (GPA 0–10, CGPA 0–10, or percentage 0–100).
3. `target_score` numeric(5,2) — the student's target score in the same system.
4. `working_days` text — serialized selection of working weekdays. Stored as a
   comma-separated list of lowercase weekday names (e.g. 'mon,tue,wed,thu,fri')
   or one of the preset tokens 'mon-fri', 'mon-sat', 'sat-only'. Default
   'mon-fri'. Attendance calculations read this to know which days count.
5. `default_lecture_type` text — one of 'theory', 'practical', 'tutorial'.
   Default 'theory'. Used as the pre-selected lecture type when marking
   attendance.

## Security
- No new tables. RLS already enabled on `profiles`; existing owner-scoped
  policies cover the new columns automatically (column-level RLS not enabled).

## Important Notes
1. Purely additive — no existing column is dropped, renamed, or retyped.
2. `current_cgpa` / `target_cgpa` from the previous migration are left intact
   for backward compatibility; new code reads `current_score` / `target_score`.
3. CHECK constraints keep the new text columns within their allowed value sets.
4. Idempotent: guarded with `IF NOT EXISTS` via a DO block.
*/

DO $$
BEGIN
  -- performance_type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='profiles' AND column_name='performance_type') THEN
    ALTER TABLE profiles ADD COLUMN performance_type text NOT NULL DEFAULT 'cgpa'
      CHECK (performance_type IN ('gpa', 'cgpa', 'percentage'));
  END IF;

  -- current_score
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='profiles' AND column_name='current_score') THEN
    ALTER TABLE profiles ADD COLUMN current_score numeric(5,2)
      CHECK (current_score IS NULL OR (current_score >= 0 AND current_score <= 100));
  END IF;

  -- target_score
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='profiles' AND column_name='target_score') THEN
    ALTER TABLE profiles ADD COLUMN target_score numeric(5,2)
      CHECK (target_score IS NULL OR (target_score >= 0 AND target_score <= 100));
  END IF;

  -- working_days
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='profiles' AND column_name='working_days') THEN
    ALTER TABLE profiles ADD COLUMN working_days text NOT NULL DEFAULT 'mon-fri';
  END IF;

  -- default_lecture_type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='profiles' AND column_name='default_lecture_type') THEN
    ALTER TABLE profiles ADD COLUMN default_lecture_type text NOT NULL DEFAULT 'theory'
      CHECK (default_lecture_type IN ('theory', 'practical', 'tutorial'));
  END IF;
END $$;
