import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Copy, Trash2, X, Calendar, Layers, Check, Clock, Upload, Sparkles, FileText, Image, ArrowRight, Loader2, Edit3, AlertCircle } from 'lucide-react';
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
  getSubjects, createSubject,
} from '@/services/db';
import { parseTimetableImage } from '@/services/groq';
import type { TimetableProfile, TimetableEntry, Subject } from '@/services/db';
import { cn } from '@/lib/utils';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type CreationMode = 'choice' | 'manual' | 'ai-upload' | 'ai-review';
type ParsedEntry = {
  subject_name: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string | null;
  faculty_name: string | null;
};
type ParsedSubject = {
  name: string;
  code: string | null;
  type: 'theory' | 'practical' | 'lab';
  color: string;
};
type ParsedTimetable = {
  subjects: ParsedSubject[];
  entries: ParsedEntry[];
  working_days: number[];
};

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
  const [entryModalDay, setEntryModalDay] = useState(1);

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

      {/* Profile creation modal — with mode choice */}
      <ProfileCreationModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onManualCreate={async (name) => {
          if (!user?.id || !name.trim()) return;
          const { error: err } = await createTimetableProfile(user.id, { name });
          if (err) setError(err);
          else {
            setProfileModalOpen(false);
            await loadData();
          }
        }}
        onAIImport={async (name, parsed) => {
          if (!user?.id || !name.trim()) return;
          await importParsedTimetable(user.id, name, parsed, subjects, loadData, setError);
          setProfileModalOpen(false);
        }}
        subjects={subjects}
      />

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

// ─── Profile Creation Modal with Manual vs AI Import choice ───

function ProfileCreationModal({ open, onClose, onManualCreate, onAIImport, subjects }: {
  open: boolean;
  onClose: () => void;
  onManualCreate: (name: string) => Promise<void>;
  onAIImport: (name: string, parsed: ParsedTimetable) => Promise<void>;
  subjects: Subject[];
}) {
  const [mode, setMode] = useState<CreationMode>('choice');
  const [profileName, setProfileName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedTimetable | null>(null);
  const [importing, setImporting] = useState(false);
  const [editEntries, setEditEntries] = useState<ParsedEntry[]>([]);
  const [editSubjects, setEditSubjects] = useState<ParsedSubject[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setMode('choice');
        setProfileName('');
        setFile(null);
        setFilePreview(null);
        setParsing(false);
        setParseError(null);
        setParsed(null);
        setImporting(false);
        setEditEntries([]);
        setEditSubjects([]);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setParseError(null);
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }
  };

  const handleParse = async () => {
    if (!file) return;
    setParsing(true);
    setParseError(null);
    const { result, error } = await parseTimetableImage(file);
    setParsing(false);
    if (error) {
      setParseError(error);
      return;
    }
    setParsed(result);
    setEditEntries(result.entries || []);
    setEditSubjects(result.subjects || []);
    setMode('ai-review');
  };

  const handleConfirmImport = async () => {
    if (!profileName.trim() || !parsed) return;
    setImporting(true);
    const finalParsed: ParsedTimetable = {
      subjects: editSubjects,
      entries: editEntries,
      working_days: parsed.working_days || [],
    };
    await onAIImport(profileName, finalParsed);
    setImporting(false);
  };

  const updateEntry = (idx: number, field: keyof ParsedEntry, value: any) => {
    setEditEntries((prev) => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };

  const removeEntry = (idx: number) => {
    setEditEntries((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateSubject = (idx: number, field: keyof ParsedSubject, value: any) => {
    setEditSubjects((prev) => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const removeSubject = (idx: number) => {
    const removed = editSubjects[idx];
    setEditSubjects((prev) => prev.filter((_, i) => i !== idx));
    // Also remove entries referencing this subject
    if (removed) {
      setEditEntries((prev) => prev.filter((e) => e.subject_name !== removed.name));
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-bg/80 backdrop-blur-md px-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl my-8"
          >
            <div className="glass-strong rounded-3xl p-8 shadow-[0_24px_80px_rgba(0,0,0,0.6)] max-h-[85vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 sticky -top-8 -mx-8 px-8 pt-8 pb-4 bg-bg/90 backdrop-blur-md z-10 border-b border-border">
                <h2 className="text-lg font-bold text-text">
                  {mode === 'choice' && 'New Timetable Profile'}
                  {mode === 'manual' && 'New Timetable Profile'}
                  {mode === 'ai-upload' && 'AI Timetable Import'}
                  {mode === 'ai-review' && 'Review Extracted Timetable'}
                </h2>
                <button onClick={onClose} className="w-8 h-8 rounded-lg bg-surface-2 border border-border-2 flex items-center justify-center text-text-muted hover:text-text transition-all cursor-pointer shrink-0">
                  <X size={16} />
                </button>
              </div>

              {/* Mode selection */}
              {mode === 'choice' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <p className="text-sm text-text-muted text-center mb-6">Choose how you want to create your timetable</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Manual */}
                    <button
                      onClick={() => setMode('manual')}
                      className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-surface-2/50 border border-border-2 hover:border-primary/40 hover:bg-surface-2 transition-all cursor-pointer text-center"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-surface-3 border border-border-2 flex items-center justify-center group-hover:border-primary/40 transition-colors">
                        <Edit3 size={24} className="text-text-muted group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text">Manual Timetable</p>
                        <p className="text-xs text-text-muted mt-1">Build it yourself, one lecture at a time</p>
                      </div>
                    </button>

                    {/* AI Import */}
                    <button
                      onClick={() => setMode('ai-upload')}
                      className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-surface-2/50 border border-border-2 hover:border-primary/40 hover:bg-surface-2 transition-all cursor-pointer text-center relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:border-primary/40 transition-colors relative">
                        <Sparkles size={24} className="text-primary" />
                      </div>
                      <div className="relative">
                        <p className="text-sm font-semibold text-text flex items-center gap-1.5 justify-center">
                          AI Timetable Import
                          <span className="text-[9px] font-bold uppercase tracking-wider text-primary-light bg-primary/15 px-1.5 py-0.5 rounded-md">Beta</span>
                        </p>
                        <p className="text-xs text-text-muted mt-1">Upload a photo or PDF — AI extracts everything</p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Manual mode */}
              {mode === 'manual' && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <button onClick={() => setMode('choice')} className="text-xs text-text-muted hover:text-text transition-colors flex items-center gap-1 mb-2">
                    <ArrowRight size={12} className="rotate-180" /> Back
                  </button>
                  <Input
                    id="profile_name_manual"
                    label="Profile Name"
                    type="text"
                    placeholder="e.g. Semester 3 Timetable"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-3 pt-2">
                    <Button variant="secondary" fullWidth onClick={() => setMode('choice')}>Cancel</Button>
                    <Button fullWidth onClick={() => onManualCreate(profileName)} disabled={!profileName.trim()}>Create Empty Profile</Button>
                  </div>
                </motion.div>
              )}

              {/* AI Upload mode */}
              {mode === 'ai-upload' && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <button onClick={() => setMode('choice')} className="text-xs text-text-muted hover:text-text transition-colors flex items-center gap-1 mb-2">
                    <ArrowRight size={12} className="rotate-180" /> Back
                  </button>

                  <Input
                    id="profile_name_ai"
                    label="Profile Name"
                    type="text"
                    placeholder="e.g. Semester 3 Timetable"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                  />

                  {/* Drop zone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const dropped = e.dataTransfer.files[0];
                      if (dropped) handleFileSelect(dropped);
                    }}
                    className={cn(
                      'border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all',
                      file
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-border-2 hover:border-primary/30 hover:bg-surface-2/50',
                    )}
                  >
                    {filePreview ? (
                      <img src={filePreview} alt="Preview" className="max-h-40 rounded-xl border border-border" />
                    ) : file ? (
                      <div className="flex items-center gap-3 text-text">
                        <FileText size={28} className="text-primary" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-text-muted">{(file.size / 1024).toFixed(0)} KB</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-2xl bg-surface-3 border border-border-2 flex items-center justify-center">
                          <Upload size={24} className="text-text-muted" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-text">Drop your timetable here</p>
                          <p className="text-xs text-text-muted mt-1">or click to browse</p>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-text-muted"><Image size={12} /> Photo</span>
                          <span className="flex items-center gap-1 text-xs text-text-muted"><FileText size={12} /> PDF</span>
                          <span className="flex items-center gap-1 text-xs text-text-muted"><Image size={12} /> Screenshot</span>
                        </div>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileSelect(f);
                      }}
                    />
                  </div>

                  {parseError && (
                    <div className="flex items-start gap-2 bg-error/10 border border-error/30 rounded-xl px-4 py-3 text-sm text-error">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <span>{parseError}</span>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button variant="secondary" fullWidth onClick={() => setMode('choice')}>Cancel</Button>
                    <Button fullWidth onClick={handleParse} disabled={!file || !profileName.trim() || parsing}>
                      {parsing ? (
                        <><Loader2 size={16} className="animate-spin" /> Extracting...</>
                      ) : (
                        <><Sparkles size={16} /> Extract with AI</>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* AI Review mode */}
              {mode === 'ai-review' && editSubjects.length >= 0 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                  {/* Subjects section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-text">Detected Subjects ({editSubjects.length})</h3>
                    </div>
                    {editSubjects.length === 0 ? (
                      <p className="text-xs text-text-muted py-3">No subjects detected. You can add entries manually after import.</p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {editSubjects.map((s, i) => (
                          <div key={i} className="flex items-center gap-2 bg-surface-2/50 border border-border-2 rounded-xl px-3 py-2">
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                            <input
                              value={s.name}
                              onChange={(e) => updateSubject(i, 'name', e.target.value)}
                              className="flex-1 bg-transparent text-sm text-text outline-none min-w-0"
                            />
                            <select
                              value={s.type}
                              onChange={(e) => updateSubject(i, 'type', e.target.value)}
                              className="bg-surface-3 border border-border-2 rounded-lg px-2 py-1 text-xs text-text-muted outline-none cursor-pointer"
                            >
                              <option value="theory">Theory</option>
                              <option value="practical">Practical</option>
                              <option value="lab">Lab</option>
                            </select>
                            <button onClick={() => removeSubject(i)} className="text-text-muted hover:text-error transition-colors shrink-0">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Entries section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-text">Detected Lectures ({editEntries.length})</h3>
                    </div>
                    {editEntries.length === 0 ? (
                      <p className="text-xs text-text-muted py-3">No lectures detected.</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {editEntries.map((e, i) => (
                          <div key={i} className="flex items-center gap-2 bg-surface-2/50 border border-border-2 rounded-xl px-3 py-2 flex-wrap">
                            <select
                              value={e.day_of_week}
                              onChange={(ev) => updateEntry(i, 'day_of_week', parseInt(ev.target.value))}
                              className="bg-surface-3 border border-border-2 rounded-lg px-2 py-1 text-xs text-text outline-none cursor-pointer"
                            >
                              {DAYS.map((d, di) => <option key={di} value={di}>{SHORT_DAYS[di]}</option>)}
                            </select>
                            <input
                              value={e.subject_name}
                              onChange={(ev) => updateEntry(i, 'subject_name', ev.target.value)}
                              className="flex-1 min-w-[100px] bg-transparent text-sm text-text outline-none"
                              placeholder="Subject"
                            />
                            <input
                              type="time"
                              value={e.start_time?.slice(0, 5) || ''}
                              onChange={(ev) => updateEntry(i, 'start_time', ev.target.value)}
                              className="bg-surface-3 border border-border-2 rounded-lg px-2 py-1 text-xs text-text outline-none"
                            />
                            <input
                              type="time"
                              value={e.end_time?.slice(0, 5) || ''}
                              onChange={(ev) => updateEntry(i, 'end_time', ev.target.value)}
                              className="bg-surface-3 border border-border-2 rounded-lg px-2 py-1 text-xs text-text outline-none"
                            />
                            <input
                              value={e.room || ''}
                              onChange={(ev) => updateEntry(i, 'room', ev.target.value)}
                              placeholder="Room"
                              className="w-16 bg-surface-3 border border-border-2 rounded-lg px-2 py-1 text-xs text-text outline-none"
                            />
                            <input
                              value={e.faculty_name || ''}
                              onChange={(ev) => updateEntry(i, 'faculty_name', ev.target.value)}
                              placeholder="Faculty"
                              className="w-24 bg-surface-3 border border-border-2 rounded-lg px-2 py-1 text-xs text-text outline-none"
                            />
                            <button onClick={() => removeEntry(i)} className="text-text-muted hover:text-error transition-colors shrink-0">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2 sticky bottom-0 -mx-8 px-8 py-4 bg-bg/90 backdrop-blur-md border-t border-border">
                    <Button variant="secondary" onClick={() => setMode('ai-upload')}>Back</Button>
                    <Button fullWidth onClick={handleConfirmImport} disabled={importing || !profileName.trim()}>
                      {importing ? (
                        <><Loader2 size={16} className="animate-spin" /> Importing...</>
                      ) : (
                        <><Check size={16} /> Confirm & Import ({editEntries.length} lectures)</>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Import logic: create profile, create missing subjects, create entries ───

async function importParsedTimetable(
  userId: string,
  profileName: string,
  parsed: ParsedTimetable,
  existingSubjects: Subject[],
  reload: () => Promise<void>,
  setError: (e: string | null) => void,
) {
  // 1. Create the timetable profile
  const { error: profErr, profile: profData } = await createTimetableProfile(userId, { name: profileName });
  if (profErr) { setError(profErr); return; }

  // Need to get the new profile id — reload profiles and find by name
  const { profiles } = await getTimetableProfiles(userId);
  const newProfile = (profiles as TimetableProfile[])?.find((p) => p.name === profileName);
  if (!newProfile) { setError('Failed to create profile.'); return; }

  // 2. Create missing subjects (match by name, case-insensitive)
  const existingMap = new Map(
    existingSubjects.map((s) => [s.name.toLowerCase(), s]),
  );
  const subjectIdMap = new Map<string, string>(); // parsed subject name -> db subject id

  for (const ps of parsed.subjects || []) {
    const existing = existingMap.get(ps.name.toLowerCase());
    if (existing) {
      subjectIdMap.set(ps.name, existing.id);
    } else {
      const { subject: newSub } = await createSubject(userId, {
        name: ps.name,
        code: ps.code || null,
        type: ps.type || 'theory',
        color: ps.color || '#10b981',
        weekly_lectures: 0,
        credits: 0,
      });
      // Need to reload subjects to get the new id
      const { subjects: refreshed } = await getSubjects(userId);
      const created = (refreshed as Subject[])?.find((s) => s.name === ps.name);
      if (created) {
        subjectIdMap.set(ps.name, created.id);
        existingMap.set(ps.name.toLowerCase(), created);
      }
    }
  }

  // 3. Create timetable entries
  for (const entry of parsed.entries || []) {
    let subjectId = subjectIdMap.get(entry.subject_name);
    if (!subjectId) {
      // Try case-insensitive lookup
      const found = existingMap.get(entry.subject_name.toLowerCase());
      if (found) {
        subjectId = found.id;
        subjectIdMap.set(entry.subject_name, found.id);
      }
    }
    if (!subjectId) continue; // skip if no matching subject

    await createTimetableEntry(userId, {
      profile_id: newProfile.id,
      subject_id: subjectId,
      day_of_week: entry.day_of_week,
      start_time: entry.start_time,
      end_time: entry.end_time,
      room: entry.room || null,
      faculty_name: entry.faculty_name || null,
    });
  }

  // 4. Set as active and reload
  await setActiveTimetableProfile(userId, newProfile.id);
  await reload();
}
