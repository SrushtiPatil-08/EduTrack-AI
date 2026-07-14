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

// ─── SEMESTERS ───

export async function getSemesters(userId) {
  const { data, error } = await supabase
    .from('semesters')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) return { error: error.message };
  return { semesters: data || [] };
}

export async function createSemester(userId, semesterData) {
  const { data, error } = await supabase
    .from('semesters')
    .insert({ user_id: userId, ...semesterData })
    .select()
    .single();
  if (error) return { error: error.message };
  return { semester: data };
}

export async function updateSemester(semesterId, updates) {
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
  const { error } = await supabase
    .from('semesters')
    .delete()
    .eq('id', semesterId);
  if (error) return { error: error.message };
  return {};
}

export async function setActiveSemester(userId, semesterId) {
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
  const { data, error } = await supabase
    .from('timetable_profiles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) return { error: error.message };
  return { profiles: data || [] };
}

export async function createTimetableProfile(userId, profileData) {
  const { data, error } = await supabase
    .from('timetable_profiles')
    .insert({ user_id: userId, ...profileData })
    .select()
    .single();
  if (error) return { error: error.message };
  return { profile: data };
}

export async function updateTimetableProfile(profileId, updates) {
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
  const { error } = await supabase
    .from('timetable_profiles')
    .delete()
    .eq('id', profileId);
  if (error) return { error: error.message };
  return {};
}

export async function setActiveTimetableProfile(userId, profileId) {
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
  let query = supabase.from('timetable_entries').select('*, subjects(name,color)').eq('user_id', userId);
  if (profileId) query = query.eq('profile_id', profileId);
  query = query.order('day_of_week', { ascending: true }).order('start_time', { ascending: true });
  const { data, error } = await query;
  if (error) return { error: error.message };
  return { entries: data || [] };
}

export async function createTimetableEntry(userId, entryData) {
  const { data, error } = await supabase
    .from('timetable_entries')
    .insert({ user_id: userId, ...entryData })
    .select()
    .single();
  if (error) return { error: error.message };
  return { entry: data };
}

export async function updateTimetableEntry(entryId, updates) {
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
  const { error } = await supabase
    .from('timetable_entries')
    .delete()
    .eq('id', entryId);
  if (error) return { error: error.message };
  return {};
}

// ─── ATTENDANCE OVERRIDES ───

export async function getAttendanceOverrides(userId, opts = {}) {
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
  const { data, error } = await supabase
    .from('attendance_overrides')
    .insert({ user_id: userId, ...overrideData })
    .select()
    .single();
  if (error) return { error: error.message };
  return { override: data };
}

export async function deleteAttendanceOverride(overrideId) {
  const { error } = await supabase
    .from('attendance_overrides')
    .delete()
    .eq('id', overrideId);
  if (error) return { error: error.message };
  return {};
}

// ─── CALENDAR EVENTS ───

export async function getCalendarEvents(userId, opts = {}) {
  let query = supabase.from('calendar_events').select('*').eq('user_id', userId);
  if (opts.startDate) query = query.gte('date', opts.startDate);
  if (opts.endDate) query = query.lte('date', opts.endDate);
  query = query.order('date', { ascending: true });
  const { data, error } = await query;
  if (error) return { error: error.message };
  return { events: data || [] };
}

export async function createCalendarEvent(userId, eventData) {
  const { data, error } = await supabase
    .from('calendar_events')
    .insert({ user_id: userId, ...eventData })
    .select()
    .single();
  if (error) return { error: error.message };
  return { event: data };
}

export async function deleteCalendarEvent(eventId) {
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
  const excused = records.filter((a) => a.status === 'excused').length;
  const conducted = present + absent; // cancelled & excused don't count
  const pct = conducted > 0 ? Math.round((present / conducted) * 100) : 0;

  // Calculate safe leaves: how many consecutive absences before dropping below goal
  // (present / (conducted + x)) >= goal/100 => x <= present/goal - conducted
  let safeLeaves = 0;
  if (conducted > 0) {
    safeLeaves = Math.floor((present * 100) / goal - conducted);
    if (safeLeaves < 0) safeLeaves = 0;
  }

  // Calculate lectures needed to reach goal
  // Need: present + y / (conducted + y) >= goal/100 => y >= (goal*conducted - 100*present) / (100 - goal)
  let lecturesNeeded = 0;
  if (pct < goal && conducted > 0) {
    lecturesNeeded = Math.ceil((goal * conducted - 100 * present) / (100 - goal));
    if (lecturesNeeded < 0) lecturesNeeded = 0;
  }

  return { present, absent, cancelled, excused, conducted, pct, safeLeaves, lecturesNeeded, goal };
}

// Calculate overall attendance
export function calculateOverallAttendance(attendance) {
  const present = attendance.filter((a) => a.status === 'present').length;
  const absent = attendance.filter((a) => a.status === 'absent').length;
  const cancelled = attendance.filter((a) => a.status === 'cancelled').length;
  const conducted = present + absent;
  const pct = conducted > 0 ? Math.round((present / conducted) * 100) : 0;
  return { present, absent, cancelled, conducted, pct };
}

// Calculate weekly attendance data for charts
export function calculateWeeklyAttendance(attendance) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
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
  // Get active timetable profile
  const { data: profile } = await supabase
    .from('timetable_profiles')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  if (!profile) return { entries: [], overrides: [] };

  const dayOfWeek = new Date().getDay();
  const today = new Date().toISOString().split('T')[0];

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
