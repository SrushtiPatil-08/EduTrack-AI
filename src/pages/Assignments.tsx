import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { ClipboardList, Clock, CheckCircle2 } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/components/motion';

export default function Assignments() {
  return (
    <DashboardLayout title="Assignments">
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
        <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <GlassCard className="p-5">
            <ClipboardList className="text-warning mb-3" size={20} />
            <p className="text-2xl font-bold text-text">3</p>
            <p className="text-xs text-text-muted mt-1">Pending</p>
          </GlassCard>
          <GlassCard className="p-5">
            <CheckCircle2 className="text-primary mb-3" size={20} />
            <p className="text-2xl font-bold text-text">18</p>
            <p className="text-xs text-text-muted mt-1">Completed</p>
          </GlassCard>
          <GlassCard className="p-5">
            <Clock className="text-info mb-3" size={20} />
            <p className="text-2xl font-bold text-text">2</p>
            <p className="text-xs text-text-muted mt-1">Due This Week</p>
          </GlassCard>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <GlassCard className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-warning/10 border border-warning/20 flex items-center justify-center mb-4">
              <ClipboardList className="text-warning" size={28} />
            </div>
            <h3 className="text-lg font-semibold text-text">Assignments Hub</h3>
            <p className="text-sm text-text-muted mt-2 text-center max-w-sm">
              Organize, prioritize, and conquer every deadline. Full assignment management coming in the next phase.
            </p>
          </GlassCard>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
