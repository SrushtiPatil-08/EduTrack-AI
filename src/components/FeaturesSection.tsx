import { motion } from 'framer-motion';
import { CalendarCheck, ClipboardList, BarChart3, Sparkles, ScanLine, Mail } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { fadeInUp, staggerContainer, REPLAY_VIEWPORT } from '@/components/motion';

const features = [
  { icon: CalendarCheck, title: 'Smart Attendance', desc: 'One-tap check-ins with streaks, conflict detection, and real-time class insights.', color: 'text-primary' },
  { icon: ClipboardList, title: 'Assignments Hub', desc: 'Never miss a deadline. Organize, prioritize, and track progress on every task.', color: 'text-warning' },
  { icon: BarChart3, title: 'Live Analytics', desc: 'Beautiful charts that reveal attendance trends, GPA trajectory, and study patterns.', color: 'text-info' },
  { icon: Sparkles, title: 'AI Assistant', desc: 'Ask anything. Get instant, contextual answers powered by Groq\'s blazing-fast LLMs.', color: 'text-primary' },
  { icon: ScanLine, title: 'Document Scanner', desc: 'Capture lecture notes, receipts, and forms instantly with built-in OCR.', color: 'text-primary-light' },
  { icon: Mail, title: 'Email Automation', desc: 'Send professor emails, group outreach, and reminders with Resend-powered automation.', color: 'text-text-secondary' },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative px-6 py-24">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={REPLAY_VIEWPORT}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.p variants={fadeInUp} className="text-sm text-primary font-semibold uppercase tracking-widest mb-4">
            Everything you need
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-4xl font-bold text-text tracking-tight">
            Built for the modern student
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-text-muted mt-4 max-w-xl mx-auto">
            One workspace to replace the chaos of scattered apps, spreadsheets, and sticky notes.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={REPLAY_VIEWPORT}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeInUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <GlassCard className="h-full">
                <div className={`w-11 h-11 rounded-2xl bg-surface-2 border border-border-2 flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon size={20} />
                </div>
                <h3 className="text-base font-semibold text-text mb-2">{f.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{f.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
