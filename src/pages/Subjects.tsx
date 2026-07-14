import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookOpen, Trash2, Pencil, X, Beaker, FlaskConical, BookText } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { fadeInUp, staggerContainer, REPLAY_VIEWPORT } from '@/components/motion';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '@/services/db';
import type { Subject } from '@/services/db';
import { cn } from '@/lib/utils';

const colorOptions = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
];

const typeIcons: Record<string, any> = {
  theory: BookText,
  practical: FlaskConical,
  lab: Beaker,
};

export default function Subjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    code: '',
    faculty_name: '',
    weekly_lectures: 3,
    credits: 3,
    type: 'theory' as 'theory' | 'practical' | 'lab',
    color: '#10b981',
  });

  const loadSubjects = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { subjects: subs, error: err } = await getSubjects(user.id);
    if (err) {
      setError(err);
    } else {
      setSubjects(subs as Subject[] || []);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  const openAddModal = () => {
    setEditing(null);
    setForm({ name: '', code: '', faculty_name: '', weekly_lectures: 3, credits: 3, type: 'theory', color: '#10b981' });
    setModalOpen(true);
  };

  const openEditModal = (subject: Subject) => {
    setEditing(subject);
    setForm({
      name: subject.name,
      code: subject.code || '',
      faculty_name: subject.faculty_name || '',
      weekly_lectures: subject.weekly_lectures,
      credits: subject.credits,
      type: subject.type,
      color: subject.color,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!user?.id || !form.name.trim()) return;
    setSubmitting(true);
    setError(null);
    if (editing) {
      const { error: err } = await updateSubject(editing.id, form);
      if (err) setError(err);
    } else {
      const { error: err } = await createSubject(user.id, form);
      if (err) setError(err);
    }
    setSubmitting(false);
    if (!error) {
      setModalOpen(false);
      await loadSubjects();
    }
  };

  const handleDelete = async (subjectId: string) => {
    const { error: err } = await deleteSubject(subjectId);
    if (err) {
      setError(err);
    } else {
      await loadSubjects();
    }
  };

  return (
    <DashboardLayout title="Subjects">
      <motion.div initial="hidden" whileInView="visible" viewport={REPLAY_VIEWPORT} variants={staggerContainer} className="space-y-6">
        {/* Header row */}
        <motion.div variants={fadeInUp} className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-text">My Subjects</h2>
            <p className="text-sm text-text-muted mt-1">{subjects.length} subject{subjects.length !== 1 ? 's' : ''} enrolled</p>
          </div>
          <Button size="sm" onClick={openAddModal}>
            <Plus size={16} /> Add Subject
          </Button>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="bg-error/10 border border-error/30 rounded-xl px-4 py-3 text-sm text-error">{error}</div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : subjects.length === 0 ? (
          <motion.div variants={fadeInUp}>
            <GlassCard className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <BookOpen className="text-primary" size={28} />
              </div>
              <h3 className="text-lg font-semibold text-text">No subjects yet</h3>
              <p className="text-sm text-text-muted mt-2 text-center max-w-sm">
                Add your first subject to start tracking attendance and assignments.
              </p>
              <Button size="sm" onClick={openAddModal} className="mt-6">
                <Plus size={16} /> Add your first subject
              </Button>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {subjects.map((subject) => {
              const TypeIcon = typeIcons[subject.type] || BookText;
              return (
                <motion.div
                  key={subject.id}
                  variants={fadeInUp}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                >
                  <GlassCard
                    className="relative h-full group cursor-pointer"
                    style={{ borderColor: `${subject.color}30` }}
                  >
                    {/* Color accent bar */}
                    <div
                      className="absolute top-0 left-6 right-6 h-1 rounded-b-full"
                      style={{ backgroundColor: subject.color, opacity: 0.6 }}
                    />

                    {/* Hover glow */}
                    <div
                      className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{ boxShadow: `0 8px 40px ${subject.color}20` }}
                    />

                    <div className="relative">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center"
                          style={{ backgroundColor: `${subject.color}20`, border: `1px solid ${subject.color}30` }}
                        >
                          <TypeIcon size={20} style={{ color: subject.color }} />
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(subject)}
                            className="w-8 h-8 rounded-lg bg-surface-2 border border-border-2 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/40 transition-all cursor-pointer"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(subject.id)}
                            className="w-8 h-8 rounded-lg bg-surface-2 border border-border-2 flex items-center justify-center text-text-muted hover:text-error hover:border-error/40 transition-all cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Name + code */}
                      <h3 className="text-base font-semibold text-text">{subject.name}</h3>
                      {subject.code && (
                        <p className="text-xs text-text-muted mt-0.5">{subject.code}</p>
                      )}

                      {/* Faculty */}
                      {subject.faculty_name && (
                        <p className="text-xs text-text-muted mt-3">{subject.faculty_name}</p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                        <div>
                          <p className="text-xs text-text-muted">Lectures/wk</p>
                          <p className="text-sm font-semibold text-text">{subject.weekly_lectures}</p>
                        </div>
                        <div>
                          <p className="text-xs text-text-muted">Credits</p>
                          <p className="text-sm font-semibold text-text">{subject.credits}</p>
                        </div>
                        <div>
                          <p className="text-xs text-text-muted">Type</p>
                          <p className="text-sm font-semibold text-text capitalize">{subject.type}</p>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>

      {/* Add/Edit modal */}
      <AnimatePresence>
        {modalOpen && (
          <SubjectModal
            form={form}
            setForm={setForm}
            editing={editing}
            submitting={submitting}
            error={error}
            onClose={() => setModalOpen(false)}
            onSubmit={handleSubmit}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

function SubjectModal({
  form, setForm, editing, submitting, error, onClose, onSubmit,
}: {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  editing: Subject | null;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const update = (field: string, value: any) => setForm((prev: any) => ({ ...prev, [field]: value }));

  return (
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
            <h2 className="text-lg font-bold text-text">{editing ? 'Edit Subject' : 'Add Subject'}</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-surface-2 border border-border-2 flex items-center justify-center text-text-muted hover:text-text transition-all cursor-pointer">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4">
            <Input
              id="name"
              label="Subject Name"
              type="text"
              placeholder="Data Structures"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                id="code"
                label="Subject Code"
                type="text"
                placeholder="CS201"
                value={form.code}
                onChange={(e) => update('code', e.target.value)}
              />
              <Input
                id="faculty_name"
                label="Faculty Name"
                type="text"
                placeholder="Dr. Smith"
                value={form.faculty_name}
                onChange={(e) => update('faculty_name', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Weekly Lectures</label>
                <input
                  type="number"
                  min={0}
                  max={14}
                  value={form.weekly_lectures}
                  onChange={(e) => update('weekly_lectures', Number(e.target.value))}
                  className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-border-2 text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Credits</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={form.credits}
                  onChange={(e) => update('credits', Number(e.target.value))}
                  className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-border-2 text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Type</label>
              <div className="flex gap-2">
                {(['theory', 'practical', 'lab'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => update('type', t)}
                    className={cn(
                      'flex-1 h-11 rounded-xl text-sm font-medium capitalize transition-all cursor-pointer border',
                      form.type === t
                        ? 'bg-primary/15 border-primary/40 text-primary-light'
                        : 'bg-surface-2 border-border-2 text-text-muted hover:text-text hover:border-border-2',
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((c) => (
                  <button
                    key={c}
                    onClick={() => update('color', c)}
                    className={cn(
                      'w-9 h-9 rounded-xl transition-all cursor-pointer',
                      form.color === c ? 'ring-2 ring-offset-2 ring-offset-bg scale-110' : 'hover:scale-110',
                    )}
                    style={{ backgroundColor: c, boxShadow: form.color === c ? `0 0 20px ${c}60` : 'none' }}
                  />
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-error">{error}</p>}

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
              <Button fullWidth onClick={onSubmit} disabled={submitting || !form.name.trim()}>
                {submitting ? 'Saving…' : editing ? 'Save Changes' : 'Add Subject'}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
