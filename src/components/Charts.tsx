import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
} from 'recharts';
import { REPLAY_VIEWPORT } from '@/components/motion';

const weeklyData = [
  { day: 'Mon', value: 85 },
  { day: 'Tue', value: 92 },
  { day: 'Wed', value: 78 },
  { day: 'Thu', value: 95 },
  { day: 'Fri', value: 88 },
  { day: 'Sat', value: 70 },
  { day: 'Sun', value: 65 },
];

const gpaData = [
  { sem: 'S1', gpa: 3.2 },
  { sem: 'S2', gpa: 3.4 },
  { sem: 'S3', gpa: 3.5 },
  { sem: 'S4', gpa: 3.7 },
];

const subjectData = [
  { name: 'CS', attendance: 92 },
  { name: 'Math', attendance: 85 },
  { name: 'Physics', attendance: 78 },
  { name: 'English', attendance: 95 },
  { name: 'Lab', attendance: 88 },
];

const tooltipStyle = {
  backgroundColor: 'rgba(17,24,17,0.95)',
  border: '1px solid rgba(16,185,129,0.2)',
  borderRadius: '12px',
  fontSize: '12px',
  color: '#f0fdf4',
};

// Hook: replay key increments every time element enters viewport
function useReplayKey() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, REPLAY_VIEWPORT);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (inView) setKey((k) => k + 1);
  }, [inView]);

  return { ref, key };
}

// Animated counter that replays on in-view
function AnimatedCounter({ value, suffix = '', duration = 1.2 }: { value: number; suffix?: string; duration?: number }) {
  const { ref, key } = useReplayKey();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (key === 0) return;
    setDisplay(0);
    const steps = 40;
    const stepDuration = (duration * 1000) / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      const progress = current / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value * 10) / 10);
      if (current >= steps) clearInterval(interval);
    }, stepDuration);
    return () => clearInterval(interval);
  }, [key, value, duration]);

  return (
    <div ref={ref}>
      <span className="text-3xl font-bold text-text">
        {Number.isInteger(value) ? Math.round(display) : display.toFixed(1)}
        {suffix}
      </span>
    </div>
  );
}

// Progress bar that replays on in-view
function AnimatedProgress({ value, label, color = 'bg-primary' }: { value: number; label: string; color?: string }) {
  const { ref, key } = useReplayKey();

  return (
    <div ref={ref} key={key}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-text-muted">{label}</span>
        <span className="text-xs font-semibold text-text">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-surface-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

export function AttendanceChart() {
  const { ref, key } = useReplayKey();

  return (
    <div ref={ref} className="w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,46,30,0.5)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#4b7a5e', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4b7a5e', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(16,185,129,0.05)' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#10b981" isAnimationActive animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function GPATrend() {
  const { ref, key } = useReplayKey();

  return (
    <div ref={ref} className="w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={gpaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gpaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,46,30,0.5)" vertical={false} />
              <XAxis dataKey="sem" tick={{ fill: '#4b7a5e', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[2.5, 4]} tick={{ fill: '#4b7a5e', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="gpa" stroke="#10b981" strokeWidth={2} fill="url(#gpaGrad)" isAnimationActive animationDuration={900} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function SubjectAttendanceChart() {
  const { ref, key } = useReplayKey();

  return (
    <div ref={ref} className="w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={subjectData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,46,30,0.5)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#4b7a5e', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#4b7a5e', fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(16,185,129,0.05)' }} />
              <Bar dataKey="attendance" radius={[0, 6, 6, 0]} fill="#10b981" isAnimationActive animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function SemesterProgressChart() {
  const { ref, key } = useReplayKey();

  return (
    <div ref={ref} className="w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={gpaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,46,30,0.5)" vertical={false} />
              <XAxis dataKey="sem" tick={{ fill: '#4b7a5e', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[2.5, 4]} tick={{ fill: '#4b7a5e', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="gpa" stroke="#34d399" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} isAnimationActive animationDuration={900} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export { AnimatedCounter, AnimatedProgress };
