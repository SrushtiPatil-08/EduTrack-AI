import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { CalendarCheck, Check, X, Minus, AlertTriangle, TrendingUp, Sparkles, Clock, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fadeInUp, staggerContainer, REPLAY_VIEWPORT } from '@/components/motion';
import {
  getAttendance, createAttendance, updateAttendance, getSubjects, getTodaysTimetable,
  calculateSubjectAttendance, calculateOverallAttendance, generateAttendanceInsights,
} from '@/services/db';
import type { Subject, AttendanceRecord, TimetableEntry } from '@/services/db';
import { cn } from '@/lib/utils';

export default function Attendance() {
  const { user, profile } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [todaysClasses, setTodaysClasses] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marking, setMarking] = useState<string | null>(null);

  const goal = profile?.attendance_goal || 75;

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const [attRes, subRes, ttRes] = await Promise.all([
      getAttendance(user.id),
      getSubjects(user.id),
      getTodaysTimetable(user.id),
    ]);
    if (attRes.error) setError(attRes.error);
    else setAttendance(attRes.attendance as AttendanceRecord[] || []);
    if (subRes.error) setError(subRes.error);
    else setSubjects(subRes.subjects as Subject[] || []);
    if (ttRes.error) setError(ttRes.error);
    else setTodaysClasses(ttRes.entries || []);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleQuickMark = async (entry: TimetableEntry, status: 'present' | 'absent' | 'cancelled') => {
    if (!user?.id || !entry.subject_id) return;
    setMarking(entry.id);
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local tz
    // Check if already marked
    const existing = attendance.find(
      (a) => a.date === today && (a.timetable_entry_id === entry.id || a.subject_id === entry.subject_id)
    );
    if (existing) {
      await updateAttendance(existing.id, { status });
    } else {
      await createAttendance(user.id, {
        subject_id: entry.subject_id,
        timetable_entry_id: entry.id,
        date: today,
        status,
      });
    }
    setMarking(null);
    await loadData();
  };

  const overall = calculateOverallAttendance(attendance);
  const insights = generateAttendanceInsights(attendance, subjects, goal);
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  return (
    <DashboardLayout title="Attendance">
      <motion.div initial="hidden" whileInView="visible" viewport={REPLAY_VIEWPORT} variants={staggerContainer} className="space-y-6">
        {/* Overall stats */}
        <motion.div variants={fadeInUp} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <GlassCard className="p-5">
            <CalendarCheck className="text-primary mb-3" size={20} />
            <p className="text-2xl font-bold text-text">{overall.pct}%</p>
            <p className="text-xs text-text-muted mt-1">Overall Attendance</p>
          </GlassCard>
          <GlassCard className="p-5">
            <Check className="text-primary-light mb-3" size={20} />
            <p className="text-2xl font-bold text-text">{overall.present}</p>
            <p className="text-xs text-text-muted mt-1">Present</p>
          </GlassCard>
          <GlassCard className="p-5">
            <X className="text-error mb-3" size={20} />
            <p className="text-2xl font-bold text-text">{overall.absent}</p>
            <p className="text-xs text-text-muted mt-1">Absent</p>
          </GlassCard>
          <GlassCard className="p-5">
            <Clock className="text-info mb-3" size={20} />
            <p className="text-2xl font-bold text-text">{overall.conducted}</p>
            <p className="text-xs text-text-muted mt-1">Conducted</p>
          </GlassCard>
        </motion.div>

        {/* Quick Mark Mode — Today's classes */}
        <motion.div variants={fadeInUp}>
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-primary" />
            <h3 className="text-sm font-semibold text-text">Quick Mark — Today's Classes</h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : todaysClasses.length === 0 ? (
            <GlassCard className="flex flex-col items-center justify-center py-12">
              <CalendarCheck size={24} className="text-text-muted mb-2" />
              <p className="text-sm text-text-muted">
                {subjects.length === 0
                  ? 'Add subjects and set up your timetable to see today\'s classes here.'
                  : 'No classes scheduled for today. Set up your timetable to get started.'}
              </p>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {todaysClasses.map((entry) => {
                const subject = entry.subject_id ? subjectMap.get(entry.subject_id) : null;
                const status = entry.attendanceStatus;
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={REPLAY_VIEWPORT}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -2 }}
                  >
                    <GlassCard className="flex items-center gap-4 flex-wrap">
                      <div className="w-1.5 h-12 rounded-full" style={{ backgroundColor: subject?.color || '#10b981' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text">{subject?.name || 'Unknown'}</p>
                        <p className="text-xs text-text-muted flex items-center gap-1.5 mt-0.5">
                          <Clock size={11} /> {entry.start_time?.slice(0, 5)} – {entry.end_time?.slice(0, 5)}
                          {entry.room && ` · Room ${entry.room}`}
                        </p>
                      </div>
                      {status ? (
                        <span className={cn(
                          'text-xs font-semibold px-3 py-1.5 rounded-full capitalize',
                          status === 'present' ? 'bg-primary/10 text-primary-light'
                            : status === 'absent' ? 'bg-error/10 text-error'
                            : 'bg-surface-3 text-text-muted',
                        )}>
                          {status === 'present' && <Check size={12} className="inline mr-1" />}
                          {status === 'absent' && <X size={12} className="inline mr-1" />}
                          {status === 'cancelled' && <Minus size={12} className="inline mr-1" />}
                          {status}
                        </span>
                      ) : (
                        <div className="flex gap-2">
                          <QuickMarkButton
                            label="Present"
                            icon={<Check size={14} />}
                            activeClass="bg-primary/15 border-primary/40 text-primary-light"
                            onClick={() => handleQuickMark(entry, 'present')}
                            disabled={marking === entry.id}
                          />
                          <QuickMarkButton
                            label="Absent"
                            icon={<X size={14} />}
                            activeClass="bg-error/15 border-error/40 text-error"
                            onClick={() => handleQuickMark(entry, 'absent')}
                            disabled={marking === entry.id}
                          />
                          <QuickMarkButton
                            label="Cancel"
                            icon={<Minus size={14} />}
                            activeClass="bg-surface-3 border-border-2 text-text-muted"
                            onClick={() => handleQuickMark(entry, 'cancelled')}
                            disabled={marking === entry.id}
                          />
                        </div>
                      )}
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Subject-wise attendance */}
        <motion.div variants={fadeInUp}>
          <h3 className="text-sm font-semibold text-text mb-4">Subject-wise Attendance</h3>
          {subjects.length === 0 ? (
            <GlassCard className="flex flex-col items-center justify-center py-12">
              <CalendarCheck size={24} className="text-text-muted mb-2" />
              <p className="text-sm text-text-muted">Add subjects to see attendance breakdown.</p>
            </GlassCard>
          ) : (
            <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {subjects.map((subject) => {
                const stats = calculateSubjectAttendance(attendance, subject.id, subject.attendance_goal || goal);
                return (
                  <motion.div key={subject.id} variants={fadeInUp} whileHover={{ y: -6, transition: { duration: 0.2 } }}>
                    <GlassCard className="h-full" style={{ borderColor: `${subject.color}30` }}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${subject.color}20`, border: `1px solid ${subject.color}30` }}>
                          <div className="w-5 h-5 rounded-full" style={{ backgroundColor: subject.color }} />
                        </div>
                        <div className={cn('text-2xl font-bold', stats.pct >= (subject.attendance_goal || goal) ? 'text-primary-light' : 'text-warning')}>
                          {stats.pct}%
                        </div>
                      </div>
                      <h3 className="text-sm font-semibold text-text mb-3">{subject.name}</h3>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Check size={12} className="text-primary" />
                          <span className="text-text-muted">Present:</span>
                          <span className="font-semibold text-text">{stats.present}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <X size={12} className="text-error" />
                          <span className="text-text-muted">Absent:</span>
                          <span className="font-semibold text-text">{stats.absent}</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border">
                        {stats.pct >= (subject.attendance_goal || goal) ? (
                          <p className="text-xs text-primary-light">
                            You can safely miss {stats.safeLeaves} lecture{stats.safeLeaves !== 1 ? 's' : ''}.
                          </p>
                        ) : (
                          <p className="text-xs text-warning">
                            Need {stats.lecturesNeeded} consecutive lecture{stats.lecturesNeeded !== 1 ? 's' : ''} to reach {subject.attendance_goal || goal}%.
                          </p>
                        )}
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.div>

        {/* AI Insights */}
        {insights.length > 0 && (
          <motion.div variants={fadeInUp}>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-primary" />
              <h3 className="text-sm font-semibold text-text">Smart Insights</h3>
            </div>
            <motion.div variants={staggerContainer} className="space-y-3">
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

        {error && <div className="bg-error/10 border border-error/30 rounded-xl px-4 py-3 text-sm text-error">{error}</div>}
      </motion.div>
    </DashboardLayout>
  );
}

function QuickMarkButton({ label, icon, activeClass, onClick, disabled }: {
  label: string; icon: React.ReactNode; activeClass: string; onClick: () => void; disabled: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border transition-all cursor-pointer',
        'bg-surface-2 border-border-2 text-text-muted hover:text-text',
        disabled && 'opacity-50 pointer-events-none',
      )}
    >
      {icon} {label}
    </motion.button>
  );
}
