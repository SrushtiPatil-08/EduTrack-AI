import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CalendarCheck, ClipboardList, BarChart3, Sparkles, ScanLine, ArrowRight, Clock, TrendingUp } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { fadeInUp, staggerContainer, MotionDiv } from '@/components/motion';
import { AttendanceChart, GPATrend } from '@/components/Charts';

export default function Dashboard() {
  return (
    <DashboardLayout title="Dashboard">
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
        {/* Hero stat row */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Attendance" value="92%" change="+4%" icon={CalendarCheck} color="text-primary" />
          <StatCard label="Pending Tasks" value="3" change="due" icon={ClipboardList} color="text-warning" />
          <StatCard label="Current GPA" value="3.7" change="stable" icon={BarChart3} color="text-info" />
          <StatCard label="AI Queries" value="48" change="+12" icon={Sparkles} color="text-primary-light" />
        </motion.div>

        {/* Charts row */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <GlassCard className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-semibold text-text">Weekly Attendance</h3>
                <p className="text-xs text-text-muted mt-1">Last 7 days overview</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-primary-light">
                <TrendingUp size={14} />
                <span>+4% vs last week</span>
              </div>
            </div>
            <AttendanceChart />
          </GlassCard>

          <GlassCard>
            <h3 className="text-sm font-semibold text-text mb-1">GPA Trend</h3>
            <p className="text-xs text-text-muted mb-6">Semester progression</p>
            <GPATrend />
          </GlassCard>
        </motion.div>

        {/* Navigation cards */}
        <motion.div variants={fadeInUp}>
          <h3 className="text-sm font-semibold text-text mb-4">Quick Access</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <NavCard title="Attendance" icon={CalendarCheck} to="/attendance" />
            <NavCard title="Assignments" icon={ClipboardList} to="/assignments" />
            <NavCard title="Analytics" icon={BarChart3} to="/analytics" />
            <NavCard title="AI Assistant" icon={Sparkles} to="/ai" />
            <NavCard title="Scanner" icon={ScanLine} to="/scanner" />
            <NavCard title="Profile" icon={BarChart3} to="/profile" />
          </div>
        </motion.div>

        {/* Upcoming tests */}
        <motion.div variants={fadeInUp}>
          <h3 className="text-sm font-semibold text-text mb-4">Upcoming Class Tests</h3>
          <GlassCard className="p-0 overflow-hidden">
            {[
              { subject: 'Data Structures', date: 'Jul 15', time: '10:00 AM', color: 'bg-primary' },
              { subject: 'Linear Algebra', date: 'Jul 18', time: '2:00 PM', color: 'bg-warning' },
              { subject: 'Quantum Physics', date: 'Jul 22', time: '11:30 AM', color: 'bg-info' },
            ].map((t, i) => (
              <div key={i} className={`flex items-center gap-4 px-6 py-4 ${i < 2 ? 'border-b border-border' : ''}`}>
                <div className={`w-2.5 h-2.5 rounded-full ${t.color}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-text">{t.subject}</p>
                  <p className="text-xs text-text-muted flex items-center gap-1.5 mt-0.5">
                    <Clock size={12} /> {t.date} · {t.time}
                  </p>
                </div>
                <ArrowRight size={16} className="text-text-muted" />
              </div>
            ))}
          </GlassCard>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}

function StatCard({ label, value, change, icon: Icon, color }: { label: string; value: string; change: string; icon: any; color: string }) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-surface-2 border border-border-2 flex items-center justify-center ${color}`}>
          <Icon size={18} />
        </div>
        <span className="text-xs text-text-muted">{change}</span>
      </div>
      <p className="text-2xl font-bold text-text">{value}</p>
      <p className="text-xs text-text-muted mt-1">{label}</p>
    </GlassCard>
  );
}

function NavCard({ title, icon: Icon, to }: { title: string; icon: any; to: string }) {
  return (
    <Link to={to}>
      <motion.div whileHover={{ y: -4 }} className="glass rounded-2xl p-4 flex flex-col items-center gap-2.5 border border-border hover:border-primary/30 transition-all">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center text-primary">
          <Icon size={18} />
        </div>
        <span className="text-xs text-text-secondary">{title}</span>
      </motion.div>
    </Link>
  );
}
