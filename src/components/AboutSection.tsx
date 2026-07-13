import { motion } from 'framer-motion';
import {
  CalendarCheck, ClipboardList, BarChart3, Sparkles, Bell, Mail,
  ArrowRight, GraduationCap, Zap,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { fadeInUp, staggerContainer, blurReveal } from '@/components/motion';

const workflow = [
  {
    icon: CalendarCheck,
    title: 'Attendance Tracking',
    desc: 'One-tap check-ins with streak detection and real-time class insights. Never lose track of your attendance percentage.',
  },
  {
    icon: ClipboardList,
    title: 'Assignment Management',
    desc: 'Organize, prioritize, and track every assignment. Deadlines are surfaced early so nothing slips through the cracks.',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Assistance',
    desc: 'Ask questions, get explanations, and brainstorm ideas with an AI study companion powered by Groq\'s fast LLMs.',
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    desc: 'Contextual alerts for upcoming classes, pending assignments, and low attendance — delivered exactly when you need them.',
  },
  {
    icon: BarChart3,
    title: 'Live Analytics',
    desc: 'Beautiful charts reveal attendance trends, GPA trajectory, and study patterns to help you make informed decisions.',
  },
  {
    icon: Mail,
    title: 'Email Notifications',
    desc: 'Automated email alerts via Resend keep you informed about deadlines and important updates, even when you\'re offline.',
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="relative px-6 py-24">
      <div className="max-w-6xl mx-auto">
        {/* Intro */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <GraduationCap size={16} className="text-primary" />
            </div>
            <span className="text-sm text-primary font-semibold uppercase tracking-widest">About EduTrack AI</span>
          </motion.div>

          <motion.h2 variants={blurReveal} className="text-4xl font-bold text-text tracking-tight">
            One workspace for the <span className="text-gradient">modern student</span>
          </motion.h2>

          <motion.p variants={fadeInUp} className="text-text-muted mt-4 max-w-2xl mx-auto leading-relaxed">
            EduTrack AI brings together attendance, assignments, analytics, and an AI study companion
            into a single, beautifully designed workspace. Built as a college project to demonstrate
            how modern web technologies can solve real student problems.
          </motion.p>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {workflow.map((item, i) => (
            <motion.div
              key={item.title}
              variants={fadeInUp}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <GlassCard className="h-full">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-surface-2 border border-border-2 flex items-center justify-center text-primary shrink-0">
                    <item.icon size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-text-muted font-mono">0{i + 1}</span>
                    <h3 className="text-base font-semibold text-text">{item.title}</h3>
                  </div>
                </div>
                <p className="text-sm text-text-muted leading-relaxed">{item.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Tech stack */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
          className="mt-16"
        >
          <GlassCard className="p-8">
            <motion.div variants={fadeInUp} className="flex items-center gap-2 mb-6">
              <Zap size={16} className="text-primary" />
              <h3 className="text-sm font-semibold text-text uppercase tracking-widest">Powered by modern tech</h3>
            </motion.div>

            <motion.div variants={fadeInUp} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { name: 'React 19', desc: 'UI framework' },
                { name: 'Supabase', desc: 'Database & Auth' },
                { name: 'Groq AI', desc: 'AI inference' },
                { name: 'Resend', desc: 'Email API' },
                { name: 'Framer Motion', desc: 'Animations' },
                { name: 'Tailwind CSS', desc: 'Styling' },
                { name: 'TypeScript', desc: 'Type safety' },
                { name: 'Vite', desc: 'Build tooling' },
              ].map((tech) => (
                <div key={tech.name} className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-text">{tech.name}</span>
                  <span className="text-xs text-text-muted">{tech.desc}</span>
                </div>
              ))}
            </motion.div>
          </GlassCard>
        </motion.div>

        {/* CTA */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-sm text-text-muted">
            Want to see it in action?{' '}
            <a
              href="#analytics"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#analytics')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-primary-light font-semibold hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              Explore the analytics <ArrowRight size={12} />
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
