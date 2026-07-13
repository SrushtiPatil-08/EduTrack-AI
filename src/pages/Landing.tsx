import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  CalendarCheck, ClipboardList, BarChart3, Sparkles, ScanLine,
  Mail, ArrowRight, Star, ChevronDown, Zap,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { fadeInUp, blurReveal, staggerContainer, MotionDiv, MotionSection } from '@/components/motion';
import HeroCards from '@/components/HeroCards';
import FeaturesSection from '@/components/FeaturesSection';
import AnalyticsSection from '@/components/AnalyticsSection';
import AboutSection from '@/components/AboutSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import FAQSection from '@/components/FAQSection';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-bg overflow-x-hidden">
      <Navbar />

      {/* ── Hero ── */}
      <section id="home" className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-24 pb-20 overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 bg-grid opacity-100 pointer-events-none" />
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/4" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/4" />

        {/* Binary texture panel - right side */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 pointer-events-none overflow-hidden opacity-20 select-none hidden lg:flex flex-col justify-center pr-4">
          <BinaryTexture />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-center"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
              <Badge className="mb-8 gap-2 py-1.5 px-4 text-xs">
                <Sparkles size={12} />
                AI-powered student workspace
              </Badge>
            </motion.div>

            {/* Hero headline */}
            <motion.h1
              variants={blurReveal}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-text mb-6"
            >
              Your campus,{' '}
              <span className="block">
                mastered{' '}
                <em className="not-italic text-gradient">with AI.</em>
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-text-muted max-w-xl leading-relaxed mb-10"
            >
              Attendance, assignments, analytics, and an AI study companion —
              all in one beautiful, glass-styled workspace built for modern students.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(16,185,129,0.45)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/signup')}
                className="inline-flex items-center gap-2 h-14 px-8 rounded-full bg-primary text-[#052e1a] font-semibold text-base transition-all duration-200 cursor-pointer"
              >
                Get started free
                <ArrowRight size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 h-14 px-8 rounded-full glass border border-primary/20 text-text-secondary text-base font-medium transition-all hover:border-primary/40 cursor-pointer"
              >
                Sign in
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Floating hero UI cards */}
          <HeroCards />
        </div>
      </section>

      <FeaturesSection />
      <AnalyticsSection />
      <AboutSection />
      <TestimonialsSection />
      <FAQSection />
      <Footer />
    </div>
  );
}

function BinaryTexture() {
  const rows = Array.from({ length: 40 }, (_, i) =>
    Array.from({ length: 24 }, () => (Math.random() > 0.5 ? '1' : '0')).join(' ')
  );
  return (
    <div className="font-mono text-[10px] text-primary leading-5 space-y-0">
      {rows.map((r, i) => <div key={i}>{r}</div>)}
    </div>
  );
}

function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="border-t border-border px-6 py-12 text-center">
      <div className="max-w-4xl mx-auto">
        <p className="text-text-muted text-sm">© 2026 EduTrack AI. Built for students, by students.</p>
        <div className="flex items-center justify-center gap-6 mt-4">
          <button onClick={() => navigate('/login')} className="text-sm text-text-secondary hover:text-primary transition-colors cursor-pointer">Sign in</button>
          <button onClick={() => navigate('/signup')} className="text-sm text-text-secondary hover:text-primary transition-colors cursor-pointer">Sign up</button>
        </div>
      </div>
    </footer>
  );
}
