import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { fadeInUp, staggerContainer } from '@/components/motion';

const faqs = [
  { q: 'Is EduTrack AI free?', a: 'Yes — core features are free during early access. Premium AI features may come later.' },
  { q: 'Does it work offline?', a: 'Attendance and assignments cache locally and sync when you reconnect.' },
  { q: 'Is my data secure?', a: 'All data is encrypted at rest and in transit via Supabase with row-level security.' },
  { q: 'Can I use it on mobile?', a: 'Yes — EduTrack AI is fully responsive and works on desktop, tablet, and mobile browsers.' },
];

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="px-6 py-24">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.p variants={fadeInUp} className="text-sm text-primary font-semibold uppercase tracking-widest mb-4">
            Questions? Answered.
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-4xl font-bold text-text tracking-tight">
            Everything you might wonder
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
          className="space-y-3"
        >
          {faqs.map((item, i) => (
            <motion.div key={i} variants={fadeInUp}>
              <GlassCard className="p-0 overflow-hidden">
                <button
                  onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
                >
                  <span className="text-sm font-semibold text-text">{item.q}</span>
                  <motion.span animate={{ rotate: openIdx === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={18} className="text-primary-light" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {openIdx === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-sm text-text-muted leading-relaxed">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
