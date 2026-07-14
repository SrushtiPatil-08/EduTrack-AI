import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ClipboardList, Clock, CheckCircle2, Plus, X, Trash2, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fadeInUp, staggerContainer, REPLAY_VIEWPORT } from '@/components/motion';
import { getAssignments, createAssignment, updateAssignment, deleteAssignment, getSubjects } from '@/services/db';
import type { Assignment, Subject } from '@/services/db';
import { cn } from '@/lib/utils';

export default function Assignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const [form, setForm] = useState({
    title: '',
    description: '',
    subject_id: '',
    due_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const [aRes, sRes] = await Promise.all([
      getAssignments(user.id),
      getSubjects(user.id),
    ]);
    if (aRes.error) setError(aRes.error);
    else setAssignments(aRes.assignments as Assignment[] || []);
    if (sRes.error) setError(sRes.error);
    else setSubjects(sRes.subjects as Subject[] || []);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async () => {
    if (!user?.id || !form.title.trim()) return;
    setSubmitting(true);
    setError(null);
    const { error: err } = await createAssignment(user.id, {
      title: form.title,
      description: form.description || null,
      subject_id: form.subject_id || null,
      due_date: form.due_date || null,
      priority: form.priority,
    });
    setSubmitting(false);
    if (err) { setError(err); return; }
    setForm({ title: '', description: '', subject_id: '', due_date: '', priority: 'medium' });
    setModalOpen(false);
    await loadData();
  };

  const toggleStatus = async (assignment: Assignment) => {
    const newStatus = assignment.status === 'completed' ? 'pending' : 'completed';
    await updateAssignment(assignment.id, { status: newStatus });
    await loadData();
  };

  const handleDelete = async (assignmentId: string) => {
    await deleteAssignment(assignmentId);
    await loadData();
  };

  const pending = assignments.filter((a) => a.status === 'pending').length;
  const completed = assignments.filter((a) => a.status === 'completed').length;
  const dueThisWeek = assignments.filter((a) => {
    if (!a.due_date || a.status === 'completed') return false;
    const due = new Date(a.due_date);
    const now = new Date();
    const week = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return due >= now && due <= week;
  }).length;

  const filtered = filter === 'all' ? assignments : assignments.filter((a) => a.status === filter);

  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const priorityColors: Record<string, string> = { high: 'text-error', medium: 'text-warning', low: 'text-primary-light' };

  return (
    <DashboardLayout title="Assignments">
      <motion.div initial="hidden" whileInView="visible" viewport={REPLAY_VIEWPORT} variants={staggerContainer} className="space-y-6">
        {/* Stats */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <GlassCard className="p-5">
            <ClipboardList className="text-warning mb-3" size={20} />
            <p className="text-2xl font-bold text-text">{pending}</p>
            <p className="text-xs text-text-muted mt-1">Pending</p>
          </GlassCard>
          <GlassCard className="p-5">
            <CheckCircle2 className="text-primary mb-3" size={20} />
            <p className="text-2xl font-bold text-text">{completed}</p>
            <p className="text-xs text-text-muted mt-1">Completed</p>
          </GlassCard>
          <GlassCard className="p-5">
            <Clock className="text-info mb-3" size={20} />
            <p className="text-2xl font-bold text-text">{dueThisWeek}</p>
            <p className="text-xs text-text-muted mt-1">Due This Week</p>
          </GlassCard>
        </motion.div>

        {/* Filter + Add */}
        <motion.div variants={fadeInUp} className="flex items-center justify-between">
          <div className="flex gap-2">
            {(['all', 'pending', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-4 h-9 rounded-lg text-sm font-medium capitalize transition-all cursor-pointer border',
                  filter === f
                    ? 'bg-primary/15 border-primary/40 text-primary-light'
                    : 'bg-surface-2 border-border-2 text-text-muted hover:text-text',
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus size={16} /> Add Assignment
          </Button>
        </motion.div>

        {error && <div className="bg-error/10 border border-error/30 rounded-xl px-4 py-3 text-sm text-error">{error}</div>}

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div variants={fadeInUp}>
            <GlassCard className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-warning/10 border border-warning/20 flex items-center justify-center mb-4">
                <ClipboardList className="text-warning" size={28} />
              </div>
              <h3 className="text-lg font-semibold text-text">No assignments yet</h3>
              <p className="text-sm text-text-muted mt-2 text-center max-w-sm">
                {filter === 'all' ? 'Create your first assignment to start tracking deadlines.' : `No ${filter} assignments.`}
              </p>
              <Button size="sm" onClick={() => setModalOpen(true)} className="mt-6">
                <Plus size={16} /> Add Assignment
              </Button>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div variants={staggerContainer} className="space-y-3">
            {filtered.map((a) => {
              const subject = a.subject_id ? subjectMap.get(a.subject_id) : null;
              const isOverdue = a.due_date && a.status === 'pending' && new Date(a.due_date) < new Date();
              return (
                <motion.div key={a.id} variants={fadeInUp} whileHover={{ y: -2 }}>
                  <GlassCard className="flex items-center gap-4">
                    <button
                      onClick={() => toggleStatus(a)}
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0',
                        a.status === 'completed'
                          ? 'bg-primary text-[#052e1a]'
                          : 'bg-surface-2 border border-border-2 text-text-muted hover:border-primary/40',
                      )}
                    >
                      {a.status === 'completed' && <CheckCircle2 size={16} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-medium text-text', a.status === 'completed' && 'line-through text-text-muted')}>
                        {a.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        {subject && <span className="text-xs text-text-muted">{subject.name}</span>}
                        {a.due_date && (
                          <span className={cn('text-xs flex items-center gap-1', isOverdue ? 'text-error' : 'text-text-muted')}>
                            <Calendar size={11} /> {new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        <span className={cn('text-xs font-semibold capitalize', priorityColors[a.priority])}>{a.priority}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="w-8 h-8 rounded-lg bg-surface-2 border border-border-2 flex items-center justify-center text-text-muted hover:text-error hover:border-error/40 transition-all cursor-pointer shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </GlassCard>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>

      {/* Add modal */}
      <AnimatePresence>
        {modalOpen && (
          <AssignmentModal
            form={form}
            setForm={setForm}
            subjects={subjects}
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

function AssignmentModal({
  form, setForm, subjects, submitting, error, onClose, onSubmit,
}: {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  subjects: Subject[];
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
            <h2 className="text-lg font-bold text-text">Add Assignment</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-surface-2 border border-border-2 flex items-center justify-center text-text-muted hover:text-text transition-all cursor-pointer">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4">
            <Input
              id="title"
              label="Title"
              type="text"
              placeholder="Lab Report #3"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Description (optional)</label>
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                rows={3}
                placeholder="Brief description…"
                className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-border-2 text-text placeholder:text-text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Subject</label>
                <select
                  value={form.subject_id}
                  onChange={(e) => update('subject_id', e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-border-2 text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                >
                  <option value="">No subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <Input
                id="due_date"
                label="Due Date"
                type="date"
                value={form.due_date}
                onChange={(e) => update('due_date', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Priority</label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => update('priority', p)}
                    className={cn(
                      'flex-1 h-11 rounded-xl text-sm font-medium capitalize transition-all cursor-pointer border',
                      form.priority === p
                        ? p === 'high' ? 'bg-error/15 border-error/40 text-error'
                          : p === 'medium' ? 'bg-warning/15 border-warning/40 text-warning'
                          : 'bg-primary/15 border-primary/40 text-primary-light'
                        : 'bg-surface-2 border-border-2 text-text-muted hover:text-text',
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-error">{error}</p>}

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
              <Button fullWidth onClick={onSubmit} disabled={submitting || !form.title.trim()}>
                {submitting ? 'Adding…' : 'Add Assignment'}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
