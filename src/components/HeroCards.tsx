import { motion } from 'framer-motion';
import { CalendarCheck, Sparkles, BarChart3, ScanLine, ClipboardList } from 'lucide-react';

export default function HeroCards() {
  return (
    <div className="relative mt-16 h-80 mx-auto w-full max-w-3xl hidden sm:block">
      {/* Left card — Attendance chat bubble */}
      <motion.div
        initial={{ opacity: 0, x: -60, rotate: -4 }}
        animate={{ opacity: 1, x: 0, rotate: -6 }}
        transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ animationName: 'float', animationDuration: '6s', animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out' }}
        className="absolute left-0 top-4 w-72 animate-float"
      >
        <div className="glass rounded-2xl p-4 border border-primary/15 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
              <CalendarCheck size={12} className="text-primary" />
            </div>
            <span className="text-xs text-text-muted font-medium">attendance</span>
          </div>
          <div className="space-y-2">
            <div className="text-xs text-text-secondary bg-surface-2 rounded-lg px-3 py-2 inline-block">
              as a user, i want to track my class attendance
            </div>
            <div className="flex justify-end">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <span className="text-xs text-primary font-bold">✓</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Center bottom — Dashboard card */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-1/2 -translate-x-1/2 bottom-0 w-80"
        style={{ animationDelay: '2s' }}
      >
        <div className="glass rounded-2xl border border-primary/15 shadow-[0_16px_48px_rgba(0,0,0,0.6)] overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center gap-2 border-b border-border">
            <div className="w-2 h-2 rounded-full bg-error" />
            <div className="w-2 h-2 rounded-full bg-warning" />
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-xs text-text-muted ml-2">backend · API</span>
          </div>
          <div className="p-4 space-y-2">
            {[
              { label: 'Attendance', val: '92%', color: 'text-primary' },
              { label: 'Assignments', val: '3 due', color: 'text-warning' },
              { label: 'GPA', val: '3.7', color: 'text-info' },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                  <span className="text-xs text-text-muted">{s.label}</span>
                </div>
                <span className={`text-xs font-semibold ${s.color}`}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right card — AI assistant */}
      <motion.div
        initial={{ opacity: 0, x: 60, rotate: 4 }}
        animate={{ opacity: 1, x: 0, rotate: 6 }}
        transition={{ delay: 0.7, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="absolute right-0 top-4 w-72 animate-float"
        style={{ animationDelay: '1s' }}
      >
        <div className="glass rounded-2xl p-4 border border-primary/15 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles size={12} className="text-primary" />
            </div>
            <span className="text-xs text-text-muted font-medium">AI assistant · backend</span>
          </div>
          <div className="text-xs text-text-secondary bg-surface-2 rounded-lg px-3 py-2">
            as an SDR, i want to log my conversation so that it is available to the rest of the team
          </div>
          <div className="flex gap-2 mt-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <BarChart3 size={12} className="text-primary" />
            </div>
            <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center">
              <Sparkles size={12} className="text-primary/60" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
