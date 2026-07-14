import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Moon, Bell, Globe, Shield, HelpCircle, LogOut, Save, Check, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fadeInUp, staggerContainer, REPLAY_VIEWPORT } from '@/components/motion';
import { updateProfile } from '@/services/db';
import { cn } from '@/lib/utils';

export default function Settings() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: '',
    college_name: '',
    branch: '',
    semester: 1,
    academic_year: '',
    attendance_goal: 75,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        college_name: profile.college_name || '',
        branch: profile.branch || '',
        semester: profile.semester || 1,
        academic_year: profile.academic_year || '',
        attendance_goal: profile.attendance_goal || 75,
      });
    }
  }, [profile]);

  const update = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    setError(null);
    const { error: err } = await updateProfile(user.id, form);
    setSaving(false);
    if (err) {
      setError(err);
    } else {
      setSaved(true);
      await refreshProfile();
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <DashboardLayout title="Settings">
      <motion.div initial="hidden" whileInView="visible" viewport={REPLAY_VIEWPORT} variants={staggerContainer} className="space-y-6 max-w-2xl">
        {/* Profile editing */}
        <motion.div variants={fadeInUp}>
          <h3 className="text-sm font-semibold text-text mb-3">Profile</h3>
          <GlassCard>
            <div className="space-y-4">
              <Input
                id="full_name"
                label="Full Name"
                type="text"
                value={form.full_name}
                onChange={(e) => update('full_name', e.target.value)}
              />
              <Input
                id="college_name"
                label="College / University"
                type="text"
                value={form.college_name}
                onChange={(e) => update('college_name', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="branch"
                  label="Branch / Major"
                  type="text"
                  value={form.branch}
                  onChange={(e) => update('branch', e.target.value)}
                />
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Semester</label>
                  <select
                    value={form.semester}
                    onChange={(e) => update('semester', Number(e.target.value))}
                    className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-border-2 text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="academic_year"
                  label="Academic Year"
                  type="text"
                  placeholder="2025-2026"
                  value={form.academic_year}
                  onChange={(e) => update('academic_year', e.target.value)}
                />
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Attendance Goal</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={50}
                      max={100}
                      value={form.attendance_goal}
                      onChange={(e) => update('attendance_goal', Number(e.target.value))}
                      className="flex-1 accent-primary cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-text w-12 text-right">{form.attendance_goal}%</span>
                  </div>
                </div>
              </div>

              {error && <p className="text-sm text-error">{error}</p>}

              <div className="flex items-center gap-3 pt-2">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : saved ? (
                    <><Check size={16} /> Saved!</>
                  ) : (
                    <><Save size={16} /> Save Changes</>
                  )}
                </Button>
                {saved && <span className="text-sm text-primary-light">Profile updated successfully</span>}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Preferences */}
        <motion.div variants={fadeInUp}>
          <h3 className="text-sm font-semibold text-text mb-3">Preferences</h3>
          <GlassCard className="p-0 overflow-hidden">
            <SettingRow icon={Moon} label="Dark Mode" value="On" />
            <SettingToggleRow icon={Bell} label="Notifications" value={notifications} onToggle={() => setNotifications(v => !v)} />
            <SettingRow icon={Globe} label="Language" value="English" last />
          </GlassCard>
        </motion.div>

        {/* Support */}
        <motion.div variants={fadeInUp}>
          <h3 className="text-sm font-semibold text-text mb-3">Support</h3>
          <GlassCard className="p-0 overflow-hidden">
            <SettingNavRow icon={Shield} label="Privacy & Security" />
            <SettingNavRow icon={HelpCircle} label="Help & Support" last />
          </GlassCard>
        </motion.div>

        {/* Sign out */}
        <motion.div variants={fadeInUp}>
          <button
            onClick={async () => { await signOut(); navigate('/'); }}
            className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-error/10 border border-error/30 text-error font-semibold hover:bg-error/20 transition-all cursor-pointer"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </motion.div>

        <p className="text-center text-xs text-text-muted">EduTrack AI v1.0.0 · Phase 2 Student Platform</p>
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
