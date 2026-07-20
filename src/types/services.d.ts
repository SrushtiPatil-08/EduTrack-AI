declare module '@/services/auth' {
  export function signUpWithEmail(name: string, email: string, password: string): Promise<{ user?: any; session?: any; error?: string }>;
  export function signInWithEmail(email: string, password: string): Promise<{ user?: any; session?: any; error?: string }>;
  export function signOut(): Promise<{ error?: any }>;
  export function getSession(): Promise<{ session?: any; error?: any }>;
  export function getCurrentUser(): Promise<{ user?: any; error?: any }>;
  export function onAuthStateChange(callback: (session: any) => void): { unsubscribe: () => void };
}

declare module '@/services/supabase' {
  const supabase: any;
  export default supabase;
}

declare module '@/services/groq' {
  export function askGroq(prompt: string, context?: any): Promise<{ reply?: string; error?: string | null }>;
  export function parseTimetableImage(file: File): Promise<{ result?: any; error?: string | null }>;
}

declare module '@/services/resend' {
  export function sendEmail(opts: any): Promise<{ error?: string }>;
  export function sendBulkEmails(recipients: any[], template?: any): Promise<{ error?: string }>;
}

declare module '@/services/scanner' {
  export function startScan(): Promise<{ error?: string }>;
  export function processScanResult(data: any): Promise<{ error?: string }>;
}

declare module '@/services/analytics' {
  export function getOverview(): Promise<{ data?: any; error?: string | null }>;
  export function getAttendanceTrend(range?: string): Promise<{ data?: any; error?: string | null }>;
}

declare module '@/services/db' {
  export interface Profile {
    id: string;
    full_name: string;
    college_name: string | null;
    branch: string | null;
    semester: number | null;
    academic_year: string | null;
    attendance_goal: number;
    avatar_url: string | null;
    onboarding_completed: boolean;
    roll_number: string | null;
    degree: string | null;
    section: string | null;
    batch_year: number | null;
    phone: string | null;
    date_of_birth: string | null;
    gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
    bio: string | null;
    linkedin_url: string | null;
    github_url: string | null;
    current_cgpa: number | null;
    target_cgpa: number | null;
    guardian_name: string | null;
    guardian_phone: string | null;
    performance_type: 'gpa' | 'cgpa' | 'percentage';
    current_score: number | null;
    target_score: number | null;
    working_days: string;
    default_lecture_type: 'theory' | 'practical' | 'tutorial';
    created_at: string;
    updated_at: string;
  }

  export interface Subject {
    id: string;
    user_id: string;
    name: string;
    code: string | null;
    faculty_name: string | null;
    weekly_lectures: number;
    credits: number;
    type: 'theory' | 'practical' | 'lab';
    color: string;
    semester_id: string | null;
    attendance_goal: number | null;
    subject_code: string | null;
    semester: number | null;
    created_at: string;
    updated_at: string;
  }

  export interface AttendanceRecord {
    id: string;
    user_id: string;
    subject_id: string | null;
    date: string;
    status: 'present' | 'absent' | 'excused' | 'cancelled' | 'holiday';
    notes: string | null;
    timetable_entry_id: string | null;
    lecture_type: 'theory' | 'practical' | 'tutorial';
    remarks: string | null;
    created_at: string;
  }

  export interface Assignment {
    id: string;
    user_id: string;
    subject_id: string | null;
    title: string;
    description: string | null;
    due_date: string | null;
    status: 'pending' | 'completed' | 'overdue';
    priority: 'low' | 'medium' | 'high';
    created_at: string;
    updated_at: string;
    subjects?: { name: string } | null;
  }

  export interface Exam {
    id: string;
    user_id: string;
    subject_id: string | null;
    title: string;
    exam_date: string;
    total_marks: number | null;
    obtained_marks: number | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    subjects?: { name: string } | null;
  }

  export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string | null;
    type: 'info' | 'success' | 'warning' | 'error' | 'reminder';
    read: boolean;
    created_at: string;
  }

  export function getProfile(userId: string): Promise<{ profile?: Profile | null; error?: string }>;
  export function createProfile(userId: string, profileData: any): Promise<{ profile?: Profile; error?: string }>;
  export function updateProfile(userId: string, updates: any): Promise<{ profile?: Profile; error?: string }>;
  export function getSubjects(userId: string): Promise<{ subjects?: Subject[]; error?: string }>;
  export function createSubject(userId: string, subjectData: any): Promise<{ subject?: Subject; error?: string }>;
  export function updateSubject(subjectId: string, updates: any): Promise<{ subject?: Subject; error?: string }>;
  export function deleteSubject(subjectId: string): Promise<{ error?: string }>;
  export function getAttendance(userId: string, opts?: any): Promise<{ attendance?: AttendanceRecord[]; error?: string }>;
  export function createAttendance(userId: string, attendanceData: any): Promise<{ attendance?: AttendanceRecord; error?: string }>;
  export function updateAttendance(attendanceId: string, updates: any): Promise<{ attendance?: AttendanceRecord; error?: string }>;
  export function deleteAttendance(attendanceId: string): Promise<{ error?: string }>;
  export function getAssignments(userId: string, opts?: any): Promise<{ assignments?: Assignment[]; error?: string }>;
  export function createAssignment(userId: string, assignmentData: any): Promise<{ assignment?: Assignment; error?: string }>;
  export function updateAssignment(assignmentId: string, updates: any): Promise<{ assignment?: Assignment; error?: string }>;
  export function deleteAssignment(assignmentId: string): Promise<{ error?: string }>;
  export function getExams(userId: string, opts?: any): Promise<{ exams?: Exam[]; error?: string }>;
  export function createExam(userId: string, examData: any): Promise<{ exam?: Exam; error?: string }>;
  export function updateExam(examId: string, updates: any): Promise<{ exam?: Exam; error?: string }>;
  export function deleteExam(examId: string): Promise<{ error?: string }>;
  export function getNotifications(userId: string): Promise<{ notifications?: Notification[]; error?: string }>;
  export function createNotification(userId: string, notificationData: any): Promise<{ notification?: Notification; error?: string }>;
  export function markNotificationRead(notificationId: string): Promise<{ notification?: Notification; error?: string }>;
  export function deleteNotification(notificationId: string): Promise<{ error?: string }>;

  export interface Semester {
    id: string;
    user_id: string;
    name: string;
    start_date: string | null;
    end_date: string | null;
    academic_year: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }

  export interface TimetableProfile {
    id: string;
    user_id: string;
    name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }

  export interface TimetableEntry {
    id: string;
    user_id: string;
    profile_id: string;
    subject_id: string | null;
    day_of_week: number;
    start_time: string;
    end_time: string;
    room: string | null;
    faculty_name: string | null;
    created_at: string;
    updated_at: string;
    subjects?: { name: string; color: string } | null;
    attendanceStatus?: string | null;
    isOverride?: boolean;
  }

  export interface AttendanceOverride {
    id: string;
    user_id: string;
    date: string;
    entry_id: string | null;
    action: 'cancel' | 'replace' | 'add' | 'remove';
    replacement_subject_id: string | null;
    created_at: string;
  }

  export interface CalendarEvent {
    id: string;
    user_id: string;
    title: string;
    date: string;
    type: 'holiday' | 'event' | 'exam' | 'other';
    description: string | null;
    created_at: string;
  }

  export function getSemesters(userId: string): Promise<{ semesters?: Semester[]; error?: string }>;
  export function createSemester(userId: string, semesterData: any): Promise<{ semester?: Semester; error?: string }>;
  export function updateSemester(semesterId: string, updates: any): Promise<{ semester?: Semester; error?: string }>;
  export function deleteSemester(semesterId: string): Promise<{ error?: string }>;
  export function setActiveSemester(userId: string, semesterId: string): Promise<{ semester?: Semester; error?: string }>;
  export function getTimetableProfiles(userId: string): Promise<{ profiles?: TimetableProfile[]; error?: string }>;
  export function createTimetableProfile(userId: string, profileData: any): Promise<{ profile?: TimetableProfile; error?: string }>;
  export function updateTimetableProfile(profileId: string, updates: any): Promise<{ profile?: TimetableProfile; error?: string }>;
  export function deleteTimetableProfile(profileId: string): Promise<{ error?: string }>;
  export function setActiveTimetableProfile(userId: string, profileId: string): Promise<{ profile?: TimetableProfile; error?: string }>;
  export function duplicateTimetableProfile(userId: string, profileId: string, newName: string): Promise<{ profile?: TimetableProfile; error?: string }>;
  export function getTimetableEntries(userId: string, profileId?: string): Promise<{ entries?: TimetableEntry[]; error?: string }>;
  export function createTimetableEntry(userId: string, entryData: any): Promise<{ entry?: TimetableEntry; error?: string }>;
  export function updateTimetableEntry(entryId: string, updates: any): Promise<{ entry?: TimetableEntry; error?: string }>;
  export function deleteTimetableEntry(entryId: string): Promise<{ error?: string }>;
  export function getAttendanceOverrides(userId: string, opts?: any): Promise<{ overrides?: AttendanceOverride[]; error?: string }>;
  export function createAttendanceOverride(userId: string, overrideData: any): Promise<{ override?: AttendanceOverride; error?: string }>;
  export function deleteAttendanceOverride(overrideId: string): Promise<{ error?: string }>;
  export function getCalendarEvents(userId: string, opts?: any): Promise<{ events?: CalendarEvent[]; error?: string }>;
  export function createCalendarEvent(userId: string, eventData: any): Promise<{ event?: CalendarEvent; error?: string }>;
  export function deleteCalendarEvent(eventId: string): Promise<{ error?: string }>;
  export function calculateSubjectAttendance(attendance: AttendanceRecord[], subjectId: string, goal?: number): any;
  export function calculateOverallAttendance(attendance: AttendanceRecord[]): any;
  export function calculateTodaysAttendance(attendance: AttendanceRecord[]): any;
  export function calculateSubjectExtremes(attendance: AttendanceRecord[], subjects: Subject[], goal?: number): { best: any; weakest: any };
  export function calculateRiskSubjects(attendance: AttendanceRecord[], subjects: Subject[], goal?: number): any[];
  export function findDuplicateAttendance(attendance: AttendanceRecord[], subjectId: string, date: string, lectureType?: string): AttendanceRecord | undefined;
  export function calculateWeeklyAttendance(attendance: AttendanceRecord[]): any[];
  export function calculateMonthlyAttendance(attendance: AttendanceRecord[]): any[];
  export function generateAttendanceInsights(attendance: AttendanceRecord[], subjects: Subject[], goal?: number): any[];
  export function getDashboardData(userId: string): Promise<any>;
  export function getTodaysTimetable(userId: string): Promise<any>;
}
