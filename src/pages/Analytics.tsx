import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { fadeInUp, staggerContainer } from '@/components/motion';
import { AttendanceChart, GPATrend, SubjectAttendanceChart, SemesterProgressChart } from '@/components/Charts';
import { CalendarCheck, TrendingUp, Award, Target } from 'lucide-react';

export default function Analytics() {
  return (
    <DashboardLayout title="Analytics">
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
        {/* Stat row */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Avg Attendance" value="87%" icon={CalendarCheck} color="text-primary" />
          <StatCard label="Trend" value="+4.2%" icon={TrendingUp} color="text-primary-light" />
          <StatCard label="Best Subject" value="CS" icon={Award} color="text-warning" />
          <StatCard label="Focus Score" value="82" icon={Target} color="text-info" />
        </motion.div>

        {/* Charts grid */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GlassCard>
            <h3 className="text-sm font-semibold text-text mb-1">Weekly Attendance</h3>
            <p className="text-xs text-text-muted mb-6">Last 7 days</p>
            <AttendanceChart />
          </GlassCard>

          <GlassCard>
            <h3 className="text-sm font-semibold text-text mb-1">GPA Trend</h3>
            <p className="text-xs text-text-muted mb-6">By semester</p>
            <GPATrend />
          </GlassCard>

          <GlassCard>
            <h3 className="text-sm font-semibold text-text mb-1">Subject Breakdown</h3>
            <p className="text-xs text-text-muted mb-6">Attendance by subject</p>
            <SubjectAttendanceChart />
          </GlassCard>

          <GlassCard>
            <h3 className="text-sm font-semibold text-text mb-1">Semester Progress</h3>
            <p className="text-xs text-text-muted mb-6">GPA over time</p>
            <SemesterProgressChart />
          </GlassCard>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <GlassCard className="p-5">
      <div className={`w-10 h-10 rounded-xl bg-surface-2 border border-border-2 flex items-center justify-center ${color} mb-3`}>
        <Icon size={18} />
      </div>
      <p className="text-2xl font-bold text-text">{value}</p>
      <p className="text-xs text-text-muted mt-1">{label}</p>
    </GlassCard>
  );
}
