import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { fadeInUp, staggerContainer, REPLAY_VIEWPORT } from '@/components/motion';

const testimonials = [
  { name: 'Sara K.', role: 'CS Major', text: 'I finally stopped missing assignments. The AI assistant is a lifesaver during finals week.' },
  { name: 'Daniel R.', role: 'Pre-Med', text: 'Attendance tracking alone saved my grade. The dashboard is absolutely gorgeous too.' },
  { name: 'Aisha M.', role: 'Engineering', text: 'The scanner + email combo means I send lab reports in seconds. Total game changer.' },
];

export default function TestimonialsSection() {
  return (
    <section className="px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={REPLAY_VIEWPORT}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.p variants={fadeInUp} className="text-sm text-primary font-semibold uppercase tracking-widest mb-4">
            Loved by students
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-4xl font-bold text-text tracking-tight">
            Don't just take our word for it
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={REPLAY_VIEWPORT}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {testimonials.map((t) => (
            <motion.div key={t.name} variants={fadeInUp}>
              <GlassCard className="h-full">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className="text-warning fill-warning" />
                  ))}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-light">{t.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text">{t.name}</p>
                    <p className="text-xs text-text-muted">{t.role}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
