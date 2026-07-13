import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Moon, Bell, Globe, Shield, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fadeInUp, staggerContainer } from '@/components/motion';
import { cn } from '@/lib/utils';

export default function Settings() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);

  return (
    <DashboardLayout title="Settings">
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6 max-w-2xl">
        <motion.div variants={fadeInUp}>
          <h3 className="text-sm font-semibold text-text mb-3">Preferences</h3>
          <GlassCard className="p-0 overflow-hidden">
            <SettingRow icon={Moon} label="Dark Mode" value="On" />
            <SettingToggleRow icon={Bell} label="Notifications" value={notifications} onToggle={() => setNotifications(v => !v)} />
            <SettingRow icon={Globe} label="Language" value="English" last />
          </GlassCard>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <h3 className="text-sm font-semibold text-text mb-3">Support</h3>
          <GlassCard className="p-0 overflow-hidden">
            <SettingNavRow icon={Shield} label="Privacy & Security" />
            <SettingNavRow icon={HelpCircle} label="Help & Support" last />
          </GlassCard>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <button
            onClick={async () => { await signOut(); navigate('/'); }}
            className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-error/10 border border-error/30 text-error font-semibold hover:bg-error/20 transition-all cursor-pointer"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </motion.div>

        <p className="text-center text-xs text-text-muted">EduTrack AI v1.0.0 · Phase 1 Foundation</p>
      </motion.div>
    </DashboardLayout>
  );
}

function SettingRow({ icon: Icon, label, value, last }: { icon: any; label: string; value: string; last?: boolean }) {
  return (
    <div className={cn('flex items-center justify-between px-5 py-4', !last && 'border-b border-border')}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-surface-2 border border-border-2 flex items-center justify-center">
          <Icon size={16} className="text-primary-light" />
        </div>
        <span className="text-sm text-text">{label}</span>
      </div>
      <span className="text-sm text-text-muted">{value}</span>
    </div>
  );
}

function SettingToggleRow({ icon: Icon, label, value, onToggle }: { icon: any; label: string; value: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-border">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-surface-2 border border-border-2 flex items-center justify-center">
          <Icon size={16} className="text-primary-light" />
        </div>
        <span className="text-sm text-text">{label}</span>
      </div>
      <button
        onClick={onToggle}
        className={cn('w-12 h-7 rounded-full p-1 transition-colors cursor-pointer', value ? 'bg-primary' : 'bg-surface-3')}
      >
        <motion.div
          animate={{ x: value ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="w-5 h-5 rounded-full bg-white shadow-md"
        />
      </button>
    </div>
  );
}

function SettingNavRow({ icon: Icon, label, last }: { icon: any; label: string; last?: boolean }) {
  return (
    <button className={cn('w-full flex items-center justify-between px-5 py-4 hover:bg-surface-2 transition-colors cursor-pointer', !last && 'border-b border-border')}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-surface-2 border border-border-2 flex items-center justify-center">
          <Icon size={16} className="text-primary-light" />
        </div>
        <span className="text-sm text-text">{label}</span>
      </div>
      <span className="text-text-muted">›</span>
    </button>
  );
}
