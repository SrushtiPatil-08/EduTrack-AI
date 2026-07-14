import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Trash2, Pencil, X, Check } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { fadeInUp, staggerContainer, REPLAY_VIEWPORT } from '@/components/motion';
import { getSemesters, createSemester, updateSemester, deleteSemester, setActiveSemester } from '@/services/db';
import type { Semester } from '@/services/db';
import { cn } from '@/lib/utils';

export default function Semesters() {
  const { user } = useAuth();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Semester | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    start_date: '',
    end_date: '',
    academic_year: '',
  });

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { semesters: sems, error: err } = await getSemesters(user.id);
    if (err) setError(err);
    else setSemesters(sems as Semester[] || []);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openAddModal = () => {
    setEditing(null);
    setForm({ name: '', start_date: '', end_date: '', academic_year: '' });
    setModalOpen(true);
  };

  const openEditModal = (sem: Semester) => {
    setEditing(sem);
    setForm({
      name: sem.name,
      start_date: sem.start_date || '',
      end_date: sem.end_date || '',
      academic_year: sem.academic_year || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!user?.id || !form.name.trim()) return;
    setSubmitting(true);
    setError(null);
    const data = {
      name: form.name,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      academic_year: form.academic_year || null,
    };
    if (editing) {
      const { error: err } = await updateSemester(editing.id, data);
      if (err) setError(err);
    } else {
      const { error: err } = await createSemester(user.id, data);
      if (err) setError(err);
    }
    setSubmitting(false);
    if (!error) {
      setModalOpen(false);
      await loadData();
    }
  };

  const handleDelete = async (id: string) => {
    const { error: err } = await deleteSemester(id);
    if (err) setError(err);
    else await loadData();
  };

  const handleSetActive = async (id: string) => {
    if (!user?.id) return;
    const { error: err } = await setActiveSemester(user.id, id);
    if (err) setError(err);
    else await loadData();
  };

  return (
    <DashboardLayout title="Semesters">
      <motion.div initial="hidden" whileInView="visible" viewport={REPLAY_VIEWPORT} variants={staggerContainer} className="space-y-6">
        <motion.div variants={fadeInUp} className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-text">My Semesters</h2>
            <p className="text-sm text-text-muted mt-1">{semesters.length} semester{semesters.length !== 1 ? 's' : ''} created</p>
          </div>
          <Button size="sm" onClick={openAddModal}>
            <Plus size={16} /> Add Semester
          </Button>
        </motion.div>

        {error && <div className="bg-error/10 border border-error/30 rounded-xl px-4 py-3 text-sm text-error">{error}</div>}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : semesters.length === 0 ? (
          <motion.div variants={fadeInUp}>
            <GlassCard className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <Calendar className="text-primary" size={28} />
              </div>
              <h3 className="text-lg font-semibold text-text">No semesters yet</h3>
              <p className="text-sm text-text-muted mt-2 text-center max-w-sm">
                Create your first semester to start organizing subjects and timetables.
              </p>
              <Button size="sm" onClick={openAddModal} className="mt-6">
                <Plus size={16} /> Add your first semester
              </Button>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {semesters.map((sem) => (
              <motion.div key={sem.id} variants={fadeInUp} whileHover={{ y: -6, transition: { duration: 0.2 } }}>
                <GlassCard className="relative h-full group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                      <Calendar size={20} className="text-primary" />
                    </div>
                    <div className="flex gap-1">
                      {sem.is_active && (
                        <span className="text-xs font-semibold text-primary-light bg-primary/10 px-2 py-1 rounded-full flex items-center gap-1">
                          <Check size={10} /> Active
                        </span>
                      )}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(sem)} className="w-8 h-8 rounded-lg bg-surface-2 border border-border-2 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/40 transition-all cursor-pointer">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(sem.id)} className="w-8 h-8 rounded-lg bg-surface-2 border border-border-2 flex items-center justify-center text-text-muted hover:text-error hover:border-error/40 transition-all cursor-pointer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-text">{sem.name}</h3>
                  {sem.academic_year && <p className="text-xs text-text-muted mt-0.5">{sem.academic_year}</p>}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                    {sem.start_date && (
                      <div>
                        <p className="text-xs text-text-muted">Start</p>
                        <p className="text-sm font-semibold text-text">{new Date(sem.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      </div>
                    )}
                    {sem.end_date && (
                      <div>
                        <p className="text-xs text-text-muted">End</p>
                        <p className="text-sm font-semibold text-text">{new Date(sem.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      </div>
                    )}
                  </div>
                  {!sem.is_active && (
                    <button
                      onClick={() => handleSetActive(sem.id)}
                      className="w-full mt-4 h-9 rounded-lg bg-surface-2 border border-border-2 text-xs text-text-secondary hover:border-primary/40 hover:text-primary-light transition-all cursor-pointer"
                    >
                      Set as Active
                    </button>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {modalOpen && (
          <SemesterModal
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

function SemesterModal({ form, setForm, editing, submitting, error, onClose, onSubmit }: {
  form: any; setForm: React.Dispatch<React.SetStateAction<any>>; editing: Semester | null;
  submitting: boolean; error: string | null; onClose: () => void; onSubmit: () => void;
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
            <h2 className="text-lg font-bold text-text">{editing ? 'Edit Semester' : 'Add Semester'}</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-surface-2 border border-border-2 flex items-center justify-center text-text-muted hover:text-text transition-all cursor-pointer">
              <X size={16} />
            </button>
          </div>
          <div className="space-y-4">
            <Input id="name" label="Semester Name" type="text" placeholder="Semester 1" value={form.name} onChange={(e) => update('name', e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input id="start_date" label="Start Date" type="date" value={form.start_date} onChange={(e) => update('start_date', e.target.value)} />
              <Input id="end_date" label="End Date" type="date" value={form.end_date} onChange={(e) => update('end_date', e.target.value)} />
            </div>
            <Input id="academic_year" label="Academic Year" type="text" placeholder="2025-2026" value={form.academic_year} onChange={(e) => update('academic_year', e.target.value)} />
            {error && <p className="text-sm text-error">{error}</p>}
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
              <Button fullWidth onClick={onSubmit} disabled={submitting || !form.name.trim()}>
                {submitting ? 'Saving…' : editing ? 'Save Changes' : 'Add Semester'}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
