import { z } from 'zod';

export const PERFORMANCE_TYPES = ['gpa', 'cgpa', 'percentage'] as const;
export type PerformanceType = (typeof PERFORMANCE_TYPES)[number];

export const PERFORMANCE_LABELS: Record<PerformanceType, string> = {
  gpa: 'GPA',
  cgpa: 'CGPA',
  percentage: 'Percentage',
};

export function performanceLabel(type?: string | null): string {
  if (type === 'gpa') return 'GPA';
  if (type === 'percentage') return 'Percentage';
  return 'CGPA';
}

export function performanceShortLabel(type?: string | null): string {
  return performanceLabel(type);
}

// Max score per performance type (GPA/CGPA out of 10, percentage out of 100)
export function maxScoreFor(type?: string | null): number {
  return type === 'percentage' ? 100 : 10;
}

// ─── Working days ───

export const WORKING_DAYS_PRESETS = ['mon-fri', 'mon-sat', 'sat-only', 'custom'] as const;
export type WorkingDaysPreset = (typeof WORKING_DAYS_PRESETS)[number];

export const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
export type WeekdayKey = (typeof WEEKDAY_KEYS)[number];

export const WEEKDAY_LABELS: Record<WeekdayKey, string> = {
  sun: 'Sun',
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
};

// Parse a stored working_days value into a set of weekday keys (0=Sun..6=Sat).
export function parseWorkingDays(value?: string | null): WeekdayKey[] {
  const v = (value || 'mon-fri').trim();
  if (v === 'mon-fri') return ['mon', 'tue', 'wed', 'thu', 'fri'];
  if (v === 'mon-sat') return ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  if (v === 'sat-only') return ['sat'];
  // custom: comma-separated weekday keys
  const parts = v.split(',').map((p) => p.trim()).filter(Boolean) as WeekdayKey[];
  return WEEKDAY_KEYS.filter((k) => parts.includes(k));
}

// Detect the preset for a given working_days value (for UI selection).
export function detectWorkingDaysPreset(value?: string | null): WorkingDaysPreset {
  const v = (value || 'mon-fri').trim();
  if (v === 'mon-fri' || v === 'mon-sat' || v === 'sat-only') return v;
  return 'custom';
}

// Serialize a list of weekday keys into the custom storage format.
export function serializeWorkingDays(days: WeekdayKey[]): string {
  const sorted = WEEKDAY_KEYS.filter((k) => days.includes(k));
  if (sorted.length === 5 && sorted.join(',') === 'mon,tue,wed,thu,fri') return 'mon-fri';
  if (sorted.length === 6 && sorted.join(',') === 'mon,tue,wed,thu,fri,sat') return 'mon-sat';
  if (sorted.length === 1 && sorted[0] === 'sat') return 'sat-only';
  return sorted.join(',');
}

export function workingDaysLabel(value?: string | null): string {
  const preset = detectWorkingDaysPreset(value);
  if (preset === 'mon-fri') return 'Monday–Friday';
  if (preset === 'mon-sat') return 'Monday–Saturday';
  if (preset === 'sat-only') return 'Saturday Only';
  const days = parseWorkingDays(value);
  if (days.length === 0) return 'None';
  return days.map((d) => WEEKDAY_LABELS[d]).join(', ');
}

// ─── Zod validation ───

const urlSchema = z
  .string()
  .trim()
  .refine(
    (v) => v === '' || /^https?:\/\/.+\..+/.test(v),
    'Enter a valid URL starting with http:// or https://',
  );

const phoneSchema = z
  .string()
  .trim()
  .refine(
    (v) => v === '' || /^[+]?[\d\s()-]{7,16}$/.test(v),
    'Enter a valid phone number',
  );

export const profileFormSchema = z.object({
  full_name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  college_name: z.string().trim().optional().or(z.literal('')),
  branch: z.string().trim().optional().or(z.literal('')),
  semester: z.coerce.number().int().min(1).max(12),
  academic_year: z.string().trim().optional().or(z.literal('')),
  attendance_goal: z.coerce.number().int().min(0, 'Must be 0–100').max(100, 'Must be 0–100'),
  roll_number: z.string().trim().optional().or(z.literal('')),
  degree: z.string().trim().min(1, 'Select a degree'),
  section: z.string().trim().optional().or(z.literal('')),
  batch_year: z.coerce.number().int().min(1900).max(2100).optional().or(z.literal('')),
  phone: phoneSchema.optional().or(z.literal('')),
  date_of_birth: z.string().optional().or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
  bio: z.string().optional().or(z.literal('')),
  linkedin_url: urlSchema.optional().or(z.literal('')),
  github_url: urlSchema.optional().or(z.literal('')),
  performance_type: z.enum(['gpa', 'cgpa', 'percentage']),
  current_score: z
    .union([z.number(), z.literal('')])
    .refine((v) => v === '' || (typeof v === 'number' && v >= 0 && v <= 100), 'Enter a valid score'),
  target_score: z
    .union([z.number(), z.literal('')])
    .refine((v) => v === '' || (typeof v === 'number' && v >= 0 && v <= 100), 'Enter a valid score'),
  working_days: z.string().min(1, 'Select working days'),
  default_lecture_type: z.enum(['theory', 'practical', 'tutorial']),
  guardian_name: z.string().trim().optional().or(z.literal('')),
  guardian_phone: phoneSchema.optional().or(z.literal('')),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function validateProfileForm(values: Record<string, any>): Record<string, string> {
  const result = profileFormSchema.safeParse(values);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as string;
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

// ─── Attendance validation ───

export const attendanceEntrySchema = z.object({
  subject_id: z.string().min(1, 'Select a subject'),
  date: z.string().min(1, 'Select a date'),
  status: z.enum(['present', 'absent', 'holiday', 'cancelled']),
  lecture_type: z.enum(['theory', 'practical', 'tutorial']),
  remarks: z.string().optional().or(z.literal('')),
});

export type AttendanceEntryValues = z.infer<typeof attendanceEntrySchema>;

export function validateAttendanceEntry(values: Record<string, any>): Record<string, string> {
  const result = attendanceEntrySchema.safeParse(values);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as string;
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

export function isFutureDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const today = new Date().toLocaleDateString('en-CA');
  return dateStr > today;
}
