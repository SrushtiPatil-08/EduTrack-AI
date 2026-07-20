import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { CalendarCheck, Check, X, Minus, AlertTriangle, TrendingUp, Sparkles, Clock, Zap, Plus, Calendar, BookText, FlaskConical, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fadeInUp, staggerContainer, REPLAY_VIEWPORT } from '@/components/motion';
import {
  getAttendance, createAttendance, updateAttendance, getSubjects, getTodaysTimetable,
  calculateSubjectAttendance, calculateOverallAttendance, generateAttendanceInsights,
  findDuplicateAttendance,
} from '@/services/db';
import type { Subject, AttendanceRecord, TimetableEntry } from '@/services/db';
import { validateAttendanceEntry, isFutureDate } from '@/lib/profile';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS = [
  { value: 'present', label: 'Present', icon: Check, color: 'text-primary-light', bg: 'bg-primary/15 border-primary/40' },
  { value: 'absent', label: 'Absent', icon: X, color: 'text-error', bg: 'bg-error/15 border-error/40' },
  { value: 'holiday', label: 'Holiday', icon: Calendar, color: 'text-info', bg: 'bg-info/15 border-info/40' },
  { value: 'cancelled', label: 'Cancelled', icon: Minus, color: 'text-text-muted', bg: 'bg-surface-3 border-border-2' },
] as const;

const LECTURE_TYPES = [
  { value: 'theory', label: 'Theory', icon: BookText },
  { value: 'practical', label: 'Practical', icon: FlaskConical },
  { value: 'tutorial', label: 'Tutorial', icon: Users },
] as const;

export default function Attendance() {
  const { user, profile } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [todaysClasses, setTodaysClasses] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marking, setMarking] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);

  const goal = profile?.attendance_goal || 75;
  const defaultLectureType = profile?.default_lecture_type || 'theory';

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
    const today = new Date().toLocaleDateString('en-CA');
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
        lecture_type: defaultLectureType,
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
                const subjectGoal = subject.attendance_goal || goal;
                const status = stats.conducted === 0 ? 'No lectures' : stats.pct >= subjectGoal ? 'On track' : 'At risk';
                return (
                  <motion.div key={subject.id} variants={fadeInUp} whileHover={{ y: -6, transition: { duration: 0.2 } }}>
                    <GlassCard className="relative h-full group overflow-hidden" style={{ borderColor: `${subject.color}30` }}>
                      {/* Glass reflection on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `linear-gradient(135deg, ${subject.color}10 0%, transparent 40%, transparent 60%, ${subject.color}08 100%)` }} />
                      {/* Hover glow */}
                      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: `0 8px 40px ${subject.color}25` }} />
                      <div className="relative">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${subject.color}20`, border: `1px solid ${subject.color}30` }}>
                            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: subject.color }} />
                          </div>
                          <ProgressRing pct={stats.pct} goal={subjectGoal} color={subject.color} />
                        </div>
                        <h3 className="text-sm font-semibold text-text mb-1">{subject.name}</h3>
                        {subject.faculty_name && <p className="text-xs text-text-muted mb-1">{subject.faculty_name}</p>}
                        <p className="text-[11px] text-text-muted mb-3">{subject.credits} credits · <span className="capitalize">{subject.type}</span></p>
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
                          <div className="flex items-center justify-between mb-1">
                            <span className={cn('text-[11px] font-medium', stats.pct >= subjectGoal ? 'text-primary-light' : 'text-warning')}>{status}</span>
                            <span className="text-[11px] text-text-muted">Goal {subjectGoal}%</span>
                          </div>
                          {stats.conducted > 0 && (stats.pct >= subjectGoal ? (
                            <p className="text-xs text-primary-light">
                              Safe to miss {stats.safeBunks} lecture{stats.safeBunks !== 1 ? 's' : ''}.
                            </p>
                          ) : (
                            <p className="text-xs text-warning">
                              Need {stats.lecturesRequired} lecture{stats.lecturesRequired !== 1 ? 's' : ''} to reach {subjectGoal}%.
                            </p>
                          ))}
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.div>

        {/* Add manual entry button */}
        {subjects.length > 0 && (
          <motion.div variants={fadeInUp} className="flex justify-center">
            <Button variant="secondary" onClick={() => setManualOpen(true)}>
              <Plus size={16} /> Mark Past Attendance
            </Button>
          </motion.div>
        )}

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

      <AnimatePresence>
        {manualOpen && (
          <ManualEntryModal
            subjects={subjects}
            attendance={attendance}
            defaultLectureType={defaultLectureType}
            onClose={() => setManualOpen(false)}
            onSave={async (payload) => {
              if (!user?.id) return;
              const { error: err } = await createAttendance(user.id, payload);
              if (err) setError(err);
              setManualOpen(false);
              await loadData();
            }}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

function ProgressRing({ pct, goal, color }: { pct: number; goal: number; color: string }) {
  const radius = 18;
  const circ = 2 * Math.PI * radius;
  const progress = Math.min(100, (pct / goal) * 100);
  const offset = circ - (progress / 100) * circ;
  return (
    <div className="relative w-12 h-12">
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={radius} fill="none" stroke="currentColor" strokeWidth="3.5" className="text-border" />
        <motion.circle
          cx="22" cy="22" r={radius} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round"
          strokeDasharray={circ} initial={{ strokeDashoffset: circ }} whileInView={{ strokeDashoffset: offset }} viewport={REPLAY_VIEWPORT} transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-bold text-text">{pct}%</span>
      </div>
    </div>
  );
}

function ManualEntryModal({ subjects, attendance, defaultLectureType, onClose, onSave }: {
  subjects: Subject[];
  attendance: AttendanceRecord[];
  defaultLectureType: 'theory' | 'practical' | 'tutorial';
  onClose: () => void;
  onSave: (payload: { subject_id: string; date: string; status: string; lecture_type: string; remarks?: string }) => void;
}) {
  const [form, setForm] = useState({
    subject_id: '',
    date: new Date().toLocaleDateString('en-CA'),
    status: 'present' as 'present' | 'absent' | 'holiday' | 'cancelled',
    lecture_type: defaultLectureType,
    remarks: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const today = new Date().toLocaleDateString('en-CA');

  const handleSubmit = () => {
    const errs = validateAttendanceEntry(form);
    if (!form.subject_id) errs.subject_id = 'Select a subject';
    if (isFutureDate(form.date)) errs.date = 'Cannot mark attendance for a future date';
    const dup = findDuplicateAttendance(attendance, form.subject_id, form.date, form.lecture_type);
    if (dup) errs.subject_id = 'Attendance already marked for this subject/date/type';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSave({ ...form, remarks: form.remarks.trim() || undefined });
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-bg/80 backdrop-blur-md px-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="glass-strong rounded-3xl p-8 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
          <h2 className="text-lg font-bold text-text mb-6">Mark Attendance</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Subject</label>
              <select
                value={form.subject_id}
                onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
                className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-border-2 text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="">Select subject…</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {errors.subject_id && <p className="text-xs text-error mt-1">{errors.subject_id}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Date</label>
                <input
                  type="date"
                  max={today}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-border-2 text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                {errors.date && <p className="text-xs text-error mt-1">{errors.date}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Lecture Type</label>
                <select
                  value={form.lecture_type}
                  onChange={(e) => setForm({ ...form, lecture_type: e.target.value as any })}
                  className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-border-2 text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  {LECTURE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Status</label>
              <div className="grid grid-cols-4 gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setForm({ ...form, status: s.value })}
                    className={cn(
                      'h-11 rounded-xl text-xs font-medium transition-all cursor-pointer border flex flex-col items-center justify-center gap-1',
                      form.status === s.value ? s.bg + ' ' + s.color : 'bg-surface-2 border-border-2 text-text-muted hover:text-text',
                    )}
                  >
                    <s.icon size={14} /> {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Remarks (optional)</label>
              <input
                type="text"
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                placeholder="e.g. Guest lecture, makeup class…"
                className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-border-2 text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
              <Button fullWidth onClick={handleSubmit}>Save</Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
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
