import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { CalendarCheck, Clock, TrendingUp } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/components/motion';

export default function Attendance() {
  return (
    <DashboardLayout title="Attendance">
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
        <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <GlassCard className="p-5">
            <CalendarCheck className="text-primary mb-3" size={20} />
            <p className="text-2xl font-bold text-text">92%</p>
            <p className="text-xs text-text-muted mt-1">Overall Attendance</p>
          </GlassCard>
          <GlassCard className="p-5">
            <Clock className="text-warning mb-3" size={20} />
            <p className="text-2xl font-bold text-text">14</p>
            <p className="text-xs text-text-muted mt-1">Classes This Week</p>
          </GlassCard>
          <GlassCard className="p-5">
            <TrendingUp className="text-info mb-3" size={20} />
            <p className="text-2xl font-bold text-text">+4%</p>
            <p className="text-xs text-text-muted mt-1">Vs Last Month</p>
          </GlassCard>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <GlassCard className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <CalendarCheck className="text-primary" size={28} />
            </div>
            <h3 className="text-lg font-semibold text-text">Attendance Tracking</h3>
            <p className="text-sm text-text-muted mt-2 text-center max-w-sm">
              One-tap check-ins, streaks, and real-time attendance tracking will be available here in the next phase.
            </p>
          </GlassCard>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
