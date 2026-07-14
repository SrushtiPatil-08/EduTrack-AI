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
    created_at: string;
    updated_at: string;
  }

  export interface AttendanceRecord {
    id: string;
    user_id: string;
    subject_id: string | null;
    date: string;
    status: 'present' | 'absent' | 'excused';
    notes: string | null;
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
  export function getDashboardData(userId: string): Promise<any>;
}
