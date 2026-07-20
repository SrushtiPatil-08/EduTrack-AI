import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertTriangle, CheckCircle, Clock, TrendingDown } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { fadeInUp, REPLAY_VIEWPORT } from '@/components/motion';
import { cn } from '@/lib/utils';
import { getAttendance, getSubjects, calculateRiskSubjects, calculateTodaysAttendance } from '@/services/db';
import type { AttendanceRecord, Subject } from '@/services/db';

type Reminder = {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  icon: 'alert' | 'clock' | 'check' | 'trend';
};

export default function Reminders({ userId, goal }: { userId: string; goal: number }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    (async () => {
      const [attRes, subRes] = await Promise.all([
        getAttendance(userId),
        getSubjects(userId),
      ]);
      if (!active) return;
      const attendance = (attRes.attendance as AttendanceRecord[]) || [];
      const subjects = (subRes.subjects as Subject[]) || [];
      const list: Reminder[] = [];

      const today = calculateTodaysAttendance(attendance);
      if (today.conducted === 0 && subjects.length > 0) {
        list.push({
          id: 'today-pending',
          type: 'info',
          title: "Today's attendance pending",
          message: "You haven't marked any attendance for today yet.",
          icon: 'clock',
        });
      }

      const risks = calculateRiskSubjects(attendance, subjects, goal);
      for (const r of risks.slice(0, 2)) {
        list.push({
          id: `risk-${r.id}`,
          type: 'warning',
          title: `${r.name} below goal`,
          message: `Current: ${r.pct}%. You need ${r.lecturesRequired} more lecture${r.lecturesRequired !== 1 ? 's' : ''} to reach ${goal}%.`,
          icon: 'alert',
        });
      }

      for (const s of subjects) {
        const records = attendance
          .filter((a) => a.subject_id === s.id && (a.status === 'present' || a.status === 'absent'))
          .sort((a, b) => a.date.localeCompare(b.date));
        let streak = 0;
        let maxStreak = 0;
        for (const r of records) {
          if (r.status === 'absent') { streak++; maxStreak = Math.max(maxStreak, streak); }
          else streak = 0;
        }
        if (maxStreak >= 3) {
          list.push({
            id: `streak-${s.id}`,
            type: 'warning',
            title: `Consecutive absences in ${s.name}`,
            message: `You've been absent ${maxStreak} times in a row. Consider attending the next lecture.`,
            icon: 'trend',
          });
        }
      }

      const overallPresent = attendance.filter((a) => a.status === 'present').length;
      const overallConducted = overallPresent + attendance.filter((a) => a.status === 'absent').length;
      if (overallConducted > 0) {
        const overallPct = Math.round((overallPresent / overallConducted) * 100);
        if (overallPct < goal) {
          list.push({
            id: 'overall-below-goal',
            type: 'warning',
            title: 'Overall attendance below goal',
            message: `Your overall attendance is ${overallPct}%, below your goal of ${goal}%.`,
            icon: 'alert',
          });
        } else {
          list.push({
            id: 'overall-on-track',
            type: 'success',
            title: "You're on track!",
            message: `Overall attendance ${overallPct}% — meeting your goal of ${goal}%.`,
            icon: 'check',
          });
        }
      }

      setReminders(list);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [userId, goal]);

  const visible = reminders.filter((r) => !dismissed.has(r.id));
  if (loading || visible.length === 0) return null;

  const iconMap = {
    alert: AlertTriangle,
    clock: Clock,
    check: CheckCircle,
    trend: TrendingDown,
  };

  return (
    <motion.div initial="hidden" whileInView="visible" viewport={REPLAY_VIEWPORT} variants={fadeInUp}>
      <div className="flex items-center gap-2 mb-3">
        <Bell size={16} className="text-primary" />
        <h3 className="text-sm font-semibold text-text">Reminders</h3>
      </div>
      <div className="space-y-2">
        <AnimatePresence>
          {visible.map((r) => {
            const Icon = iconMap[r.icon];
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <GlassCard className="flex items-start gap-3 py-3 px-4">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                    r.type === 'warning' ? 'bg-warning/15 text-warning'
                      : r.type === 'success' ? 'bg-primary/15 text-primary-light'
                      : 'bg-info/15 text-info',
                  )}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text">{r.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">{r.message}</p>
                  </div>
                  <button
                    onClick={() => setDismissed((prev) => new Set(prev).add(r.id))}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-text-muted hover:text-text transition-colors shrink-0"
                  >
                    <X size={12} />
                  </button>
                </GlassCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
