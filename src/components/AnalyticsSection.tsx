import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { fadeInUp, staggerContainer, blurReveal, REPLAY_VIEWPORT } from '@/components/motion';
import { AttendanceChart, GPATrend } from '@/components/Charts';

export default function AnalyticsSection() {
  return (
    <section id="analytics" className="relative px-6 py-24">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={REPLAY_VIEWPORT}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.p variants={fadeInUp} className="text-sm text-primary font-semibold uppercase tracking-widest mb-4">
            Data-driven insights
          </motion.p>
          <motion.h2 variants={blurReveal} className="text-4xl font-bold text-text tracking-tight">
            Analytics that actually <span className="text-gradient">matter</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-text-muted mt-4 max-w-xl mx-auto">
            See your semester at a glance. Beautiful charts reveal attendance trends, GPA trajectory, and study patterns.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={REPLAY_VIEWPORT}
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-2 gap-5"
        >
          <motion.div variants={fadeInUp} whileHover={{ y: -4 }}>
            <GlassCard className="h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                    <BarChart3 size={16} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text">Weekly Attendance</h3>
                    <p className="text-xs text-text-muted">Last 7 days</p>
                  </div>
                </div>
                <Badge variant="success" className="gap-1">
                  <TrendingUp size={10} /> +4%
                </Badge>
              </div>
              <AttendanceChart />
            </GlassCard>
          </motion.div>

          <motion.div variants={fadeInUp} whileHover={{ y: -4 }}>
            <GlassCard className="h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                    <Sparkles size={16} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text">GPA Trajectory</h3>
                    <p className="text-xs text-text-muted">Semester progression</p>
                  </div>
                </div>
                <Badge variant="info">3.7</Badge>
              </div>
              <GPATrend />
            </GlassCard>
          </motion.div>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={REPLAY_VIEWPORT}
          className="text-center mt-12"
        >
          <p className="text-sm text-text-muted">
            Full analytics dashboard available after sign up —{' '}
            <a href="#about" onClick={(e) => { e.preventDefault(); document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-primary-light font-semibold hover:text-primary transition-colors">
              learn more
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
