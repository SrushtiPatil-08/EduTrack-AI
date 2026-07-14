/*
# EduTrack AI — Phase 2B: Smart Attendance & Dynamic Timetable

## Purpose
Extends the existing schema with semester management, dynamic timetable profiles,
timetable entries, attendance overrides, and calendar events.

## New Tables

1. **semesters** — Academic semesters created by the student.
   Fields: name, start_date, end_date, academic_year.

2. **timetable_profiles** — Switchable timetable variants (Mid Semester, Exam Week, etc.).
   Fields: name, is_active. Only one profile can be active at a time per user.

3. **timetable_entries** — Individual lecture slots within a timetable profile.
   Fields: profile_id FK, day_of_week (0-6), start_time, end_time, subject_id FK, room, faculty_name.

4. **attendance_overrides** — Per-date modifications to the default timetable.
   Fields: date, action (cancel/replace/add/remove), entry_id FK (nullable), replacement_subject_id FK (nullable).

5. **calendar_events** — Standalone calendar events (holidays, special days).
   Fields: title, date, type (holiday/event/exam/other).

## Altered Tables

- **subjects**: Added semester_id FK (nullable, SET NULL on delete) and attendance_goal column (default 75).
- **attendance**: Added timetable_entry_id FK (nullable, links to the specific lecture slot),
  and changed status constraint to include 'cancelled'.

## RLS
- All new tables have RLS enabled with 4 policies each (SELECT/INSERT/UPDATE/DELETE), scoped TO authenticated.
- Ownership via auth.uid() = user_id on all tables.
- All user_id columns default to auth.uid().

## Important Notes
1. semesters use ON DELETE SET NULL on subjects.semester_id so deleting a semester doesn't lose subjects.
2. timetable_profiles has a unique partial index on (user_id, is_active) WHERE is_active = true to enforce one active profile.
3. timetable_entries cascade on profile delete (deleting a profile removes its entries).
4. attendance_overrides link to a specific timetable_entry for cancel/replace actions, or are standalone for add actions.
5. The existing attendance table is extended, not recreated — existing data is preserved.
*/

-- ═══════════════════════════════════════════════════
-- 1. SEMESTERS
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS semesters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  start_date date,
  end_date date,
  academic_year text,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_semesters_user_id ON semesters(user_id);

ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_semesters" ON semesters;
CREATE POLICY "select_own_semesters" ON semesters FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_semesters" ON semesters;
CREATE POLICY "insert_own_semesters" ON semesters FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_semesters" ON semesters;
CREATE POLICY "update_own_semesters" ON semesters FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_semesters" ON semesters;
CREATE POLICY "delete_own_semesters" ON semesters FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════
-- 2. ALTER SUBJECTS — add semester_id + attendance_goal
-- ═══════════════════════════════════════════════════

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subjects' AND column_name = 'semester_id') THEN
    ALTER TABLE subjects ADD COLUMN semester_id uuid REFERENCES semesters(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subjects' AND column_name = 'attendance_goal') THEN
    ALTER TABLE subjects ADD COLUMN attendance_goal integer NOT NULL DEFAULT 75 CHECK (attendance_goal >= 0 AND attendance_goal <= 100);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_subjects_semester_id ON subjects(semester_id);

-- ═══════════════════════════════════════════════════
-- 3. TIMETABLE PROFILES
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS timetable_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_timetable_profiles_user_id ON timetable_profiles(user_id);

-- Ensure only one active profile per user
DROP INDEX IF EXISTS idx_timetable_profiles_active;
CREATE UNIQUE INDEX idx_timetable_profiles_active ON timetable_profiles(user_id) WHERE is_active = true;

ALTER TABLE timetable_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_timetable_profiles" ON timetable_profiles;
CREATE POLICY "select_own_timetable_profiles" ON timetable_profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_timetable_profiles" ON timetable_profiles;
CREATE POLICY "insert_own_timetable_profiles" ON timetable_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_timetable_profiles" ON timetable_profiles;
CREATE POLICY "update_own_timetable_profiles" ON timetable_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_timetable_profiles" ON timetable_profiles;
CREATE POLICY "delete_own_timetable_profiles" ON timetable_profiles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════
-- 4. TIMETABLE ENTRIES
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS timetable_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES timetable_profiles(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  room text,
  faculty_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_timetable_entries_user_id ON timetable_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_timetable_entries_profile_id ON timetable_entries(profile_id);
CREATE INDEX IF NOT EXISTS idx_timetable_entries_day ON timetable_entries(day_of_week);

ALTER TABLE timetable_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_timetable_entries" ON timetable_entries;
CREATE POLICY "select_own_timetable_entries" ON timetable_entries FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_timetable_entries" ON timetable_entries;
CREATE POLICY "insert_own_timetable_entries" ON timetable_entries FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_timetable_entries" ON timetable_entries;
CREATE POLICY "update_own_timetable_entries" ON timetable_entries FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_timetable_entries" ON timetable_entries;
CREATE POLICY "delete_own_timetable_entries" ON timetable_entries FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════
-- 5. ALTER ATTENDANCE — add timetable_entry_id + 'cancelled' status
-- ═══════════════════════════════════════════════════

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attendance' AND column_name = 'timetable_entry_id') THEN
    ALTER TABLE attendance ADD COLUMN timetable_entry_id uuid REFERENCES timetable_entries(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Drop old status constraint and add new one with 'cancelled'
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attendance_status_check') THEN
    ALTER TABLE attendance DROP CONSTRAINT attendance_status_check;
  END IF;
  ALTER TABLE attendance ADD CONSTRAINT attendance_status_check
    CHECK (status IN ('present', 'absent', 'excused', 'cancelled'));
END $$;

CREATE INDEX IF NOT EXISTS idx_attendance_timetable_entry_id ON attendance(timetable_entry_id);

-- ═══════════════════════════════════════════════════
-- 6. ATTENDANCE OVERRIDES
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS attendance_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  entry_id uuid REFERENCES timetable_entries(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('cancel', 'replace', 'add', 'remove')),
  replacement_subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attendance_overrides_user_id ON attendance_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_overrides_date ON attendance_overrides(date);

ALTER TABLE attendance_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_attendance_overrides" ON attendance_overrides;
CREATE POLICY "select_own_attendance_overrides" ON attendance_overrides FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_attendance_overrides" ON attendance_overrides;
CREATE POLICY "insert_own_attendance_overrides" ON attendance_overrides FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_attendance_overrides" ON attendance_overrides;
CREATE POLICY "update_own_attendance_overrides" ON attendance_overrides FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_attendance_overrides" ON attendance_overrides;
CREATE POLICY "delete_own_attendance_overrides" ON attendance_overrides FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════
-- 7. CALENDAR EVENTS
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  date date NOT NULL,
  type text NOT NULL DEFAULT 'event' CHECK (type IN ('holiday', 'event', 'exam', 'other')),
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(date);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_calendar_events" ON calendar_events;
CREATE POLICY "select_own_calendar_events" ON calendar_events FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_calendar_events" ON calendar_events;
CREATE POLICY "insert_own_calendar_events" ON calendar_events FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_calendar_events" ON calendar_events;
CREATE POLICY "update_own_calendar_events" ON calendar_events FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_calendar_events" ON calendar_events;
CREATE POLICY "delete_own_calendar_events" ON calendar_events FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════
-- TRIGGERS: updated_at for new tables
-- ═══════════════════════════════════════════════════

DROP TRIGGER IF EXISTS trg_semesters_updated_at ON semesters;
CREATE TRIGGER trg_semesters_updated_at BEFORE UPDATE ON semesters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_timetable_profiles_updated_at ON timetable_profiles;
CREATE TRIGGER trg_timetable_profiles_updated_at BEFORE UPDATE ON timetable_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_timetable_entries_updated_at ON timetable_entries;
CREATE TRIGGER trg_timetable_entries_updated_at BEFORE UPDATE ON timetable_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
