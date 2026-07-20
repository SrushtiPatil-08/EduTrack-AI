/*
# Sprint 2 — Attendance Module Schema (Additive)

## Purpose
Extends the existing `subjects` and `attendance` tables to support the full
attendance management module: lecture types, remarks, holiday status, and
subject metadata used by subject cards and analytics.

## Changes to `subjects` (additive)
1. `subject_code` text — alias-friendly code column (existing `code` stays).
   Added so the subject-card UI can read `subject_code` directly; the app keeps
   `code` and `subject_code` in sync.
2. `semester` integer — the semester number this subject belongs to (the
   existing `semester_id` FK to the `semesters` table is retained for the
   multi-semester planner; this plain int mirrors the profile's semester for
   quick display).

## Changes to `attendance` (additive)
3. `lecture_type` text — one of 'theory', 'practical', 'tutorial'. Default
   'theory'. Lets a single subject track theory, practical, and tutorial
   sessions separately.
4. `remarks` text — free-text note per attendance record (distinct from the
   existing `notes` column, which is retained for backward compatibility).

## Status constraint update
5. The `attendance.status` CHECK is replaced (drop + re-add) to include
   'holiday' alongside present / absent / cancelled / excused. The drop is safe
   because the constraint is named `attendance_status_check`.

## Security
- No new tables; RLS already enabled. Existing owner-scoped policies cover the
  new columns.

## Important Notes
1. Purely additive on `subjects` and `attendance` — no data loss.
2. The status CHECK is dropped and recreated with the expanded value set; all
   existing rows already satisfy the new constraint.
3. Idempotent: column adds are guarded with IF NOT EXISTS; the CHECK is dropped
   before re-creation.
*/

DO $$
BEGIN
  -- subjects.subject_code
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='subjects' AND column_name='subject_code') THEN
    ALTER TABLE subjects ADD COLUMN subject_code text;
  END IF;

  -- subjects.semester (int)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='subjects' AND column_name='semester') THEN
    ALTER TABLE subjects ADD COLUMN semester integer;
  END IF;

  -- attendance.lecture_type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='attendance' AND column_name='lecture_type') THEN
    ALTER TABLE attendance ADD COLUMN lecture_type text NOT NULL DEFAULT 'theory'
      CHECK (lecture_type IN ('theory', 'practical', 'tutorial'));
  END IF;

  -- attendance.remarks
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='attendance' AND column_name='remarks') THEN
    ALTER TABLE attendance ADD COLUMN remarks text;
  END IF;
END $$;

-- Expand attendance.status CHECK to include 'holiday'
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_status_check;
ALTER TABLE attendance ADD CONSTRAINT attendance_status_check
  CHECK (status IN ('present', 'absent', 'excused', 'cancelled', 'holiday'));
