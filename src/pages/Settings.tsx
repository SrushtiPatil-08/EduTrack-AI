import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Moon, Bell, Globe, Shield, HelpCircle, LogOut, Save, Check, User, Hash, Award, Users, Phone, Calendar, Link as LinkIcon, Github, Linkedin } from 'lucide-react';
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
    roll_number: '',
    degree: 'B.Tech',
    section: '',
    batch_year: new Date().getFullYear(),
    phone: '',
    date_of_birth: '',
    gender: 'prefer_not_to_say' as 'male' | 'female' | 'other' | 'prefer_not_to_say',
    bio: '',
    linkedin_url: '',
    github_url: '',
    current_cgpa: '' as string | number,
    target_cgpa: '' as string | number,
    guardian_name: '',
    guardian_phone: '',
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
        roll_number: profile.roll_number || '',
        degree: profile.degree || 'B.Tech',
        section: profile.section || '',
        batch_year: profile.batch_year || new Date().getFullYear(),
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth || '',
        gender: profile.gender || 'prefer_not_to_say',
        bio: profile.bio || '',
        linkedin_url: profile.linkedin_url || '',
        github_url: profile.github_url || '',
        current_cgpa: profile.current_cgpa ?? '',
        target_cgpa: profile.target_cgpa ?? '',
        guardian_name: profile.guardian_name || '',
        guardian_phone: profile.guardian_phone || '',
      });
    }
  }, [profile]);

  const update = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    setError(null);
    const payload = {
      ...form,
      batch_year: Number(form.batch_year) || null,
      current_cgpa: form.current_cgpa === '' ? null : Number(form.current_cgpa),
      target_cgpa: form.target_cgpa === '' ? null : Number(form.target_cgpa),
      date_of_birth: form.date_of_birth || null,
    };
    const { error: err } = await updateProfile(user.id, payload);
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

        {/* Academic Setup */}
        <motion.div variants={fadeInUp}>
          <h3 className="text-sm font-semibold text-text mb-3">Academic Setup</h3>
          <GlassCard>
            <div className="space-y-4">
              <Input
                id="roll_number"
                label="Roll / Enrollment Number"
                type="text"
                placeholder="e.g. 21CS0101"
                value={form.roll_number}
                onChange={(e) => update('roll_number', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Degree</label>
                  <select
                    value={form.degree}
                    onChange={(e) => update('degree', e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-border-2 text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                  >
                    {['B.Tech','M.Tech','B.E.','M.E.','B.Sc','M.Sc','B.Com','M.Com','B.A.','M.A.','BCA','MCA','BBA','MBA','Ph.D','Other'].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <Input
                  id="section"
                  label="Section"
                  type="text"
                  placeholder="e.g. A"
                  value={form.section}
                  onChange={(e) => update('section', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="batch_year"
                  label="Batch Year"
                  type="number"
                  placeholder="e.g. 2023"
                  value={form.batch_year}
                  onChange={(e) => update('batch_year', e.target.value)}
                />
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => update('gender', e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-border-2 text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                  >
                    <option value="prefer_not_to_say">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="current_cgpa"
                  label="Current CGPA"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  placeholder="e.g. 8.5"
                  value={form.current_cgpa}
                  onChange={(e) => update('current_cgpa', e.target.value)}
                />
                <Input
                  id="target_cgpa"
                  label="Target CGPA"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  placeholder="e.g. 9.0"
                  value={form.target_cgpa}
                  onChange={(e) => update('target_cgpa', e.target.value)}
                />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Contact & Social */}
        <motion.div variants={fadeInUp}>
          <h3 className="text-sm font-semibold text-text mb-3">Contact & Social</h3>
          <GlassCard>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="phone"
                  label="Phone"
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                />
                <Input
                  id="date_of_birth"
                  label="Date of Birth"
                  type="date"
                  value={form.date_of_birth}
                  onChange={(e) => update('date_of_birth', e.target.value)}
                />
              </div>
              <Input
                id="linkedin_url"
                label="LinkedIn URL"
                type="url"
                placeholder="https://linkedin.com/in/..."
                value={form.linkedin_url}
                onChange={(e) => update('linkedin_url', e.target.value)}
              />
              <Input
                id="github_url"
                label="GitHub URL"
                type="url"
                placeholder="https://github.com/..."
                value={form.github_url}
                onChange={(e) => update('github_url', e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Bio</label>
                <textarea
                  rows={3}
                  placeholder="A short academic or personal bio..."
                  value={form.bio}
                  onChange={(e) => update('bio', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-border-2 text-text placeholder:text-text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="guardian_name"
                  label="Guardian Name"
                  type="text"
                  placeholder="Parent / guardian"
                  value={form.guardian_name}
                  onChange={(e) => update('guardian_name', e.target.value)}
                />
                <Input
                  id="guardian_phone"
                  label="Guardian Phone"
                  type="tel"
                  placeholder="Guardian contact"
                  value={form.guardian_phone}
                  onChange={(e) => update('guardian_phone', e.target.value)}
                />
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
