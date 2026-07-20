/*
# EduTrack AI — Sprint 1: Student Profile & Academic Setup

## Purpose
Extends the `profiles` table with richer academic identity fields so students
can capture a complete academic profile during onboarding and in Settings.
All additions are ADDITIVE — no existing column is dropped, renamed, or retyped,
so existing onboarding data and flows continue to work unchanged.

## Altered Table: profiles
New nullable columns (all optional, safe defaults):
- roll_number      text   — university/college roll or enrollment number
- degree           text   — degree program (e.g. B.Tech, M.Sc, BCA)
- section          text   — class section (e.g. A, B, CSE-1)
- batch_year       integer — admission/start year of the batch (e.g. 2023)
- phone            text   — contact phone number
- date_of_birth    date   — student date of birth
- gender           text   — gender; CHECK constrained to a fixed set + 'other'/'prefer_not_to_say'
- bio              text   — short personal/academic bio
- linkedin_url     text   — LinkedIn profile URL
- github_url      text   — GitHub profile URL
- current_cgpa     numeric(4,2) — current CGPA on a 0.00–10.00 scale
- target_cgpa     numeric(4,2) — target CGPA the student is aiming for
- guardian_name    text   — parent/guardian full name
- guardian_phone   text   — parent/guardian contact number

## Security
- No new tables; RLS is already enabled on `profiles` with 4 owner-scoped
  policies (select/insert/update/delete via `auth.uid() = id`). The new columns
  inherit those policies automatically — no policy changes needed.
- No new indexes required; `profiles` is a 1:1 row per user keyed by `id`.

## Important Notes
1. Every new column is nullable and has no NOT NULL constraint, so existing
   rows and existing onboarding inserts (which omit these fields) keep working.
2. `current_cgpa` / `target_cgpa` use numeric(4,2) to support both 4.00 and
   10.00 scales with two decimals; CHECK bounds allow 0.00–10.00.
3. `gender` is CHECK-constrained to a fixed set plus 'other' and
   'prefer_not_to_say' to keep values clean while remaining inclusive.
4. `batch_year` is a plain integer (not a date) — it represents the academic
   batch start year only.
5. The migration is idempotent: each column is added only if it does not
   already exist, so re-running is safe.
*/

-- Add new columns to profiles (all nullable, additive)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'roll_number') THEN
    ALTER TABLE profiles ADD COLUMN roll_number text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'degree') THEN
    ALTER TABLE profiles ADD COLUMN degree text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'section') THEN
    ALTER TABLE profiles ADD COLUMN section text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'batch_year') THEN
    ALTER TABLE profiles ADD COLUMN batch_year integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
    ALTER TABLE profiles ADD COLUMN phone text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'date_of_birth') THEN
    ALTER TABLE profiles ADD COLUMN date_of_birth date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'gender') THEN
    ALTER TABLE profiles ADD COLUMN gender text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
    ALTER TABLE profiles ADD COLUMN bio text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'linkedin_url') THEN
    ALTER TABLE profiles ADD COLUMN linkedin_url text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'github_url') THEN
    ALTER TABLE profiles ADD COLUMN github_url text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'current_cgpa') THEN
    ALTER TABLE profiles ADD COLUMN current_cgpa numeric(4,2) CHECK (current_cgpa IS NULL OR (current_cgpa >= 0 AND current_cgpa <= 10));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'target_cgpa') THEN
    ALTER TABLE profiles ADD COLUMN target_cgpa numeric(4,2) CHECK (target_cgpa IS NULL OR (target_cgpa >= 0 AND target_cgpa <= 10));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'guardian_name') THEN
    ALTER TABLE profiles ADD COLUMN guardian_name text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'guardian_phone') THEN
    ALTER TABLE profiles ADD COLUMN guardian_phone text;
  END IF;
END $$;

-- Add CHECK constraint on gender (drop first for idempotency)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_gender_check'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_gender_check
      CHECK (gender IS NULL OR gender IN ('male', 'female', 'other', 'prefer_not_to_say'));
  END IF;
END $$;
