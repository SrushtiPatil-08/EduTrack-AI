import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Sparkles, Send } from 'lucide-react';
import { useState } from 'react';
import { fadeInUp, staggerContainer } from '@/components/motion';

export default function AI() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');

  return (
    <DashboardLayout title="AI Assistant">
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
        <motion.div variants={fadeInUp}>
          <GlassCard className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <Sparkles className="text-primary" size={28} />
            </div>
            <h3 className="text-lg font-semibold text-text">AI Study Companion</h3>
            <p className="text-sm text-text-muted mt-2 text-center max-w-sm">
              Your personal AI assistant powered by Groq. Ask questions, get explanations, and study smarter — coming in the next phase.
            </p>
          </GlassCard>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
