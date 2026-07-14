import { supabase } from './supabase';

// ─── PROFILES ───

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) return { error: error.message };
  return { profile: data };
}

export async function createProfile(userId, profileData) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: userId, ...profileData, onboarding_completed: true })
    .select()
    .single();
  if (error) return { error: error.message };
  return { profile: data };
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) return { error: error.message };
  return { profile: data };
}

// ─── SUBJECTS ───

export async function getSubjects(userId) {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) return { error: error.message };
  return { subjects: data || [] };
}

export async function createSubject(userId, subjectData) {
  const { data, error } = await supabase
    .from('subjects')
    .insert({ user_id: userId, ...subjectData })
    .select()
    .single();
  if (error) return { error: error.message };
  return { subject: data };
}

export async function updateSubject(subjectId, updates) {
  const { data, error } = await supabase
    .from('subjects')
    .update(updates)
    .eq('id', subjectId)
    .select()
    .single();
  if (error) return { error: error.message };
  return { subject: data };
}

export async function deleteSubject(subjectId) {
  const { error } = await supabase
    .from('subjects')
    .delete()
    .eq('id', subjectId);
  if (error) return { error: error.message };
  return {};
}

// ─── ATTENDANCE ───

export async function getAttendance(userId, opts = {}) {
  let query = supabase.from('attendance').select('*').eq('user_id', userId);
  if (opts.subjectId) query = query.eq('subject_id', opts.subjectId);
  if (opts.startDate) query = query.gte('date', opts.startDate);
  if (opts.endDate) query = query.lte('date', opts.endDate);
  query = query.order('date', { ascending: false });
  const { data, error } = await query;
  if (error) return { error: error.message };
  return { attendance: data || [] };
}

export async function createAttendance(userId, attendanceData) {
  const { data, error } = await supabase
    .from('attendance')
    .insert({ user_id: userId, ...attendanceData })
    .select()
    .single();
  if (error) return { error: error.message };
  return { attendance: data };
}

export async function updateAttendance(attendanceId, updates) {
  const { data, error } = await supabase
    .from('attendance')
    .update(updates)
    .eq('id', attendanceId)
    .select()
    .single();
  if (error) return { error: error.message };
  return { attendance: data };
}

export async function deleteAttendance(attendanceId) {
  const { error } = await supabase
    .from('attendance')
    .delete()
    .eq('id', attendanceId);
  if (error) return { error: error.message };
  return {};
}

// ─── ASSIGNMENTS ───

export async function getAssignments(userId, opts = {}) {
  let query = supabase.from('assignments').select('*, subjects(name)').eq('user_id', userId);
  if (opts.status) query = query.eq('status', opts.status);
  query = query.order('due_date', { ascending: true, nullsFirst: false });
  const { data, error } = await query;
  if (error) return { error: error.message };
  return { assignments: data || [] };
}

export async function createAssignment(userId, assignmentData) {
  const { data, error } = await supabase
    .from('assignments')
    .insert({ user_id: userId, ...assignmentData })
    .select()
    .single();
  if (error) return { error: error.message };
  return { assignment: data };
}

export async function updateAssignment(assignmentId, updates) {
  const { data, error } = await supabase
    .from('assignments')
    .update(updates)
    .eq('id', assignmentId)
    .select()
    .single();
  if (error) return { error: error.message };
  return { assignment: data };
}

export async function deleteAssignment(assignmentId) {
  const { error } = await supabase
    .from('assignments')
    .delete()
    .eq('id', assignmentId);
  if (error) return { error: error.message };
  return {};
}

// ─── EXAMS ───

export async function getExams(userId, opts = {}) {
  let query = supabase.from('exams').select('*, subjects(name)').eq('user_id', userId);
  if (opts.upcomingOnly) query = query.gte('exam_date', new Date().toISOString().split('T')[0]);
  query = query.order('exam_date', { ascending: true });
  const { data, error } = await query;
  if (error) return { error: error.message };
  return { exams: data || [] };
}

export async function createExam(userId, examData) {
  const { data, error } = await supabase
    .from('exams')
    .insert({ user_id: userId, ...examData })
    .select()
    .single();
  if (error) return { error: error.message };
  return { exam: data };
}

export async function updateExam(examId, updates) {
  const { data, error } = await supabase
    .from('exams')
    .update(updates)
    .eq('id', examId)
    .select()
    .single();
  if (error) return { error: error.message };
  return { exam: data };
}

export async function deleteExam(examId) {
  const { error } = await supabase
    .from('exams')
    .delete()
    .eq('id', examId);
  if (error) return { error: error.message };
  return {};
}

// ─── NOTIFICATIONS ───

export async function getNotifications(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return { error: error.message };
  return { notifications: data || [] };
}

export async function createNotification(userId, notificationData) {
  const { data, error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, ...notificationData })
    .select()
    .single();
  if (error) return { error: error.message };
  return { notification: data };
}

export async function markNotificationRead(notificationId) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .select()
    .single();
  if (error) return { error: error.message };
  return { notification: data };
}

export async function deleteNotification(notificationId) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);
  if (error) return { error: error.message };
  return {};
}

// ─── DASHBOARD AGGREGATE ───

export async function getDashboardData(userId) {
  const [subjectsRes, attendanceRes, assignmentsRes, examsRes] = await Promise.all([
    getSubjects(userId),
    getAttendance(userId),
    getAssignments(userId),
    getExams(userId, { upcomingOnly: true }),
  ]);

  const subjects = subjectsRes.subjects || [];
  const attendance = attendanceRes.attendance || [];
  const assignments = assignmentsRes.assignments || [];
  const exams = examsRes.exams || [];

  // Attendance summary
  const present = attendance.filter((a) => a.status === 'present').length;
  const total = attendance.length;
  const attendancePct = total > 0 ? Math.round((present / total) * 100) : 0;

  // Assignment summary
  const pending = assignments.filter((a) => a.status === 'pending').length;
  const completed = assignments.filter((a) => a.status === 'completed').length;

  // Upcoming assignments (next 5)
  const upcomingAssignments = assignments
    .filter((a) => a.status === 'pending' && a.due_date)
    .slice(0, 5);

  // Upcoming exams (next 5)
  const upcomingExams = exams.slice(0, 5);

  return {
    subjects,
    attendance,
    assignments,
    exams,
    stats: {
      totalSubjects: subjects.length,
      attendancePct,
      totalClasses: total,
      pendingAssignments: pending,
      completedAssignments: completed,
      upcomingExams: exams.length,
    },
    upcomingAssignments,
    upcomingExams,
  };
}
