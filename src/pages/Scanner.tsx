import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { ScanLine } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/components/motion';

export default function Scanner() {
  return (
    <DashboardLayout title="Scanner">
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
        <motion.div variants={fadeInUp}>
          <GlassCard className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <ScanLine className="text-primary" size={28} />
            </div>
            <h3 className="text-lg font-semibold text-text">Document Scanner</h3>
            <p className="text-sm text-text-muted mt-2 text-center max-w-sm">
              Capture lecture notes, receipts, and forms instantly with built-in OCR. Coming in the next phase.
            </p>
          </GlassCard>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
