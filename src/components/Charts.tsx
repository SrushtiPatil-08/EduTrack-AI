import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Cell,
  PieChart, Pie, Legend, RadialBarChart, RadialBar,
} from 'recharts';
import { REPLAY_VIEWPORT } from '@/components/motion';

const tooltipStyle = {
  backgroundColor: 'rgba(17,24,17,0.95)',
  border: '1px solid rgba(16,185,129,0.2)',
  borderRadius: '12px',
  fontSize: '12px',
  color: '#f0fdf4',
};

function useReplayKey() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, REPLAY_VIEWPORT);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (inView) setKey((k) => k + 1);
  }, [inView]);

  return { ref, key };
}

export function GPATrend({ data = DEFAULT_GPA }: { data?: { label: string; gpa: number }[] }) {
  const { ref, key } = useReplayKey();

  return (
    <div ref={ref} className="w-full">
      <AnimatePresence mode="wait">
        <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,46,30,0.5)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#4b7a5e', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 4]} tick={{ fill: '#4b7a5e', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="gpa" stroke="#34d399" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} isAnimationActive animationDuration={900} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function AnimatedCounter({ value, suffix = '', duration = 1.2 }: { value: number; suffix?: string; duration?: number }) {
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

export function AnimatedProgress({ value, label, color = 'bg-primary' }: { value: number; label: string; color?: string }) {
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

const DEFAULT_WEEKLY = [
  { day: 'Mon', value: 85 },
  { day: 'Tue', value: 92 },
  { day: 'Wed', value: 78 },
  { day: 'Thu', value: 88 },
  { day: 'Fri', value: 95 },
  { day: 'Sat', value: 70 },
  { day: 'Sun', value: 0 },
];

const DEFAULT_MONTHLY = [
  { month: 'Feb', value: 82 },
  { month: 'Mar', value: 85 },
  { month: 'Apr', value: 79 },
  { month: 'May', value: 88 },
  { month: 'Jun', value: 91 },
  { month: 'Jul', value: 86 },
];

const DEFAULT_SUBJECTS = [
  { name: 'Math', attendance: 92, color: '#10b981' },
  { name: 'Physics', attendance: 78, color: '#3b82f6' },
  { name: 'Chem', attendance: 85, color: '#f59e0b' },
  { name: 'CS', attendance: 95, color: '#ef4444' },
];

const DEFAULT_SEMESTER = [
  { label: 'S1', pct: 82 },
  { label: 'S2', pct: 85 },
  { label: 'S3', pct: 79 },
  { label: 'S4', pct: 88 },
];

const DEFAULT_GPA = [
  { label: 'S1', gpa: 3.2 },
  { label: 'S2', gpa: 3.5 },
  { label: 'S3', gpa: 3.4 },
  { label: 'S4', gpa: 3.7 },
  { label: 'S5', gpa: 3.8 },
];

export function AttendanceChart({ data = DEFAULT_WEEKLY }: { data?: { day: string; value: number }[] }) {
  const { ref, key } = useReplayKey();

  return (
    <div ref={ref} className="w-full">
      <AnimatePresence mode="wait">
        <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,46,30,0.5)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#4b7a5e', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#4b7a5e', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(16,185,129,0.05)' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#10b981" isAnimationActive animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function MonthlyTrendChart({ data = DEFAULT_MONTHLY }: { data?: { month: string; value: number }[] }) {
  const { ref, key } = useReplayKey();

  return (
    <div ref={ref} className="w-full">
      <AnimatePresence mode="wait">
        <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,46,30,0.5)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#4b7a5e', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#4b7a5e', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#attGrad)" isAnimationActive animationDuration={900} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function SubjectAttendanceChart({ data = DEFAULT_SUBJECTS }: { data?: { name: string; attendance: number; color: string }[] }) {
  const { ref, key } = useReplayKey();

  return (
    <div ref={ref} className="w-full">
      <AnimatePresence mode="wait">
        <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,46,30,0.5)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#4b7a5e', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#4b7a5e', fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(16,185,129,0.05)' }} />
              <Bar dataKey="attendance" radius={[0, 6, 6, 0]} isAnimationActive animationDuration={800}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color || '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function SemesterProgressChart({ data = DEFAULT_SEMESTER }: { data?: { label: string; pct: number }[] }) {
  const { ref, key } = useReplayKey();

  return (
    <div ref={ref} className="w-full">
      <AnimatePresence mode="wait">
        <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,46,30,0.5)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#4b7a5e', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#4b7a5e', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="pct" stroke="#34d399" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} isAnimationActive animationDuration={900} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function AttendanceDistributionChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  const { ref, key } = useReplayKey();

  return (
    <div ref={ref} className="w-full">
      <AnimatePresence mode="wait">
        <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={3}
                isAnimationActive
                animationDuration={900}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#4b7a5e' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function GoalProgressChart({ pct, goal }: { pct: number; goal: number }) {
  const { ref, key } = useReplayKey();
  const progress = Math.min(100, goal > 0 ? (pct / goal) * 100 : 0);
  const data = [{ name: 'Progress', value: progress }, { name: 'Remaining', value: Math.max(0, 100 - progress) }];

  return (
    <div ref={ref} className="w-full">
      <AnimatePresence mode="wait">
        <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart data={data} innerRadius="60%" outerRadius="100%" startAngle={90} endAngle={-270}>
              <RadialBar dataKey="value" cornerRadius={8} fill="#10b981" background={{ fill: 'rgba(30,46,30,0.4)' }} isAnimationActive animationDuration={900} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="text-center -mt-32">
            <p className="text-2xl font-bold text-text">{pct}%</p>
            <p className="text-xs text-text-muted">Goal: {goal}%</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
