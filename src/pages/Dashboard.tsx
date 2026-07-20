import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarCheck, ClipboardList, BarChart3, Sparkles, ScanLine, ArrowRight, Clock, TrendingUp, BookOpen, Plus, Target, GraduationCap, Hash, Award, CalendarClock, Building2, User } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { fadeInUp, staggerContainer, REPLAY_VIEWPORT } from '@/components/motion';
import { cn } from '@/lib/utils';
import { getDashboardData, getTodaysTimetable, getAttendance, getSubjects, calculateOverallAttendance, calculateTodaysAttendance, calculateSubjectExtremes, calculateRiskSubjects, calculateWeeklyAttendance } from '@/services/db';
import type { TimetableEntry, AttendanceRecord, Subject } from '@/services/db';
import { performanceLabel, workingDaysLabel } from '@/lib/profile';
import { AttendanceChart } from '@/components/Charts';
import Reminders from '@/components/Reminders';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [data, setData] = useState<any>(null);
  const [todaysClasses, setTodaysClasses] = useState<TimetableEntry[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const [result, ttRes, attRes, subRes] = await Promise.all([
      getDashboardData(user.id),
      getTodaysTimetable(user.id),
      getAttendance(user.id),
      getSubjects(user.id),
    ]);
    setData(result);
    setTodaysClasses(ttRes.entries || []);
    if (attRes.attendance) setAttendance(attRes.attendance as AttendanceRecord[] || []);
    if (subRes.subjects) setSubjects(subRes.subjects as Subject[] || []);
    setError(null);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const firstName = profile?.full_name?.split(' ')[0] || user?.name?.split(' ')[0] || 'there';
  const stats = data?.stats || {
    totalSubjects: 0,
    attendancePct: 0,
    pendingAssignments: 0,
    upcomingExams: 0,
  };

  return (
    <DashboardLayout title="Dashboard">
      <motion.div initial="hidden" whileInView="visible" viewport={REPLAY_VIEWPORT} variants={staggerContainer} className="space-y-6">
        {/* Greeting */}
        <motion.div variants={fadeInUp}>
          <h2 className="text-2xl font-bold text-text">Hello, {firstName} 👋</h2>
          <p className="text-sm text-text-muted mt-1">
            {stats.totalSubjects === 0
              ? 'Welcome! Start by adding your subjects.'
              : `You have ${stats.pendingAssignments} pending assignment${stats.pendingAssignments !== 1 ? 's' : ''} and ${stats.upcomingExams} upcoming exam${stats.upcomingExams !== 1 ? 's' : ''}.`}
          </p>
        </motion.div>

        {/* Live Profile Card */}
        <motion.div variants={fadeInUp}>
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap size={16} className="text-primary" />
              <h3 className="text-sm font-semibold text-text">My Profile</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <ProfileField label="Student Name" value={profile?.full_name} icon={User} />
              <ProfileField label="College" value={profile?.college_name} icon={Building2} />
              <ProfileField label="Degree" value={profile?.degree} icon={GraduationCap} />
              <ProfileField label="Branch" value={profile?.branch} icon={BookOpen} />
              <ProfileField label="Semester" value={profile?.semester ? `Semester ${profile.semester}` : null} icon={CalendarClock} />
              <ProfileField label="Academic Year" value={profile?.academic_year} icon={CalendarClock} />
              <ProfileField label="Roll Number" value={profile?.roll_number} icon={Hash} />
              <ProfileField
                label={`Current ${performanceLabel(profile?.performance_type)}`}
                value={profile?.current_score != null ? String(profile.current_score) : null}
                icon={Award}
              />
              <ProfileField
                label={`Target ${performanceLabel(profile?.performance_type)}`}
                value={profile?.target_score != null ? String(profile.target_score) : null}
                icon={Target}
              />
              <ProfileField label="Attendance Goal" value={profile?.attendance_goal ? `${profile.attendance_goal}%` : null} icon={Target} />
              <ProfileField label="Working Days" value={workingDaysLabel(profile?.working_days)} icon={CalendarClock} />
            </div>
          </GlassCard>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-error/10 border border-error/30 rounded-xl px-4 py-3 text-sm text-error">{error}</div>
        ) : (
          <>
            {/* Stat row */}
            <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Subjects" value={String(stats.totalSubjects)} icon={BookOpen} color="text-primary" to="/subjects" />
              <StatCard label="Attendance" value={`${stats.attendancePct}%`} icon={CalendarCheck} color="text-primary-light" to="/attendance" />
              <StatCard label="Pending Tasks" value={String(stats.pendingAssignments)} icon={ClipboardList} color="text-warning" to="/assignments" />
              <StatCard label="Upcoming Exams" value={String(stats.upcomingExams)} icon={Target} color="text-info" to="/analytics" />
            </motion.div>

            {/* Attendance Overview Widgets */}
            <AttendanceWidgets attendance={attendance} subjects={subjects} goal={profile?.attendance_goal || 75} />

            {/* In-app reminders */}
            {user?.id && (
              <Reminders userId={user.id} goal={profile?.attendance_goal || 75} />
            )}

            {/* Quick Actions */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-sm font-semibold text-text mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <NavCard title="Subjects" icon={BookOpen} to="/subjects" />
                <NavCard title="Attendance" icon={CalendarCheck} to="/attendance" />
                <NavCard title="Assignments" icon={ClipboardList} to="/assignments" />
                <NavCard title="Analytics" icon={BarChart3} to="/analytics" />
                <NavCard title="AI Assistant" icon={Sparkles} to="/ai" />
                <NavCard title="Scanner" icon={ScanLine} to="/scanner" />
              </div>
            </motion.div>

            {/* Today's Classes */}
            <motion.div variants={fadeInUp}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-text">Today's Classes</h3>
                <Link to="/attendance" className="text-xs text-primary-light hover:text-primary transition-colors">Mark attendance</Link>
              </div>
              {todaysClasses.length > 0 ? (
                <div className="space-y-2">
                  {todaysClasses.map((entry) => {
                    const subject = entry.subjects?.name || 'Unknown';
                    const color = entry.subjects?.color || '#10b981';
                    return (
                      <GlassCard key={entry.id} className="flex items-center gap-3 py-3">
                        <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text truncate">{subject}</p>
                          <p className="text-xs text-text-muted flex items-center gap-1.5 mt-0.5">
                            <Clock size={11} /> {entry.start_time?.slice(0, 5)} – {entry.end_time?.slice(0, 5)}
                            {entry.room && ` · Room ${entry.room}`}
                          </p>
                        </div>
                        {entry.attendanceStatus ? (
                          <span className={cn(
                            'text-xs font-semibold px-3 py-1 rounded-full capitalize',
                            entry.attendanceStatus === 'present' ? 'bg-primary/10 text-primary-light'
                              : entry.attendanceStatus === 'absent' ? 'bg-error/10 text-error'
                              : 'bg-surface-3 text-text-muted',
                          )}>
                            {entry.attendanceStatus}
                          </span>
                        ) : (
                          <span className="text-xs text-text-muted px-3 py-1 rounded-full bg-surface-3">Not marked</span>
                        )}
                      </GlassCard>
                    );
                  })}
                </div>
              ) : (
                <GlassCard className="flex flex-col items-center justify-center py-10">
                  <CalendarCheck size={24} className="text-text-muted mb-2" />
                  <p className="text-sm text-text-muted">No classes scheduled for today.</p>
                </GlassCard>
              )}
            </motion.div>

            {/* Upcoming Assignments + Exams */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <motion.div variants={fadeInUp}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-text">Upcoming Assignments</h3>
                  <Link to="/assignments" className="text-xs text-primary-light hover:text-primary transition-colors">View all</Link>
                </div>
                <GlassCard className="p-0 overflow-hidden">
                  {data?.upcomingAssignments?.length > 0 ? (
                    data.upcomingAssignments.map((a: any, i: number) => (
                      <div key={a.id} className={`flex items-center gap-4 px-6 py-4 ${i < data.upcomingAssignments.length - 1 ? 'border-b border-border' : ''}`}>
                        <div className="w-2.5 h-2.5 rounded-full bg-warning" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-text">{a.title}</p>
                          <p className="text-xs text-text-muted flex items-center gap-1.5 mt-0.5">
                            <Clock size={12} /> {a.due_date ? new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No due date'}
                            {a.subjects?.name && ` · ${a.subjects.name}`}
                          </p>
                        </div>
                        <ArrowRight size={16} className="text-text-muted" />
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10">
                      <ClipboardList size={24} className="text-text-muted mb-2" />
                      <p className="text-sm text-text-muted">No pending assignments</p>
                    </div>
                  )}
                </GlassCard>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-text">Upcoming Exams</h3>
                  <Link to="/analytics" className="text-xs text-primary-light hover:text-primary transition-colors">View all</Link>
                </div>
                <GlassCard className="p-0 overflow-hidden">
                  {data?.upcomingExams?.length > 0 ? (
                    data.upcomingExams.map((e: any, i: number) => (
                      <div key={e.id} className={`flex items-center gap-4 px-6 py-4 ${i < data.upcomingExams.length - 1 ? 'border-b border-border' : ''}`}>
                        <div className="w-2.5 h-2.5 rounded-full bg-info" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-text">{e.title}</p>
                          <p className="text-xs text-text-muted flex items-center gap-1.5 mt-0.5">
                            <Clock size={12} /> {new Date(e.exam_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {e.subjects?.name && ` · ${e.subjects.name}`}
                          </p>
                        </div>
                        <ArrowRight size={16} className="text-text-muted" />
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10">
                      <Target size={24} className="text-text-muted mb-2" />
                      <p className="text-sm text-text-muted">No upcoming exams</p>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            </div>

            {/* Semester Progress */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-sm font-semibold text-text mb-4">Semester Progress</h3>
              <GlassCard>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-text-muted">Semester {profile?.semester || '—'}</p>
                    <p className="text-xs text-text-muted mt-0.5">{profile?.academic_year || 'Academic year not set'}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-primary-light">
                    <TrendingUp size={14} />
                    <span>{stats.totalSubjects} subjects · {stats.attendancePct}% attendance</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-text-muted">Attendance Goal</span>
                      <span className="text-xs font-semibold text-text">{profile?.attendance_goal || 75}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${stats.attendancePct}%` }}
                        viewport={REPLAY_VIEWPORT}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-text-muted">Assignment Completion</span>
                      <span className="text-xs font-semibold text-text">
                        {data?.stats?.completedAssignments + data?.stats?.pendingAssignments > 0
                          ? Math.round((data.stats.completedAssignments / (data.stats.completedAssignments + data.stats.pendingAssignments)) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{
                          width: `${data?.stats?.completedAssignments + data?.stats?.pendingAssignments > 0
                            ? Math.round((data.stats.completedAssignments / (data.stats.completedAssignments + data.stats.pendingAssignments)) * 100)
                            : 0}%`
                        }}
                        viewport={REPLAY_VIEWPORT}
                        transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full bg-info"
                      />
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
}

function StatCard({ label, value, icon: Icon, color, to }: { label: string; value: string; icon: any; color: string; to: string }) {
  return (
    <Link to={to}>
      <motion.div whileHover={{ y: -4 }} className="glass rounded-3xl p-5 border border-border hover:border-primary/30 transition-all">
        <div className={`w-10 h-10 rounded-xl bg-surface-2 border border-border-2 flex items-center justify-center ${color} mb-3`}>
          <Icon size={18} />
        </div>
        <p className="text-2xl font-bold text-text">{value}</p>
        <p className="text-xs text-text-muted mt-1">{label}</p>
      </motion.div>
    </Link>
  );
}

function AttendanceWidgets({ attendance, subjects, goal }: { attendance: AttendanceRecord[]; subjects: Subject[]; goal: number }) {
  const today = calculateTodaysAttendance(attendance);
  const overall = calculateOverallAttendance(attendance);
  const { best, weakest } = calculateSubjectExtremes(attendance, subjects, goal);
  const risks = calculateRiskSubjects(attendance, subjects, goal);
  const weeklyData = calculateWeeklyAttendance(attendance);

  return (
    <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Today's Attendance */}
      <GlassCard className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center text-primary">
            <CalendarCheck size={16} />
          </div>
          <h3 className="text-sm font-semibold text-text">Today's Attendance</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold text-gradient">{today.conducted > 0 ? `${today.pct}%` : '—'}</div>
          <div className="text-xs text-text-muted">
            {today.present} present · {today.absent} absent
            {today.conducted === 0 && <div className="text-text-muted mt-1">No lectures yet</div>}
          </div>
        </div>
      </GlassCard>

      {/* Best & Weakest */}
      <GlassCard className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center text-primary-light">
            <Award size={16} />
          </div>
          <h3 className="text-sm font-semibold text-text">Best & Weakest</h3>
        </div>
        <div className="space-y-2">
          {best ? (
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted">Best:</span>
              <span className="font-semibold text-primary-light truncate ml-2">{best.name} ({best.pct}%)</span>
            </div>
          ) : <p className="text-xs text-text-muted">No data yet</p>}
          {weakest ? (
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted">Weakest:</span>
              <span className="font-semibold text-warning truncate ml-2">{weakest.name} ({weakest.pct}%)</span>
            </div>
          ) : null}
        </div>
      </GlassCard>

      {/* Goal Progress */}
      <GlassCard className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center text-info">
            <Target size={16} />
          </div>
          <h3 className="text-sm font-semibold text-text">Goal Progress</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold text-gradient">{overall.pct}%</div>
          <div className="flex-1">
            <div className="h-2 rounded-full bg-surface-3 overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: `${Math.min(100, (overall.pct / goal) * 100)}%` }}
                viewport={REPLAY_VIEWPORT}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs text-text-muted mt-1">Goal: {goal}%</p>
          </div>
        </div>
      </GlassCard>

      {/* Weekly Attendance Chart */}
      {weeklyData.length > 0 && (
        <GlassCard className="lg:col-span-2 p-5">
          <h3 className="text-sm font-semibold text-text mb-4">Weekly Attendance</h3>
          <AttendanceChart data={weeklyData} />
        </GlassCard>
      )}

      {/* Risk Subjects */}
      {risks.length > 0 && (
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-error/10 border border-error/15 flex items-center justify-center text-error">
              <TrendingUp size={16} />
            </div>
            <h3 className="text-sm font-semibold text-text">Upcoming Risk</h3>
          </div>
          <div className="space-y-2">
            {risks.slice(0, 4).map((r) => (
              <div key={r.id} className="flex items-center justify-between text-xs">
                <span className="text-text truncate">{r.name}</span>
                <span className="font-semibold text-warning ml-2">{r.pct}%</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </motion.div>
  );
}

function NavCard({ title, icon: Icon, to }: { title: string; icon: any; to: string }) {
  return (
    <Link to={to}>
      <motion.div whileHover={{ y: -4 }} className="glass rounded-2xl p-4 flex flex-col items-center gap-2.5 border border-border hover:border-primary/30 transition-all">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center text-primary">
          <Icon size={18} />
        </div>
        <span className="text-xs text-text-secondary">{title}</span>
      </motion.div>
    </Link>
  );
}

function ProfileField({ label, value, icon: Icon }: { label: string; value: string | null | undefined; icon: any }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border-2 flex items-center justify-center text-text-muted shrink-0">
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-text-muted">{label}</p>
        <p className="text-sm font-semibold text-text truncate">{value || '—'}</p>
      </div>
    </div>
  );
}
