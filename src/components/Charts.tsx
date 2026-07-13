import { useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

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

export function AttendanceChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={weeklyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,46,30,0.5)" vertical={false} />
        <XAxis dataKey="day" tick={{ fill: '#4b7a5e', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#4b7a5e', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(16,185,129,0.05)' }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function GPATrend() {
  return (
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
        <Area type="monotone" dataKey="gpa" stroke="#10b981" strokeWidth={2} fill="url(#gpaGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SubjectAttendanceChart() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false });

  return (
    <div ref={ref}>
      <AnimatePresence mode="wait">
        {inView && (
          <motion.div
            key="chart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={subjectData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,46,30,0.5)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#4b7a5e', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#4b7a5e', fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(16,185,129,0.05)' }} />
                <Bar dataKey="attendance" radius={[0, 6, 6, 0]} fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SemesterProgressChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={gpaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,46,30,0.5)" vertical={false} />
        <XAxis dataKey="sem" tick={{ fill: '#4b7a5e', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis domain={[2.5, 4]} tick={{ fill: '#4b7a5e', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey="gpa" stroke="#34d399" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
