import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { CalendarCheck, Clock, TrendingUp, Plus, Check, X, Minus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fadeInUp, staggerContainer, REPLAY_VIEWPORT } from '@/components/motion';
import { getAttendance, createAttendance, getSubjects } from '@/services/db';
import type { Subject, AttendanceRecord } from '@/services/db';
import { cn } from '@/lib/utils';

export default function Attendance() {
  const { user, profile } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marking, setMarking] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'present' | 'absent' | 'excused'>('present');

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const [attRes, subRes] = await Promise.all([
      getAttendance(user.id),
      getSubjects(user.id),
    ]);
    if (attRes.error) setError(attRes.error);
    else setAttendance(attRes.attendance as AttendanceRecord[] || []);
    if (subRes.error) setError(subRes.error);
    else setSubjects(subRes.subjects as Subject[] || []);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMark = async () => {
    if (!user?.id || !selectedSubject) return;
    setMarking(true);
    const today = new Date().toISOString().split('T')[0];
    const { error: err } = await createAttendance(user.id, {
      subject_id: selectedSubject,
      date: today,
      status: selectedStatus,
    });
    if (err) setError(err);
    else {
      setSelectedSubject('');
      await loadData();
    }
    setMarking(false);
  };

  const present = attendance.filter((a) => a.status === 'present').length;
  const absent = attendance.filter((a) => a.status === 'absent').length;
  const excused = attendance.filter((a) => a.status === 'excused').length;
  const total = attendance.length;
  const attendancePct = total > 0 ? Math.round((present / total) * 100) : 0;
  const goal = profile?.attendance_goal || 75;

  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  return (
    <DashboardLayout title="Attendance">
      <motion.div initial="hidden" whileInView="visible" viewport={REPLAY_VIEWPORT} variants={staggerContainer} className="space-y-6">
        {/* Stats */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <GlassCard className="p-5">
            <CalendarCheck className="text-primary mb-3" size={20} />
            <p className="text-2xl font-bold text-text">{attendancePct}%</p>
            <p className="text-xs text-text-muted mt-1">Overall Attendance</p>
          </GlassCard>
          <GlassCard className="p-5">
            <Check className="text-primary-light mb-3" size={20} />
            <p className="text-2xl font-bold text-text">{present}</p>
            <p className="text-xs text-text-muted mt-1">Classes Present</p>
          </GlassCard>
          <GlassCard className="p-5">
            <X className="text-error mb-3" size={20} />
            <p className="text-2xl font-bold text-text">{absent}</p>
            <p className="text-xs text-text-muted mt-1">Classes Absent</p>
          </GlassCard>
          <GlassCard className="p-5">
            <Clock className="text-info mb-3" size={20} />
            <p className="text-2xl font-bold text-text">{total}</p>
            <p className="text-xs text-text-muted mt-1">Total Records</p>
          </GlassCard>
        </motion.div>

        {/* Goal progress */}
        <motion.div variants={fadeInUp}>
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-text">Attendance Goal</h3>
                <p className="text-xs text-text-muted mt-1">Target: {goal}%</p>
              </div>
              <div className={cn('flex items-center gap-1.5 text-xs', attendancePct >= goal ? 'text-primary-light' : 'text-warning')}>
                <TrendingUp size={14} />
                {attendancePct >= goal ? 'On track' : `${goal - attendancePct}% below goal`}
              </div>
            </div>
            <div className="h-3 rounded-full bg-surface-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${Math.min(attendancePct, 100)}%` }}
                viewport={REPLAY_VIEWPORT}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className={cn('h-full rounded-full', attendancePct >= goal ? 'bg-primary' : 'bg-warning')}
              />
            </div>
          </GlassCard>
        </motion.div>

        {/* Mark attendance */}
        <motion.div variants={fadeInUp}>
          <GlassCard>
            <h3 className="text-sm font-semibold text-text mb-4">Mark Today's Attendance</h3>
            {subjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-sm text-text-muted">Add subjects first to mark attendance.</p>
                <Button size="sm" className="mt-4" onClick={() => window.location.href = '/subjects'}>
                  Go to Subjects
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="flex-1 h-12 px-4 rounded-xl bg-surface-2 border border-border-2 text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                >
                  <option value="">Select a subject…</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  {(['present', 'absent', 'excused'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedStatus(s)}
                      className={cn(
                        'h-12 px-4 rounded-xl text-sm font-medium capitalize transition-all cursor-pointer border',
                        selectedStatus === s
                          ? s === 'present' ? 'bg-primary/15 border-primary/40 text-primary-light'
                            : s === 'absent' ? 'bg-error/15 border-error/40 text-error'
                            : 'bg-info/15 border-info/40 text-info'
                          : 'bg-surface-2 border-border-2 text-text-muted hover:text-text',
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <Button size="md" onClick={handleMark} disabled={!selectedSubject || marking}>
                  <Plus size={16} /> Mark
                </Button>
              </div>
            )}
            {error && <p className="text-sm text-error mt-3">{error}</p>}
          </GlassCard>
        </motion.div>

        {/* Recent records */}
        <motion.div variants={fadeInUp}>
          <h3 className="text-sm font-semibold text-text mb-4">Recent Records</h3>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : attendance.length === 0 ? (
            <GlassCard className="flex flex-col items-center justify-center py-16">
              <CalendarCheck size={28} className="text-text-muted mb-3" />
              <p className="text-sm text-text-muted">No attendance records yet. Mark your first class above.</p>
            </GlassCard>
          ) : (
            <GlassCard className="p-0 overflow-hidden">
              {attendance.slice(0, 10).map((record, i) => {
                const subject = record.subject_id ? subjectMap.get(record.subject_id) : null;
                return (
                  <div key={record.id} className={cn('flex items-center gap-4 px-6 py-4', i < Math.min(attendance.length, 10) - 1 && 'border-b border-border')}>
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      record.status === 'present' ? 'bg-primary/15' : record.status === 'absent' ? 'bg-error/15' : 'bg-info/15',
                    )}>
                      {record.status === 'present' ? <Check size={14} className="text-primary" />
                        : record.status === 'absent' ? <X size={14} className="text-error" />
                        : <Minus size={14} className="text-info" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text">{subject?.name || 'Unknown subject'}</p>
                      <p className="text-xs text-text-muted">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    </div>
                    <span className={cn(
                      'text-xs font-semibold capitalize px-3 py-1 rounded-full',
                      record.status === 'present' ? 'bg-primary/10 text-primary-light'
                        : record.status === 'absent' ? 'bg-error/10 text-error'
                        : 'bg-info/10 text-info',
                    )}>
                      {record.status}
                    </span>
                  </div>
                );
              })}
            </GlassCard>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
