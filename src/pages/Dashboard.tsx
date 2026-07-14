import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarCheck, ClipboardList, BarChart3, Sparkles, ScanLine, ArrowRight, Clock, TrendingUp, BookOpen, Plus, Target } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { fadeInUp, staggerContainer, REPLAY_VIEWPORT } from '@/components/motion';
import { getDashboardData } from '@/services/db';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const result = await getDashboardData(user.id);
    setData(result);
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
