import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { Mail, CalendarCheck, ClipboardList, Award, Settings, LogOut, ChevronRight } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/components/motion';

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <DashboardLayout title="Profile">
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6 max-w-2xl">
        <motion.div variants={fadeInUp} className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-[#052e1a]">
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-text">{user?.name || 'Student'}</h2>
          <p className="text-sm text-text-muted mt-1">{user?.email}</p>
        </motion.div>

        <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-4">
          <GlassCard className="p-4 text-center">
            <p className="text-xl font-bold text-primary-light">92%</p>
            <p className="text-xs text-text-muted mt-1">Attendance</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <p className="text-xl font-bold text-primary-light">18</p>
            <p className="text-xs text-text-muted mt-1">Assignments</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <p className="text-xl font-bold text-primary-light">3.7</p>
            <p className="text-xs text-text-muted mt-1">GPA</p>
          </GlassCard>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <h3 className="text-sm font-semibold text-text mb-3">Account</h3>
          <GlassCard className="p-0 overflow-hidden">
            <Row icon={Mail} label="Email" value={user?.email || ''} />
            <Row icon={CalendarCheck} label="Attendance Rate" value="92%" />
            <Row icon={ClipboardList} label="Pending Tasks" value="3" />
            <Row icon={Award} label="Current GPA" value="3.7" last />
          </GlassCard>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <h3 className="text-sm font-semibold text-text mb-3">Actions</h3>
          <GlassCard className="p-0 overflow-hidden">
            <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-surface-2 transition-colors cursor-pointer">
              <Settings size={18} className="text-text-muted" />
              <span className="text-sm text-text">Settings</span>
              <ChevronRight size={16} className="ml-auto text-text-muted" />
            </button>
            <button onClick={async () => { await signOut(); navigate('/'); }} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-error/10 transition-colors cursor-pointer border-t border-border">
              <LogOut size={18} className="text-error" />
              <span className="text-sm text-error">Sign Out</span>
            </button>
          </GlassCard>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}

function Row({ icon: Icon, label, value, last }: { icon: any; label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-5 py-4 ${!last ? 'border-b border-border' : ''}`}>
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
