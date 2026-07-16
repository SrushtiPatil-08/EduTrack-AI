import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, Check, X, Minus, Calendar, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fadeInUp, staggerContainer, REPLAY_VIEWPORT } from '@/components/motion';
import {
  getAttendance, createAttendance, updateAttendance, deleteAttendance,
  getSubjects, getCalendarEvents, createCalendarEvent, deleteCalendarEvent,
} from '@/services/db';
import type { AttendanceRecord, Subject, CalendarEvent } from '@/services/db';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

type DayCell = {
  date: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  records: AttendanceRecord[];
  events: CalendarEvent[];
};

export default function AttendanceCalendar() {
  const { user } = useAuth();
  const [viewDate, setViewDate] = useState(new Date());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const [attRes, subRes, evtRes] = await Promise.all([
      getAttendance(user.id),
      getSubjects(user.id),
      getCalendarEvents(user.id),
    ]);
    if (attRes.attendance) setAttendance(attRes.attendance as AttendanceRecord[]);
    if (subRes.subjects) setSubjects(subRes.subjects as Subject[]);
    if (evtRes.events) setEvents(evtRes.events as CalendarEvent[]);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const subjectMap = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);

  const calendar = useMemo<DayCell[]>(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekday = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local tz

    const cells: DayCell[] = [];
    const attByDate = new Map<string, AttendanceRecord[]>();
    for (const a of attendance) {
      if (!attByDate.has(a.date)) attByDate.set(a.date, []);
      attByDate.get(a.date)!.push(a);
    }
    const evtByDate = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      if (!evtByDate.has(e.date)) evtByDate.set(e.date, []);
      evtByDate.get(e.date)!.push(e);
    }

    for (let i = startWeekday - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const date = new Date(year, month - 1, day).toLocaleDateString('en-CA');
      cells.push({ date, day, inMonth: false, isToday: false, records: attByDate.get(date) || [], events: evtByDate.get(date) || [] });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d).toLocaleDateString('en-CA');
      cells.push({ date, day: d, inMonth: true, isToday: date === today, records: attByDate.get(date) || [], events: evtByDate.get(date) || [] });
    }
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(year, month + 1, d).toLocaleDateString('en-CA');
      cells.push({ date, day: d, inMonth: false, isToday: false, records: attByDate.get(date) || [], events: evtByDate.get(date) || [] });
    }
    return cells;
  }, [viewDate, attendance, events]);

  const selectedRecords = selectedDate ? attendance.filter((a) => a.date === selectedDate) : [];
  const selectedEvents = selectedDate ? events.filter((e) => e.date === selectedDate) : [];

  const handleMarkStatus = async (record: AttendanceRecord, status: 'present' | 'absent' | 'cancelled' | 'excused') => {
    if (!user?.id) return;
    await updateAttendance(record.id, { status });
    await loadData();
  };

  const handleDeleteRecord = async (recordId: string) => {
    await deleteAttendance(recordId);
    await loadData();
  };

  const handleAddManual = async (subjectId: string, status: 'present' | 'absent' | 'cancelled' | 'excused') => {
    if (!user?.id || !selectedDate) return;
    await createAttendance(user.id, { subject_id: subjectId, date: selectedDate, status });
    await loadData();
  };

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  return (
    <DashboardLayout title="Attendance Calendar">
      <motion.div initial="hidden" whileInView="visible" viewport={REPLAY_VIEWPORT} variants={staggerContainer} className="space-y-6">
        {/* Legend */}
        <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-4">
          <LegendItem icon={<Check size={12} />} color="bg-primary/15 text-primary-light" label="Present" />
          <LegendItem icon={<X size={12} />} color="bg-error/15 text-error" label="Absent" />
          <LegendItem icon={<Minus size={12} />} color="bg-surface-3 text-text-muted" label="Cancelled" />
          <LegendItem icon={<Calendar size={12} />} color="bg-warning/15 text-warning" label="Holiday / Event" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <motion.div variants={fadeInUp} className="lg:col-span-2">
            <GlassCard>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold text-text">{MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}</h3>
                <div className="flex items-center gap-2">
                  <button onClick={prevMonth} className="w-8 h-8 rounded-lg bg-surface-2 border border-border-2 flex items-center justify-center hover:border-primary/40 transition-colors">
                    <ChevronLeft size={16} className="text-text-muted" />
                  </button>
                  <button onClick={nextMonth} className="w-8 h-8 rounded-lg bg-surface-2 border border-border-2 flex items-center justify-center hover:border-primary/40 transition-colors">
                    <ChevronRight size={16} className="text-text-muted" />
                  </button>
                </div>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-text-muted py-2">{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendar.map((cell, i) => {
                  const hasPresent = cell.records.some((r) => r.status === 'present');
                  const hasAbsent = cell.records.some((r) => r.status === 'absent');
                  const hasCancelled = cell.records.some((r) => r.status === 'cancelled');
                  const hasEvent = cell.events.length > 0;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(cell.date)}
                      className={cn(
                        'aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all border text-sm',
                        cell.inMonth
                          ? 'bg-surface-2/50 border-border-2 hover:border-primary/40 hover:bg-surface-2'
                          : 'bg-transparent border-transparent opacity-30',
                        cell.isToday && 'ring-2 ring-primary/40',
                        selectedDate === cell.date && 'border-primary/60 bg-primary/10',
                      )}
                    >
                      <span className={cn('font-medium', cell.isToday ? 'text-primary-light' : 'text-text')}>{cell.day}</span>
                      {(hasPresent || hasAbsent || hasCancelled || hasEvent) && (
                        <div className="flex items-center gap-0.5">
                          {hasPresent && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                          {hasAbsent && <div className="w-1.5 h-1.5 rounded-full bg-error" />}
                          {hasCancelled && <div className="w-1.5 h-1.5 rounded-full bg-text-muted" />}
                          {hasEvent && <div className="w-1.5 h-1.5 rounded-full bg-warning" />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>

          {/* Day detail panel */}
          <motion.div variants={fadeInUp}>
            <AnimatePresence mode="wait">
              {selectedDate ? (
                <motion.div key={selectedDate} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <DayDetail
                    date={selectedDate}
                    records={selectedRecords}
                    events={selectedEvents}
                    subjects={subjects}
                    subjectMap={subjectMap}
                    onMarkStatus={handleMarkStatus}
                    onDeleteRecord={handleDeleteRecord}
                    onAddManual={handleAddManual}
                    onAddEvent={() => setShowEventModal(true)}
                    onDeleteEvent={async (id) => { await deleteCalendarEvent(id); await loadData(); }}
                  />
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <GlassCard className="flex flex-col items-center justify-center py-16">
                    <Calendar size={28} className="text-text-muted mb-3" />
                    <p className="text-sm text-text-muted">Tap a date to see attendance details</p>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {showEventModal && selectedDate && (
          <EventModal
            date={selectedDate}
            onClose={() => setShowEventModal(false)}
            onSave={async (title, type, description) => {
              if (!user?.id) return;
              await createCalendarEvent(user.id, { title, date: selectedDate, type, description });
              setShowEventModal(false);
              await loadData();
            }}
          />
        )}
      </motion.div>
    </DashboardLayout>
  );
}

function DayDetail({ date, records, events, subjects, subjectMap, onMarkStatus, onDeleteRecord, onAddManual, onAddEvent, onDeleteEvent }: {
  date: string;
  records: AttendanceRecord[];
  events: CalendarEvent[];
  subjects: Subject[];
  subjectMap: Map<string, Subject>;
  onMarkStatus: (r: AttendanceRecord, s: 'present' | 'absent' | 'cancelled' | 'excused') => void;
  onDeleteRecord: (id: string) => void;
  onAddManual: (subjectId: string, status: 'present' | 'absent' | 'cancelled' | 'excused') => void;
  onAddEvent: () => void;
  onDeleteEvent: (id: string) => void;
}) {
  const [addSubject, setAddSubject] = useState('');
  const [addStatus, setAddStatus] = useState<'present' | 'absent' | 'cancelled' | 'excused'>('present');
  const d = new Date(date + 'T00:00:00');
  const dateLabel = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <GlassCard>
      <h3 className="text-sm font-semibold text-text mb-1">{dateLabel}</h3>
      <p className="text-xs text-text-muted mb-4">{records.length} attendance record{records.length !== 1 ? 's' : ''}</p>

      {/* Events */}
      {events.length > 0 && (
        <div className="space-y-2 mb-4">
          {events.map((e) => (
            <div key={e.id} className="flex items-center gap-2 bg-warning/10 border border-warning/20 rounded-xl px-3 py-2">
              <Calendar size={14} className="text-warning shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text truncate">{e.title}</p>
                {e.description && <p className="text-xs text-text-muted truncate">{e.description}</p>}
              </div>
              <button onClick={() => onDeleteEvent(e.id)} className="text-text-muted hover:text-error transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Attendance records */}
      {records.length > 0 ? (
        <div className="space-y-2 mb-4">
          {records.map((r) => {
            const subject = r.subject_id ? subjectMap.get(r.subject_id) : null;
            return (
              <div key={r.id} className="flex items-center gap-2 bg-surface-2/50 border border-border-2 rounded-xl px-3 py-2.5">
                <div className="w-1 h-8 rounded-full" style={{ backgroundColor: subject?.color || '#10b981' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-text truncate">{subject?.name || 'Unknown'}</p>
                  <div className="flex gap-1 mt-1">
                    {(['present', 'absent', 'cancelled', 'excused'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => onMarkStatus(r, s)}
                        className={cn(
                          'text-[10px] px-2 py-0.5 rounded-md font-medium capitalize transition-all',
                          r.status === s
                            ? s === 'present' ? 'bg-primary/20 text-primary-light'
                            : s === 'absent' ? 'bg-error/20 text-error'
                            : s === 'cancelled' ? 'bg-surface-3 text-text-muted'
                            : 'bg-info/20 text-info'
                            : 'bg-surface-3 text-text-muted hover:text-text',
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => onDeleteRecord(r.id)} className="text-text-muted hover:text-error transition-colors shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-text-muted mb-4">No attendance marked for this day.</p>
      )}

      {/* Add manual record */}
      {subjects.length > 0 && (
        <div className="border-t border-border pt-4">
          <p className="text-xs font-semibold text-text mb-2">Add Manual Record</p>
          <div className="flex gap-2 mb-2">
            <select
              value={addSubject}
              onChange={(e) => setAddSubject(e.target.value)}
              className="flex-1 bg-surface-2 border border-border-2 rounded-lg px-3 py-2 text-xs text-text outline-none focus:border-primary/40"
            >
              <option value="">Select subject...</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <select
              value={addStatus}
              onChange={(e) => setAddStatus(e.target.value as any)}
              className="flex-1 bg-surface-2 border border-border-2 rounded-lg px-3 py-2 text-xs text-text outline-none focus:border-primary/40"
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="cancelled">Cancelled</option>
              <option value="excused">Excused</option>
            </select>
            <Button
              size="sm"
              onClick={() => addSubject && onAddManual(addSubject, addStatus)}
              disabled={!addSubject}
            >
              <Plus size={14} /> Add
            </Button>
          </div>
        </div>
      )}

      <button
        onClick={onAddEvent}
        className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-border-2 text-xs text-text-muted hover:text-warning hover:border-warning/40 transition-all"
      >
        <Plus size={14} /> Add Holiday / Event
      </button>
    </GlassCard>
  );
}

function EventModal({ date, onClose, onSave }: {
  date: string;
  onClose: () => void;
  onSave: (title: string, type: 'holiday' | 'event' | 'exam' | 'other', description: string) => void;
}) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'holiday' | 'event' | 'exam' | 'other'>('holiday');
  const [description, setDescription] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong rounded-3xl p-6 w-full max-w-md mx-4 border border-border"
      >
        <h3 className="text-base font-semibold text-text mb-4">Add Event</h3>
        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event title (e.g. Holiday, Exam)"
            className="w-full bg-surface-2 border border-border-2 rounded-xl px-4 py-2.5 text-sm text-text outline-none focus:border-primary/40"
            autoFocus
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="w-full bg-surface-2 border border-border-2 rounded-xl px-4 py-2.5 text-sm text-text outline-none focus:border-primary/40"
          >
            <option value="holiday">Holiday</option>
            <option value="event">Event</option>
            <option value="exam">Exam</option>
            <option value="other">Other</option>
          </select>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full bg-surface-2 border border-border-2 rounded-xl px-4 py-2.5 text-sm text-text outline-none focus:border-primary/40 resize-none"
          />
        </div>
        <div className="flex gap-3 mt-5">
          <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={() => title.trim() && onSave(title.trim(), type, description.trim())} disabled={!title.trim()} className="flex-1">
            Save Event
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function LegendItem({ icon, color, label }: { icon: React.ReactNode; color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center', color)}>{icon}</div>
      <span className="text-xs text-text-muted">{label}</span>
    </div>
  );
}
