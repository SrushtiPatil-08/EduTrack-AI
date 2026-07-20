import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { Mail, CalendarCheck, ClipboardList, Award, Settings, LogOut, ChevronRight, Building2, BookOpen, CalendarDays, Target, Hash, Phone, GraduationCap, Users, Link as LinkIcon, Github, Linkedin } from 'lucide-react';
import { fadeInUp, staggerContainer, REPLAY_VIEWPORT } from '@/components/motion';
import { getDashboardData } from '@/services/db';

export default function Profile() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalSubjects: 0, attendancePct: 0, completedAssignments: 0 });

  const loadStats = useCallback(async () => {
    if (!user?.id) return;
    const data = await getDashboardData(user.id);
    setStats({
      totalSubjects: data.stats.totalSubjects,
      attendancePct: data.stats.attendancePct,
      completedAssignments: data.stats.completedAssignments,
    });
  }, [user?.id]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const displayName = profile?.full_name || user?.name || 'Student';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <DashboardLayout title="Profile">
      <motion.div initial="hidden" whileInView="visible" viewport={REPLAY_VIEWPORT} variants={staggerContainer} className="space-y-6 max-w-2xl">
        {/* Avatar + name */}
        <motion.div variants={fadeInUp} className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mb-4 overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-[#052e1a]">{initials}</span>
            )}
          </div>
          <h2 className="text-xl font-bold text-text">{displayName}</h2>
          <p className="text-sm text-text-muted mt-1">{user?.email}</p>
        </motion.div>

        {/* Quick stats */}
        <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-4">
          <GlassCard className="p-4 text-center">
            <p className="text-xl font-bold text-primary-light">{stats.attendancePct}%</p>
            <p className="text-xs text-text-muted mt-1">Attendance</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <p className="text-xl font-bold text-primary-light">{stats.completedAssignments}</p>
            <p className="text-xs text-text-muted mt-1">Assignments</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <p className="text-xl font-bold text-primary-light">{stats.totalSubjects}</p>
            <p className="text-xs text-text-muted mt-1">Subjects</p>
          </GlassCard>
        </motion.div>

        {/* Profile details */}
        <motion.div variants={fadeInUp}>
          <h3 className="text-sm font-semibold text-text mb-3">Academic Details</h3>
          <GlassCard className="p-0 overflow-hidden">
            <Row icon={Building2} label="College" value={profile?.college_name || 'Not set'} />
            <Row icon={BookOpen} label="Branch / Major" value={profile?.branch || 'Not set'} />
            <Row icon={GraduationCap} label="Degree" value={profile?.degree || 'Not set'} />
            <Row icon={Hash} label="Roll Number" value={profile?.roll_number || 'Not set'} />
            <Row icon={Users} label="Section" value={profile?.section || 'Not set'} />
            <Row icon={CalendarDays} label="Semester" value={profile?.semester ? `Semester ${profile.semester}` : 'Not set'} />
            <Row icon={CalendarDays} label="Academic Year" value={profile?.academic_year || 'Not set'} />
            <Row icon={CalendarDays} label="Batch Year" value={profile?.batch_year ? String(profile.batch_year) : 'Not set'} />
            <Row icon={Target} label="Attendance Goal" value={`${profile?.attendance_goal || 75}%`} />
            <Row icon={Award} label="Current / Target CGPA" value={(profile?.current_cgpa != null || profile?.target_cgpa != null) ? `${profile?.current_cgpa ?? '—'} / ${profile?.target_cgpa ?? '—'}` : 'Not set'} last />
          </GlassCard>
        </motion.div>

        {/* Contact & Social */}
        {(profile?.phone || profile?.date_of_birth || profile?.linkedin_url || profile?.github_url || profile?.bio || profile?.guardian_name) && (
          <motion.div variants={fadeInUp}>
            <h3 className="text-sm font-semibold text-text mb-3">Contact & Social</h3>
            <GlassCard className="p-0 overflow-hidden">
              {profile?.phone && <Row icon={Phone} label="Phone" value={profile.phone} />}
              {profile?.date_of_birth && <Row icon={CalendarDays} label="Date of Birth" value={new Date(profile.date_of_birth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />}
              {profile?.guardian_name && <Row icon={Users} label="Guardian" value={profile.guardian_phone ? `${profile.guardian_name} · ${profile.guardian_phone}` : profile.guardian_name} />}
              {profile?.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="w-full">
                  <Row icon={Linkedin} label="LinkedIn" value={profile.linkedin_url.replace(/^https?:\/\/(www\.)?/, '').replace(/^linkedin\.com\/in\//, 'in/')} />
                </a>
              )}
              {profile?.github_url && (
                <a href={profile.github_url} target="_blank" rel="noreferrer" className="w-full">
                  <Row icon={Github} label="GitHub" value={profile.github_url.replace(/^https?:\/\/(www\.)?/, '').replace(/^github\.com\//, '')} last={!profile?.bio} />
                </a>
              )}
              {profile?.bio && (
                <div className="px-5 py-4 border-t border-border">
                  <p className="text-xs text-text-muted mb-1">Bio</p>
                  <p className="text-sm text-text">{profile.bio}</p>
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}

        {/* Account */}
        <motion.div variants={fadeInUp}>
          <h3 className="text-sm font-semibold text-text mb-3">Account</h3>
          <GlassCard className="p-0 overflow-hidden">
            <Row icon={Mail} label="Email" value={user?.email || ''} />
            <Row icon={CalendarCheck} label="Attendance Rate" value={`${stats.attendancePct}%`} />
            <Row icon={ClipboardList} label="Completed Assignments" value={String(stats.completedAssignments)} last />
          </GlassCard>
        </motion.div>

        {/* Actions */}
        <motion.div variants={fadeInUp}>
          <h3 className="text-sm font-semibold text-text mb-3">Actions</h3>
          <GlassCard className="p-0 overflow-hidden">
            <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-surface-2 transition-colors cursor-pointer">
              <Settings size={18} className="text-text-muted" />
              <span className="text-sm text-text">Edit Profile & Settings</span>
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
