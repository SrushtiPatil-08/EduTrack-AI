import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Copy, Trash2, X, Calendar, Layers, Check, Clock } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { fadeInUp, staggerContainer, REPLAY_VIEWPORT } from '@/components/motion';
import {
  getTimetableProfiles, createTimetableProfile, updateTimetableProfile,
  deleteTimetableProfile, setActiveTimetableProfile, duplicateTimetableProfile,
  getTimetableEntries, createTimetableEntry, deleteTimetableEntry,
  getSubjects,
} from '@/services/db';
import type { TimetableProfile, TimetableEntry, Subject } from '@/services/db';
import { cn } from '@/lib/utils';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Timetable() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<TimetableProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<TimetableProfile | null>(null);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [entryModalDay, setEntryModalDay] = useState<number>(1);

  const [profileForm, setProfileForm] = useState({ name: '' });
  const [entryForm, setEntryForm] = useState({
    subject_id: '',
    day_of_week: 1,
    start_time: '09:00',
    end_time: '10:00',
    room: '',
    faculty_name: '',
  });

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const [profRes, subRes] = await Promise.all([
      getTimetableProfiles(user.id),
      getSubjects(user.id),
    ]);
    if (profRes.error) setError(profRes.error);
    else {
      const profs = profRes.profiles as TimetableProfile[] || [];
      setProfiles(profs);
      const active = profs.find((p) => p.is_active) || profs[0] || null;
      setActiveProfile(active);
      if (active) {
        const { entries: ents, error: eErr } = await getTimetableEntries(user.id, active.id);
        if (eErr) setError(eErr);
        else setEntries(ents as TimetableEntry[] || []);
      } else {
        setEntries([]);
      }
    }
    if (subRes.error) setError(subRes.error);
    else setSubjects(subRes.subjects as Subject[] || []);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateProfile = async () => {
    if (!user?.id || !profileForm.name.trim()) return;
    const { error: err } = await createTimetableProfile(user.id, { name: profileForm.name });
    if (err) setError(err);
    else {
      setProfileForm({ name: '' });
      setProfileModalOpen(false);
      await loadData();
    }
  };

  const handleSwitchProfile = async (profileId: string) => {
    if (!user?.id) return;
    const { error: err } = await setActiveTimetableProfile(user.id, profileId);
    if (err) setError(err);
    else await loadData();
  };

  const handleDuplicateProfile = async (profileId: string) => {
    if (!user?.id) return;
    const { error: err } = await duplicateTimetableProfile(user.id, profileId, '');
    if (err) setError(err);
    else await loadData();
  };

  const handleDeleteProfile = async (profileId: string) => {
    const { error: err } = await deleteTimetableProfile(profileId);
    if (err) setError(err);
    else await loadData();
  };

  const handleAddEntry = async () => {
    if (!user?.id || !activeProfile || !entryForm.subject_id) return;
    const { error: err } = await createTimetableEntry(user.id, {
      profile_id: activeProfile.id,
      subject_id: entryForm.subject_id,
      day_of_week: entryForm.day_of_week,
      start_time: entryForm.start_time,
      end_time: entryForm.end_time,
      room: entryForm.room || null,
      faculty_name: entryForm.faculty_name || null,
    });
    if (err) setError(err);
    else {
      setEntryForm({ subject_id: '', day_of_week: 1, start_time: '09:00', end_time: '10:00', room: '', faculty_name: '' });
      setEntryModalOpen(false);
      await loadData();
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    const { error: err } = await deleteTimetableEntry(entryId);
    if (err) setError(err);
    else await loadData();
  };

  const openEntryModal = (day: number) => {
    setEntryModalDay(day);
    setEntryForm({ ...entryForm, day_of_week: day, subject_id: subjects[0]?.id || '' });
    setEntryModalOpen(true);
  };

  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  // Group entries by day
  const entriesByDay = Array.from({ length: 7 }, () => [] as TimetableEntry[]);
  entries.forEach((e) => {
    if (e.day_of_week >= 0 && e.day_of_week <= 6) {
      entriesByDay[e.day_of_week].push(e);
    }
  });
  entriesByDay.forEach((dayEntries) => dayEntries.sort((a, b) => a.start_time.localeCompare(b.start_time)));

  return (
    <DashboardLayout title="Timetable">
      <motion.div initial="hidden" whileInView="visible" viewport={REPLAY_VIEWPORT} variants={staggerContainer} className="space-y-6">
        {/* Profile selector */}
        <motion.div variants={fadeInUp}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-primary" />
              <h3 className="text-sm font-semibold text-text">Timetable Profiles</h3>
            </div>
            <Button size="sm" onClick={() => setProfileModalOpen(true)}>
              <Plus size={16} /> New Profile
            </Button>
          </div>
          {profiles.length === 0 ? (
            <GlassCard className="flex flex-col items-center justify-center py-10">
              <Layers size={24} className="text-text-muted mb-2" />
              <p className="text-sm text-text-muted">No timetable profiles yet. Create one to start building your schedule.</p>
            </GlassCard>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {profiles.map((p) => (
                <motion.div key={p.id} whileHover={{ y: -2 }} className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all',
                  p.is_active
                    ? 'bg-primary/15 border-primary/40 text-primary-light'
                    : 'bg-surface-2 border-border-2 text-text-muted hover:text-text hover:border-border-2',
                )}>
                  <button onClick={() => handleSwitchProfile(p.id)} className="flex items-center gap-2">
                    {p.is_active && <Check size={12} />}
                    <span className="text-sm font-medium">{p.name}</span>
                  </button>
                  <button onClick={() => handleDuplicateProfile(p.id)} className="w-6 h-6 rounded-lg hover:bg-surface-3 flex items-center justify-center cursor-pointer">
                    <Copy size={12} className="text-text-muted" />
                  </button>
                  {profiles.length > 1 && (
                    <button onClick={() => handleDeleteProfile(p.id)} className="w-6 h-6 rounded-lg hover:bg-error/10 flex items-center justify-center cursor-pointer">
                      <Trash2 size={12} className="text-text-muted hover:text-error" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {error && <div className="bg-error/10 border border-error/30 rounded-xl px-4 py-3 text-sm text-error">{error}</div>}

        {/* Weekly grid */}
        {!activeProfile ? (
          <motion.div variants={fadeInUp}>
            <GlassCard className="flex flex-col items-center justify-center py-20">
              <Calendar size={28} className="text-text-muted mb-3" />
              <h3 className="text-lg font-semibold text-text">No active timetable</h3>
              <p className="text-sm text-text-muted mt-2">Create a timetable profile above to get started.</p>
            </GlassCard>
          </motion.div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : subjects.length === 0 ? (
          <motion.div variants={fadeInUp}>
            <GlassCard className="flex flex-col items-center justify-center py-20">
              <Calendar size={28} className="text-text-muted mb-3" />
              <h3 className="text-lg font-semibold text-text">Add subjects first</h3>
              <p className="text-sm text-text-muted mt-2 text-center max-w-sm">
                You need subjects before you can add them to your timetable.
              </p>
              <Button size="sm" className="mt-4" onClick={() => window.location.href = '/subjects'}>
                Go to Subjects
              </Button>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div variants={fadeInUp} className="space-y-3">
            {entriesByDay.map((dayEntries, dayIdx) => (
              <GlassCard key={dayIdx} className="p-0 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                  <h4 className="text-sm font-semibold text-text">{DAYS[dayIdx]}</h4>
                  <button
                    onClick={() => openEntryModal(dayIdx)}
                    className="w-7 h-7 rounded-lg bg-surface-2 border border-border-2 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/40 transition-all cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {dayEntries.length === 0 ? (
                  <div className="px-5 py-4 text-xs text-text-muted">No lectures scheduled</div>
                ) : (
                  dayEntries.map((entry) => {
                    const subject = entry.subject_id ? subjectMap.get(entry.subject_id) : null;
                    return (
                      <div key={entry.id} className="flex items-center gap-4 px-5 py-3 border-b border-border last:border-0 group">
                        <div className="w-1 h-10 rounded-full" style={{ backgroundColor: subject?.color || '#10b981' }} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-text">{subject?.name || 'Unknown'}</p>
                          <p className="text-xs text-text-muted flex items-center gap-1.5 mt-0.5">
                            <Clock size={11} /> {entry.start_time?.slice(0, 5)} – {entry.end_time?.slice(0, 5)}
                            {entry.room && ` · Room ${entry.room}`}
                            {entry.faculty_name && ` · ${entry.faculty_name}`}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="w-7 h-7 rounded-lg bg-surface-2 border border-border-2 flex items-center justify-center text-text-muted hover:text-error hover:border-error/40 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })
                )}
              </GlassCard>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Profile modal */}
      <AnimatePresence>
        {profileModalOpen && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-bg/80 backdrop-blur-md px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md"
            >
              <div className="glass-strong rounded-3xl p-8 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-text">New Timetable Profile</h2>
                  <button onClick={() => setProfileModalOpen(false)} className="w-8 h-8 rounded-lg bg-surface-2 border border-border-2 flex items-center justify-center text-text-muted hover:text-text transition-all cursor-pointer">
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-4">
                  <Input
                    id="profile_name"
                    label="Profile Name"
                    type="text"
                    placeholder="Semester Timetable"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ name: e.target.value })}
                  />
                  <div className="flex gap-3 pt-2">
                    <Button variant="secondary" fullWidth onClick={() => setProfileModalOpen(false)}>Cancel</Button>
                    <Button fullWidth onClick={handleCreateProfile} disabled={!profileForm.name.trim()}>Create</Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Entry modal */}
      <AnimatePresence>
        {entryModalOpen && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-bg/80 backdrop-blur-md px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-lg"
            >
              <div className="glass-strong rounded-3xl p-8 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-text">Add Lecture — {DAYS[entryModalDay]}</h2>
                  <button onClick={() => setEntryModalOpen(false)} className="w-8 h-8 rounded-lg bg-surface-2 border border-border-2 flex items-center justify-center text-text-muted hover:text-text transition-all cursor-pointer">
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Subject</label>
                    <select
                      value={entryForm.subject_id}
                      onChange={(e) => setEntryForm({ ...entryForm, subject_id: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-border-2 text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                    >
                      <option value="">Select a subject…</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input id="start_time" label="Start Time" type="time" value={entryForm.start_time} onChange={(e) => setEntryForm({ ...entryForm, start_time: e.target.value })} />
                    <Input id="end_time" label="End Time" type="time" value={entryForm.end_time} onChange={(e) => setEntryForm({ ...entryForm, end_time: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input id="room" label="Room (optional)" type="text" placeholder="A-101" value={entryForm.room} onChange={(e) => setEntryForm({ ...entryForm, room: e.target.value })} />
                    <Input id="faculty" label="Faculty (optional)" type="text" placeholder="Dr. Smith" value={entryForm.faculty_name} onChange={(e) => setEntryForm({ ...entryForm, faculty_name: e.target.value })} />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button variant="secondary" fullWidth onClick={() => setEntryModalOpen(false)}>Cancel</Button>
                    <Button fullWidth onClick={handleAddEntry} disabled={!entryForm.subject_id}>Add Lecture</Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
