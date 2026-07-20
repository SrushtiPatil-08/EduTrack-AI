import { supabase } from './supabase';

// Convert empty strings to null — prevents "invalid input syntax for type uuid: \"\""
function toNull(v) {
  if (v === '' || v === undefined) return null;
  return v;
}

// Guard: only run a query if the ID is a non-empty string
function validId(v) {
  return typeof v === 'string' && v.length > 0;
}

// Timezone-safe local date string (never uses toISOString)
function getLocalDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ─── PROFILES ───

export async function getProfile(userId) {
  if (!validId(userId)) return { error: 'Missing user ID' };
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) return { error: error.message };
  return { profile: data };
}

export async function createProfile(userId, profileData) {
  if (!validId(userId)) return { error: 'Missing user ID' };
  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: userId, ...profileData, onboarding_completed: true })
    .select()
    .single();
  if (error) return { error: error.message };
  return { profile: data };
}

export async function updateProfile(userId, updates) {
  if (!validId(userId)) return { error: 'Missing user ID' };
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
  if (!validId(userId)) return { error: 'Missing user ID' };
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) return { error: error.message };
  return { subjects: data || [] };
}

export async function createSubject(userId, subjectData) {
  if (!validId(userId)) return { error: 'Missing user ID' };
  const { data, error } = await supabase
    .from('subjects')
    .insert({ user_id: userId, ...subjectData, semester_id: toNull(subjectData.semester_id) })
    .select()
    .single();
  if (error) return { error: error.message };
  return { subject: data };
}

export async function updateSubject(subjectId, updates) {
  if (!validId(subjectId)) return { error: 'Missing subject ID' };
  const { data, error } = await supabase
    .from('subjects')
    .update({ ...updates, semester_id: toNull(updates.semester_id) })
    .eq('id', subjectId)
    .select()
    .single();
  if (error) return { error: error.message };
  return { subject: data };
}

export async function deleteSubject(subjectId) {
  if (!validId(subjectId)) return { error: 'Missing subject ID' };
  const { error } = await supabase
    .from('subjects')
    .delete()
    .eq('id', subjectId);
  if (error) return { error: error.message };
  return {};
}

// ─── ATTENDANCE ───

export async function getAttendance(userId, opts = {}) {
  if (!validId(userId)) return { error: 'Missing user ID' };
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
  if (!validId(userId)) return { error: 'Missing user ID' };
  const { data, error } = await supabase
    .from('attendance')
    .insert({ user_id: userId, ...attendanceData, subject_id: toNull(attendanceData.subject_id), timetable_entry_id: toNull(attendanceData.timetable_entry_id) })
    .select()
    .single();
  if (error) return { error: error.message };
  return { attendance: data };
}

export async function updateAttendance(attendanceId, updates) {
  if (!validId(attendanceId)) return { error: 'Missing attendance ID' };
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
  if (!validId(attendanceId)) return { error: 'Missing attendance ID' };
  const { error } = await supabase
    .from('attendance')
    .delete()
    .eq('id', attendanceId);
  if (error) return { error: error.message };
  return {};
}

// ─── ASSIGNMENTS ───

export async function getAssignments(userId, opts = {}) {
  if (!validId(userId)) return { error: 'Missing user ID' };
  let query = supabase.from('assignments').select('*, subjects(name)').eq('user_id', userId);
  if (opts.status) query = query.eq('status', opts.status);
  query = query.order('due_date', { ascending: true, nullsFirst: false });
  const { data, error } = await query;
  if (error) return { error: error.message };
  return { assignments: data || [] };
}

export async function createAssignment(userId, assignmentData) {
  if (!validId(userId)) return { error: 'Missing user ID' };
  const { data, error } = await supabase
    .from('assignments')
    .insert({ user_id: userId, ...assignmentData, subject_id: toNull(assignmentData.subject_id) })
    .select()
    .single();
  if (error) return { error: error.message };
  return { assignment: data };
}

export async function updateAssignment(assignmentId, updates) {
  if (!validId(assignmentId)) return { error: 'Missing assignment ID' };
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
  if (!validId(assignmentId)) return { error: 'Missing assignment ID' };
  const { error } = await supabase
    .from('assignments')
    .delete()
    .eq('id', assignmentId);
  if (error) return { error: error.message };
  return {};
}

// ─── EXAMS ───

export async function getExams(userId, opts = {}) {
  if (!validId(userId)) return { error: 'Missing user ID' };
  let query = supabase.from('exams').select('*, subjects(name)').eq('user_id', userId);
  if (opts.upcomingOnly) query = query.gte('exam_date', getLocalDateString());
  query = query.order('exam_date', { ascending: true });
  const { data, error } = await query;
  if (error) return { error: error.message };
  return { exams: data || [] };
}

export async function createExam(userId, examData) {
  if (!validId(userId)) return { error: 'Missing user ID' };
  const { data, error } = await supabase
    .from('exams')
    .insert({ user_id: userId, ...examData, subject_id: toNull(examData.subject_id) })
    .select()
    .single();
  if (error) return { error: error.message };
  return { exam: data };
}

export async function updateExam(examId, updates) {
  if (!validId(examId)) return { error: 'Missing exam ID' };
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
  if (!validId(examId)) return { error: 'Missing exam ID' };
  const { error } = await supabase
    .from('exams')
    .delete()
    .eq('id', examId);
  if (error) return { error: error.message };
  return {};
}

// ─── NOTIFICATIONS ───

export async function getNotifications(userId) {
  if (!validId(userId)) return { error: 'Missing user ID' };
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return { error: error.message };
  return { notifications: data || [] };
}

export async function createNotification(userId, notificationData) {
  if (!validId(userId)) return { error: 'Missing user ID' };
  const { data, error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, ...notificationData })
    .select()
    .single();
  if (error) return { error: error.message };
  return { notification: data };
}

export async function markNotificationRead(notificationId) {
  if (!validId(notificationId)) return { error: 'Missing notification ID' };
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
  if (!validId(notificationId)) return { error: 'Missing notification ID' };
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);
  if (error) return { error: error.message };
  return {};
}

// ─── SEMESTERS ───

export async function getSemesters(userId) {
  if (!validId(userId)) return { error: 'Missing user ID' };
  const { data, error } = await supabase
    .from('semesters')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) return { error: error.message };
  return { semesters: data || [] };
}

export async function createSemester(userId, semesterData) {
  if (!validId(userId)) return { error: 'Missing user ID' };
  const { data, error } = await supabase
    .from('semesters')
    .insert({ user_id: userId, ...semesterData })
    .select()
    .single();
  if (error) return { error: error.message };
  return { semester: data };
}

export async function updateSemester(semesterId, updates) {
  if (!validId(semesterId)) return { error: 'Missing semester ID' };
  const { data, error } = await supabase
    .from('semesters')
    .update(updates)
    .eq('id', semesterId)
    .select()
    .single();
  if (error) return { error: error.message };
  return { semester: data };
}

export async function deleteSemester(semesterId) {
  if (!validId(semesterId)) return { error: 'Missing semester ID' };
  const { error } = await supabase
    .from('semesters')
    .delete()
    .eq('id', semesterId);
  if (error) return { error: error.message };
  return {};
}

export async function setActiveSemester(userId, semesterId) {
  if (!validId(userId) || !validId(semesterId)) return { error: 'Missing ID' };
  // First, deactivate all semesters for this user
  await supabase
    .from('semesters')
    .update({ is_active: false })
    .eq('user_id', userId);
  // Then activate the selected one
  const { data, error } = await supabase
    .from('semesters')
    .update({ is_active: true })
    .eq('id', semesterId)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) return { error: error.message };
  return { semester: data };
}

// ─── TIMETABLE PROFILES ───

export async function getTimetableProfiles(userId) {
  if (!validId(userId)) return { error: 'Missing user ID' };
  const { data, error } = await supabase
    .from('timetable_profiles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) return { error: error.message };
  return { profiles: data || [] };
}

export async function createTimetableProfile(userId, profileData) {
  if (!validId(userId)) return { error: 'Missing user ID' };
  const { data, error } = await supabase
    .from('timetable_profiles')
    .insert({ user_id: userId, ...profileData })
    .select()
    .single();
  if (error) return { error: error.message };
  return { profile: data };
}

export async function updateTimetableProfile(profileId, updates) {
  if (!validId(profileId)) return { error: 'Missing profile ID' };
  const { data, error } = await supabase
    .from('timetable_profiles')
    .update(updates)
    .eq('id', profileId)
    .select()
    .single();
  if (error) return { error: error.message };
  return { profile: data };
}

export async function deleteTimetableProfile(profileId) {
  if (!validId(profileId)) return { error: 'Missing profile ID' };
  const { error } = await supabase
    .from('timetable_profiles')
    .delete()
    .eq('id', profileId);
  if (error) return { error: error.message };
  return {};
}

export async function setActiveTimetableProfile(userId, profileId) {
  if (!validId(userId) || !validId(profileId)) return { error: 'Missing ID' };
  // Deactivate all profiles for this user
  await supabase
    .from('timetable_profiles')
    .update({ is_active: false })
    .eq('user_id', userId);
  // Activate the selected one
  const { data, error } = await supabase
    .from('timetable_profiles')
    .update({ is_active: true })
    .eq('id', profileId)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) return { error: error.message };
  return { profile: data };
}

export async function duplicateTimetableProfile(userId, profileId, newName) {
  if (!validId(userId) || !validId(profileId)) return { error: 'Missing ID' };
  // Fetch the original profile and its entries
  const { data: profile } = await supabase
    .from('timetable_profiles')
    .select('*')
    .eq('id', profileId)
    .single();
  if (!profile) return { error: 'Profile not found' };

  const { data: entries } = await supabase
    .from('timetable_entries')
    .select('*')
    .eq('profile_id', profileId);

  // Create the new profile
  const { data: newProfile, error: profErr } = await supabase
    .from('timetable_profiles')
    .insert({ user_id: userId, name: newName || `${profile.name} (Copy)` })
    .select()
    .single();
  if (profErr) return { error: profErr.message };

  // Copy entries
  if (entries && entries.length > 0) {
    const newEntries = entries.map((e) => ({
      user_id: userId,
      profile_id: newProfile.id,
      subject_id: e.subject_id,
      day_of_week: e.day_of_week,
      start_time: e.start_time,
      end_time: e.end_time,
      room: e.room,
      faculty_name: e.faculty_name,
    }));
    await supabase.from('timetable_entries').insert(newEntries);
  }

  return { profile: newProfile };
}

// ─── TIMETABLE ENTRIES ───

export async function getTimetableEntries(userId, profileId) {
  if (!validId(userId)) return { error: 'Missing user ID' };
  let query = supabase.from('timetable_entries').select('*, subjects(name,color)').eq('user_id', userId);
  if (profileId) query = query.eq('profile_id', profileId);
  query = query.order('day_of_week', { ascending: true }).order('start_time', { ascending: true });
  const { data, error } = await query;
  if (error) return { error: error.message };
  return { entries: data || [] };
}

export async function createTimetableEntry(userId, entryData) {
  if (!validId(userId)) return { error: 'Missing user ID' };
  const { data, error } = await supabase
    .from('timetable_entries')
    .insert({ user_id: userId, ...entryData, subject_id: toNull(entryData.subject_id) })
    .select()
    .single();
  if (error) return { error: error.message };
  return { entry: data };
}

export async function updateTimetableEntry(entryId, updates) {
  if (!validId(entryId)) return { error: 'Missing entry ID' };
  const { data, error } = await supabase
    .from('timetable_entries')
    .update(updates)
    .eq('id', entryId)
    .select()
    .single();
  if (error) return { error: error.message };
  return { entry: data };
}

export async function deleteTimetableEntry(entryId) {
  if (!validId(entryId)) return { error: 'Missing entry ID' };
  const { error } = await supabase
    .from('timetable_entries')
    .delete()
    .eq('id', entryId);
  if (error) return { error: error.message };
  return {};
}

// ─── ATTENDANCE OVERRIDES ───

export async function getAttendanceOverrides(userId, opts = {}) {
  if (!validId(userId)) return { error: 'Missing user ID' };
  let query = supabase.from('attendance_overrides').select('*').eq('user_id', userId);
  if (opts.date) query = query.eq('date', opts.date);
  if (opts.startDate) query = query.gte('date', opts.startDate);
  if (opts.endDate) query = query.lte('date', opts.endDate);
  query = query.order('date', { ascending: false });
  const { data, error } = await query;
  if (error) return { error: error.message };
  return { overrides: data || [] };
}

export async function createAttendanceOverride(userId, overrideData) {
  if (!validId(userId)) return { error: 'Missing user ID' };
  const { data, error } = await supabase
    .from('attendance_overrides')
    .insert({ user_id: userId, ...overrideData, entry_id: toNull(overrideData.entry_id), replacement_subject_id: toNull(overrideData.replacement_subject_id) })
    .select()
    .single();
  if (error) return { error: error.message };
  return { override: data };
}

export async function deleteAttendanceOverride(overrideId) {
  if (!validId(overrideId)) return { error: 'Missing override ID' };
  const { error } = await supabase
    .from('attendance_overrides')
    .delete()
    .eq('id', overrideId);
  if (error) return { error: error.message };
  return {};
}

// ─── CALENDAR EVENTS ───

export async function getCalendarEvents(userId, opts = {}) {
  if (!validId(userId)) return { error: 'Missing user ID' };
  let query = supabase.from('calendar_events').select('*').eq('user_id', userId);
  if (opts.startDate) query = query.gte('date', opts.startDate);
  if (opts.endDate) query = query.lte('date', opts.endDate);
  query = query.order('date', { ascending: true });
  const { data, error } = await query;
  if (error) return { error: error.message };
  return { events: data || [] };
}

export async function createCalendarEvent(userId, eventData) {
  if (!validId(userId)) return { error: 'Missing user ID' };
  const { data, error } = await supabase
    .from('calendar_events')
    .insert({ user_id: userId, ...eventData })
    .select()
    .single();
  if (error) return { error: error.message };
  return { event: data };
}

export async function deleteCalendarEvent(eventId) {
  if (!validId(eventId)) return { error: 'Missing event ID' };
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', eventId);
  if (error) return { error: error.message };
  return {};
}

// ─── ATTENDANCE CALCULATION HELPERS ───

// Calculate attendance for a single subject
export function calculateSubjectAttendance(attendance, subjectId, goal = 75) {
  const records = attendance.filter((a) => a.subject_id === subjectId);
  const present = records.filter((a) => a.status === 'present').length;
  const absent = records.filter((a) => a.status === 'absent').length;
  const cancelled = records.filter((a) => a.status === 'cancelled').length;
  const holiday = records.filter((a) => a.status === 'holiday').length;
  const excused = records.filter((a) => a.status === 'excused').length;
  const conducted = present + absent; // cancelled, holiday & excused don't count
  const total = conducted + cancelled + holiday + excused;
  const pct = conducted > 0 ? Math.round((present / conducted) * 100) : 0;

  // Safe bunks: how many consecutive absences before dropping below goal
  let safeBunks = 0;
  if (conducted > 0) {
    safeBunks = Math.floor((present * 100) / goal - conducted);
    if (safeBunks < 0) safeBunks = 0;
  }

  // Remaining bunks: alias of safeBunks (lectures you can still miss safely)
  const remainingBunks = safeBunks;

  // Lectures required: consecutive present lectures needed to reach goal
  let lecturesRequired = 0;
  if (pct < goal && conducted > 0) {
    lecturesRequired = Math.ceil((goal * conducted - 100 * present) / (100 - goal));
    if (lecturesRequired < 0) lecturesRequired = 0;
  }

  // Goal progress (0-100)
  const goalProgress = goal > 0 ? Math.min(100, Math.round((pct / goal) * 100)) : 0;

  return {
    present, absent, cancelled, holiday, excused, conducted, total,
    pct, safeBunks, remainingBunks, lecturesRequired, goal, goalProgress,
    // Backward-compatible aliases
    safeLeaves: safeBunks,
    lecturesNeeded: lecturesRequired,
  };
}

// Calculate overall attendance
export function calculateOverallAttendance(attendance) {
  const present = attendance.filter((a) => a.status === 'present').length;
  const absent = attendance.filter((a) => a.status === 'absent').length;
  const cancelled = attendance.filter((a) => a.status === 'cancelled').length;
  const holiday = attendance.filter((a) => a.status === 'holiday').length;
  const conducted = present + absent;
  const total = attendance.length;
  const pct = conducted > 0 ? Math.round((present / conducted) * 100) : 0;
  return { present, absent, cancelled, holiday, conducted, total, pct };
}

// Today's attendance summary
export function calculateTodaysAttendance(attendance) {
  const today = getLocalDateString();
  const todayRecords = attendance.filter((a) => a.date === today);
  const present = todayRecords.filter((a) => a.status === 'present').length;
  const absent = todayRecords.filter((a) => a.status === 'absent').length;
  const cancelled = todayRecords.filter((a) => a.status === 'cancelled').length;
  const holiday = todayRecords.filter((a) => a.status === 'holiday').length;
  const conducted = present + absent;
  const pct = conducted > 0 ? Math.round((present / conducted) * 100) : 0;
  const pending = 0; // computed by caller against timetable if desired
  return { present, absent, cancelled, holiday, conducted, pct, pending, records: todayRecords };
}

// Best and weakest subjects by attendance %
export function calculateSubjectExtremes(attendance, subjects, goal = 75) {
  if (subjects.length === 0) return { best: null, weakest: null };
  let best = null;
  let weakest = null;
  for (const s of subjects) {
    const stats = calculateSubjectAttendance(attendance, s.id, s.attendance_goal || goal);
    if (stats.conducted === 0) continue;
    if (!best || stats.pct > best.pct) best = { ...s, ...stats };
    if (!weakest || stats.pct < weakest.pct) weakest = { ...s, ...stats };
  }
  return { best, weakest };
}

// Upcoming risk subjects: below goal and close to a critical threshold
export function calculateRiskSubjects(attendance, subjects, goal = 75) {
  const risks = [];
  for (const s of subjects) {
    const stats = calculateSubjectAttendance(attendance, s.id, s.attendance_goal || goal);
    if (stats.conducted === 0) continue;
    const subjectGoal = s.attendance_goal || goal;
    if (stats.pct < subjectGoal) {
      risks.push({
        ...s,
        ...stats,
        deficit: subjectGoal - stats.pct,
        lecturesRequired: stats.lecturesRequired,
      });
    }
  }
  return risks.sort((a, b) => b.deficit - a.deficit);
}

// Check for duplicate attendance (same subject + date + lecture_type)
export function findDuplicateAttendance(attendance, subjectId, date, lectureType) {
  return attendance.find(
    (a) => a.subject_id === subjectId && a.date === date && (a.lecture_type || 'theory') === (lectureType || 'theory'),
  );
}

// Calculate weekly attendance data for charts
export function calculateWeeklyAttendance(attendance) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateString(d);
    const dayRecords = attendance.filter((a) => a.date === dateStr);
    const present = dayRecords.filter((a) => a.status === 'present').length;
    const conducted = dayRecords.filter((a) => a.status === 'present' || a.status === 'absent').length;
    const pct = conducted > 0 ? Math.round((present / conducted) * 100) : 0;
    result.push({ day: days[d.getDay()], value: pct });
  }
  return result;
}

// Calculate monthly attendance data for charts
export function calculateMonthlyAttendance(attendance) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = new Date();
  const result = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthStr = String(d.getMonth() + 1).padStart(2, '0');
    const yearStr = String(d.getFullYear());
    const monthPrefix = `${yearStr}-${monthStr}`;
    const monthRecords = attendance.filter((a) => a.date && a.date.startsWith(monthPrefix));
    const present = monthRecords.filter((a) => a.status === 'present').length;
    const conducted = monthRecords.filter((a) => a.status === 'present' || a.status === 'absent').length;
    const pct = conducted > 0 ? Math.round((present / conducted) * 100) : 0;
    result.push({ month: months[d.getMonth()], value: pct });
  }
  return result;
}

// Generate smart AI insights from attendance data
export function generateAttendanceInsights(attendance, subjects, goal = 75) {
  const insights = [];
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  // Overall attendance
  const overall = calculateOverallAttendance(attendance);
  if (overall.conducted > 0) {
    if (overall.pct < goal) {
      insights.push({
        type: 'warning',
        title: 'Overall attendance below goal',
        message: `Your overall attendance is ${overall.pct}%, which is below your goal of ${goal}%. Attend the next few classes consistently to improve.`,
      });
    } else {
      insights.push({
        type: 'success',
        title: 'Overall attendance is healthy',
        message: `Your overall attendance is ${overall.pct}%, which meets your goal of ${goal}%. Keep it up!`,
      });
    }
  }

  // Per-subject insights
  for (const subject of subjects) {
    const stats = calculateSubjectAttendance(attendance, subject.id, subject.attendance_goal || goal);
    if (stats.conducted === 0) continue;

    if (stats.pct < (subject.attendance_goal || goal)) {
      insights.push({
        type: 'warning',
        title: `${subject.name} attendance is below your goal`,
        message: `Current: ${stats.pct}%. You need to attend ${stats.lecturesNeeded} more consecutive lecture${stats.lecturesNeeded !== 1 ? 's' : ''} to reach ${(subject.attendance_goal || goal)}%.`,
      });
    } else {
      insights.push({
        type: 'success',
        title: `${subject.name} attendance is healthy`,
        message: `Current: ${stats.pct}%. You can safely miss ${stats.safeLeaves} lecture${stats.safeLeaves !== 1 ? 's' : ''}.`,
      });
    }
  }

  return insights;
}

// ─── DASHBOARD AGGREGATE ───

export async function getDashboardData(userId) {
  if (!validId(userId)) return { error: 'Missing user ID' };
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

  // Attendance summary (cancelled excluded)
  const overall = calculateOverallAttendance(attendance);

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
      attendancePct: overall.pct,
      totalClasses: overall.conducted,
      pendingAssignments: pending,
      completedAssignments: completed,
      upcomingExams: exams.length,
    },
    upcomingAssignments,
    upcomingExams,
  };
}

// ─── TODAY'S TIMETABLE ───

export async function getTodaysTimetable(userId) {
  if (!validId(userId)) return { error: 'Missing user ID' };
  // Get active timetable profile
  const { data: profile } = await supabase
    .from('timetable_profiles')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  if (!profile) return { entries: [], overrides: [] };

  const dayOfWeek = new Date().getDay();
  const today = getLocalDateString();

  // Get today's entries
  const { data: entries, error: entriesErr } = await supabase
    .from('timetable_entries')
    .select('*, subjects(name,color)')
    .eq('user_id', userId)
    .eq('profile_id', profile.id)
    .eq('day_of_week', dayOfWeek)
    .order('start_time', { ascending: true });

  if (entriesErr) return { error: entriesErr.message };

  // Get today's overrides
  const { data: overrides } = await supabase
    .from('attendance_overrides')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today);

  // Get today's attendance records
  const { data: attendanceRecords } = await supabase
    .from('attendance')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today);

  // Apply overrides
  let result = [...(entries || [])];
  const overrideList = overrides || [];

  // Remove cancelled entries
  result = result.filter((entry) => {
    const cancelOverride = overrideList.find(
      (o) => o.entry_id === entry.id && o.action === 'cancel'
    );
    return !cancelOverride;
  });

  // Apply replacements
  for (const override of overrideList) {
    if (override.action === 'replace' && override.entry_id) {
      const idx = result.findIndex((e) => e.id === override.entry_id);
      if (idx >= 0 && override.replacement_subject_id) {
        const { data: newSubject } = await supabase
          .from('subjects')
          .select('name,color')
          .eq('id', override.replacement_subject_id)
          .single();
        result[idx] = { ...result[idx], subject_id: override.replacement_subject_id, subjects: newSubject };
      }
    }
  }

  // Add extra lectures
  for (const override of overrideList) {
    if (override.action === 'add' && override.replacement_subject_id) {
      const { data: newSubject } = await supabase
        .from('subjects')
        .select('name,color')
        .eq('id', override.replacement_subject_id)
        .single();
      result.push({
        id: override.id,
        subject_id: override.replacement_subject_id,
        subjects: newSubject,
        start_time: '00:00',
        end_time: '00:00',
        room: null,
        faculty_name: null,
        isOverride: true,
      });
    }
  }

  // Attach attendance status
  const attMap = new Map((attendanceRecords || []).map((a) => [a.timetable_entry_id || a.subject_id, a.status]));
  result = result.map((entry) => ({
    ...entry,
    attendanceStatus: attMap.get(entry.id) || attMap.get(entry.subject_id) || null,
  }));

  return { entries: result, overrides: overrideList };
}
