import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { fadeInUp, staggerContainer, REPLAY_VIEWPORT } from '@/components/motion';
import {
  AttendanceChart, MonthlyTrendChart, SubjectAttendanceChart, SemesterProgressChart, AnimatedCounter,
  AttendanceDistributionChart, GoalProgressChart,
} from '@/components/Charts';
import { CalendarCheck, TrendingUp, Award, Target, BookOpen, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  getAttendance, getSubjects, calculateOverallAttendance,
  calculateWeeklyAttendance, calculateMonthlyAttendance, calculateSubjectAttendance,
  generateAttendanceInsights,
} from '@/services/db';
import type { AttendanceRecord, Subject } from '@/services/db';
import { cn } from '@/lib/utils';

export default function Analytics() {
  const { user, profile } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const goal = profile?.attendance_goal || 75;

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const [attRes, subRes] = await Promise.all([
      getAttendance(user.id),
      getSubjects(user.id),
    ]);
    if (attRes.attendance) setAttendance(attRes.attendance as AttendanceRecord[]);
    if (subRes.subjects) setSubjects(subRes.subjects as Subject[]);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const overall = useMemo(() => calculateOverallAttendance(attendance), [attendance]);
  const weeklyData = useMemo(() => calculateWeeklyAttendance(attendance), [attendance]);
  const monthlyData = useMemo(() => calculateMonthlyAttendance(attendance), [attendance]);
  const insights = useMemo(() => generateAttendanceInsights(attendance, subjects, goal), [attendance, subjects, goal]);

  const subjectChartData = useMemo(() => {
    return subjects.map((s) => {
      const stats = calculateSubjectAttendance(attendance, s.id, s.attendance_goal || goal);
      return { name: s.name.length > 12 ? s.name.slice(0, 10) + '…' : s.name, attendance: stats.pct, color: s.color };
    });
  }, [subjects, attendance, goal]);

  const semesterData = useMemo(() => {
    // Build cumulative attendance percentage over time (by month)
    const byMonth = new Map<string, { present: number; conducted: number }>();
    for (const a of attendance) {
      if (a.status === 'cancelled' || a.status === 'excused') continue;
      const monthKey = a.date.slice(0, 7);
      if (!byMonth.has(monthKey)) byMonth.set(monthKey, { present: 0, conducted: 0 });
      const m = byMonth.get(monthKey)!;
      m.conducted++;
      if (a.status === 'present') m.present++;
    }
    const sorted = [...byMonth.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    let cumPresent = 0, cumConducted = 0;
    return sorted.map(([month, val]) => {
      cumPresent += val.present;
      cumConducted += val.conducted;
      const pct = cumConducted > 0 ? Math.round((cumPresent / cumConducted) * 100) : 0;
      const [y, m] = month.split('-');
      return { label: `${parseInt(m)}/${y.slice(2)}`, pct };
    });
  }, [attendance]);

  const bestSubject = useMemo(() => {
    if (subjects.length === 0) return null;
    let best = subjects[0];
    let bestPct = -1;
    for (const s of subjects) {
      const stats = calculateSubjectAttendance(attendance, s.id, s.attendance_goal || goal);
      if (stats.pct > bestPct) { bestPct = stats.pct; best = s; }
    }
    return { name: best.name, pct: bestPct };
  }, [subjects, attendance, goal]);

  const trend = useMemo(() => {
    if (monthlyData.length < 2) return 0;
    const recent = monthlyData[monthlyData.length - 1]?.value || 0;
    const prev = monthlyData[monthlyData.length - 2]?.value || 0;
    return Math.round(recent - prev);
  }, [monthlyData]);

  return (
    <DashboardLayout title="Analytics">
      <motion.div initial="hidden" whileInView="visible" viewport={REPLAY_VIEWPORT} variants={staggerContainer} className="space-y-6">
        {/* Stat row */}
        <motion.div variants={fadeInUp} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <GlassCard className="p-5">
            <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border-2 flex items-center justify-center text-primary mb-3">
              <CalendarCheck size={18} />
            </div>
            <AnimatedCounter value={overall.pct} suffix="%" />
            <p className="text-xs text-text-muted mt-1">Overall Attendance</p>
          </GlassCard>
          <GlassCard className="p-5">
            <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border-2 flex items-center justify-center text-primary-light mb-3">
              <TrendingUp size={18} />
            </div>
            <p className="text-3xl font-bold text-text">{trend > 0 ? '+' : ''}{trend}%</p>
            <p className="text-xs text-text-muted mt-1">Monthly Trend</p>
          </GlassCard>
          <GlassCard className="p-5">
            <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border-2 flex items-center justify-center text-warning mb-3">
              <Award size={18} />
            </div>
            <p className="text-3xl font-bold text-text truncate">{bestSubject ? bestSubject.name : '—'}</p>
            <p className="text-xs text-text-muted mt-1">Best Subject{bestSubject ? ` (${bestSubject.pct}%)` : ''}</p>
          </GlassCard>
          <GlassCard className="p-5">
            <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border-2 flex items-center justify-center text-info mb-3">
              <Target size={18} />
            </div>
            <p className="text-3xl font-bold text-text">{goal}%</p>
            <p className="text-xs text-text-muted mt-1">Attendance Goal</p>
          </GlassCard>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : attendance.length === 0 ? (
          <GlassCard className="flex flex-col items-center justify-center py-16">
            <BookOpen size={28} className="text-text-muted mb-3" />
            <p className="text-sm text-text-muted">No attendance data yet. Mark attendance to see analytics.</p>
          </GlassCard>
        ) : (
          <>
            {/* Charts grid */}
            <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <GlassCard>
                <h3 className="text-sm font-semibold text-text mb-1">Weekly Attendance</h3>
                <p className="text-xs text-text-muted mb-6">Last 7 days</p>
                <AttendanceChart data={weeklyData} />
              </GlassCard>

              <GlassCard>
                <h3 className="text-sm font-semibold text-text mb-1">Monthly Trend</h3>
                <p className="text-xs text-text-muted mb-6">Last 6 months</p>
                <MonthlyTrendChart data={monthlyData} />
              </GlassCard>

              <GlassCard>
                <h3 className="text-sm font-semibold text-text mb-1">Subject Breakdown</h3>
                <p className="text-xs text-text-muted mb-6">Attendance by subject</p>
                {subjectChartData.length > 0 ? (
                  <SubjectAttendanceChart data={subjectChartData} />
                ) : (
                  <p className="text-xs text-text-muted py-8 text-center">Add subjects to see breakdown.</p>
                )}
              </GlassCard>

              <GlassCard>
                <h3 className="text-sm font-semibold text-text mb-1">Cumulative Progress</h3>
                <p className="text-xs text-text-muted mb-6">Attendance over time</p>
                {semesterData.length > 0 ? (
                  <SemesterProgressChart data={semesterData} />
                ) : (
                  <p className="text-xs text-text-muted py-8 text-center">Not enough data yet.</p>
                )}
              </GlassCard>
            </motion.div>

            {/* Insights */}
            {insights.length > 0 && (
              <motion.div variants={fadeInUp}>
                <h3 className="text-sm font-semibold text-text mb-4">Smart Insights</h3>
                <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {insights.map((insight, i) => (
                    <motion.div key={i} variants={fadeInUp} whileHover={{ y: -2 }}>
                      <GlassCard className="flex items-start gap-3">
                        <div className={cn(
                          'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                          insight.type === 'warning' ? 'bg-warning/15' : 'bg-primary/15',
                        )}>
                          {insight.type === 'warning'
                            ? <AlertTriangle size={16} className="text-warning" />
                            : <TrendingUp size={16} className="text-primary" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text">{insight.title}</p>
                          <p className="text-xs text-text-muted mt-1">{insight.message}</p>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
