import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, ArrowRight, ArrowLeft, Check, Upload, User, Building2, BookOpen, CalendarDays, Target, Hash, Award, Users, CalendarClock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createProfile } from '@/services/db';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import {
  PERFORMANCE_TYPES, PERFORMANCE_LABELS, performanceLabel, maxScoreFor,
  WORKING_DAYS_PRESETS, WEEKDAY_KEYS, WEEKDAY_LABELS,
  detectWorkingDaysPreset, serializeWorkingDays, parseWorkingDays,
  validateProfileForm,
} from '@/lib/profile';

const steps = [
  { id: 0, label: 'Name', icon: User },
  { id: 1, label: 'College', icon: Building2 },
  { id: 2, label: 'Academics', icon: BookOpen },
  { id: 3, label: 'Setup', icon: Hash },
  { id: 4, label: 'Performance', icon: Award },
  { id: 5, label: 'Schedule', icon: CalendarClock },
  { id: 6, label: 'Goal', icon: Target },
  { id: 7, label: 'Avatar', icon: Upload },
];

const subjectColors = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
];

const DEGREE_OPTIONS = [
  'B.Tech', 'M.Tech', 'B.E.', 'M.E.', 'B.Sc', 'M.Sc',
  'B.Com', 'M.Com', 'B.A.', 'M.A.', 'BCA', 'MCA',
  'BBA', 'MBA', 'Ph.D', 'Other',
];

export default function OnboardingWizard() {
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: user?.name || '',
    college_name: '',
    branch: '',
    semester: 1,
    academic_year: '',
    attendance_goal: 75,
    avatar_url: '',
    roll_number: '',
    degree: 'B.Tech',
    section: '',
    batch_year: new Date().getFullYear(),
    performance_type: 'cgpa' as 'gpa' | 'cgpa' | 'percentage',
    current_score: '' as string | number,
    target_score: '' as string | number,
    working_days: 'mon-fri',
    working_days_preset: 'mon-fri' as 'mon-fri' | 'mon-sat' | 'sat-only' | 'custom',
    default_lecture_type: 'theory' as 'theory' | 'practical' | 'tutorial',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update('avatar_url', reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!user?.id) return;
    const values = {
      ...formData,
      current_score: formData.current_score === '' ? '' : Number(formData.current_score),
      target_score: formData.target_score === '' ? '' : Number(formData.target_score),
    };
    const formErrors = validateProfileForm(values);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error: err } = await createProfile(user.id, {
      full_name: formData.full_name || user.name || 'Student',
      college_name: formData.college_name || null,
      branch: formData.branch || null,
      semester: Number(formData.semester) || 1,
      academic_year: formData.academic_year || null,
      attendance_goal: Number(formData.attendance_goal) || 75,
      avatar_url: formData.avatar_url || null,
      roll_number: formData.roll_number || null,
      degree: formData.degree || null,
      section: formData.section || null,
      batch_year: Number(formData.batch_year) || null,
      performance_type: formData.performance_type,
      current_score: formData.current_score === '' ? null : Number(formData.current_score),
      target_score: formData.target_score === '' ? null : Number(formData.target_score),
      working_days: formData.working_days,
      default_lecture_type: formData.default_lecture_type,
    });
    setSubmitting(false);
    if (err) {
      setError(err);
      return;
    }
    await refreshProfile();
  };

  const canProceed = () => {
    const values = {
      ...formData,
      current_score: formData.current_score === '' ? '' : Number(formData.current_score),
      target_score: formData.target_score === '' ? '' : Number(formData.target_score),
    };
    const formErrors = validateProfileForm(values);
    // Only block on errors relevant to the current step
    if (step === 0) return formData.full_name.trim().length >= 2;
    if (step === 1) return formData.college_name.trim().length >= 2;
    if (step === 2) return !formErrors.branch && !formErrors.semester && !formErrors.academic_year;
    if (step === 3) return !formErrors.roll_number && !formErrors.degree && !formErrors.batch_year;
    if (step === 4) return !formErrors.performance_type && !formErrors.current_score && !formErrors.target_score;
    if (step === 5) return !formErrors.working_days && !formErrors.default_lecture_type;
    if (step === 6) return !formErrors.attendance_goal;
    return true;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg/80 backdrop-blur-md px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg"
      >
        <div className="glass-strong rounded-3xl p-8 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <GraduationCap className="text-primary" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text">Welcome to EduTrack</h2>
              <p className="text-sm text-text-muted">Let's set up your profile — takes 30 seconds</p>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s) => (
              <div key={s.id} className="flex items-center gap-2 flex-1">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
                  step >= s.id
                    ? 'bg-primary text-[#052e1a]'
                    : 'bg-surface-2 text-text-muted border border-border-2',
                )}>
                  {step > s.id ? <Check size={14} /> : s.id + 1}
                </div>
                {s.id < steps.length - 1 && (
                  <div className={cn('h-px flex-1 transition-all duration-300', step > s.id ? 'bg-primary' : 'bg-border')} />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="min-h-[140px]"
            >
              {step === 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={16} className="text-primary" />
                    <span className="text-sm font-semibold text-text">What should we call you?</span>
                  </div>
                  <Input
                    id="full_name"
                    label="Student Name"
                    type="text"
                    placeholder="Alex Johnson"
                    value={formData.full_name}
                    onChange={(e) => update('full_name', e.target.value)}
                  />
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 size={16} className="text-primary" />
                    <span className="text-sm font-semibold text-text">Where do you study?</span>
                  </div>
                  <Input
                    id="college_name"
                    label="College / University"
                    type="text"
                    placeholder="National Institute of Technology"
                    value={formData.college_name}
                    onChange={(e) => update('college_name', e.target.value)}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen size={16} className="text-primary" />
                    <span className="text-sm font-semibold text-text">Academic details</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      id="branch"
                      label="Branch / Major"
                      type="text"
                      placeholder="Computer Science"
                      value={formData.branch}
                      onChange={(e) => update('branch', e.target.value)}
                    />
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">Semester</label>
                      <select
                        value={formData.semester}
                        onChange={(e) => update('semester', e.target.value)}
                        className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-border-2 text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <option key={s} value={s}>Semester {s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Input
                    id="academic_year"
                    label="Academic Year"
                    type="text"
                    placeholder="2025-2026"
                    value={formData.academic_year}
                    onChange={(e) => update('academic_year', e.target.value)}
                  />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash size={16} className="text-primary" />
                    <span className="text-sm font-semibold text-text">Academic setup</span>
                  </div>
                  <Input
                    id="roll_number"
                    label="Roll / Enrollment Number"
                    type="text"
                    placeholder="e.g. 21CS0101"
                    value={formData.roll_number}
                    onChange={(e) => update('roll_number', e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">Degree</label>
                      <select
                        value={formData.degree}
                        onChange={(e) => update('degree', e.target.value)}
                        className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-border-2 text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      >
                        {DEGREE_OPTIONS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <Input
                      id="section"
                      label="Section"
                      type="text"
                      placeholder="e.g. A"
                      value={formData.section}
                      onChange={(e) => update('section', e.target.value)}
                    />
                  </div>
                  <Input
                    id="batch_year"
                    label="Batch Year"
                    type="number"
                    placeholder="e.g. 2023"
                    value={formData.batch_year}
                    onChange={(e) => update('batch_year', e.target.value)}
                  />
                  <p className="text-xs text-text-muted">You can edit all of these later in Settings.</p>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award size={16} className="text-primary" />
                    <span className="text-sm font-semibold text-text">Academic performance</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Performance Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {PERFORMANCE_TYPES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => update('performance_type', t)}
                          className={cn(
                            'h-11 rounded-xl text-sm font-medium transition-all cursor-pointer border',
                            formData.performance_type === t
                              ? 'bg-primary/15 border-primary/40 text-primary-light'
                              : 'bg-surface-2 border-border-2 text-text-muted hover:text-text',
                          )}
                        >
                          {PERFORMANCE_LABELS[t]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Current {performanceLabel(formData.performance_type)}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={maxScoreFor(formData.performance_type)}
                        placeholder={`e.g. ${maxScoreFor(formData.performance_type) === 100 ? '78' : '8.5'}`}
                        value={formData.current_score}
                        onChange={(e) => update('current_score', e.target.value)}
                        className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-border-2 text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                      {errors.current_score && <p className="text-xs text-error mt-1">{errors.current_score}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Target {performanceLabel(formData.performance_type)}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={maxScoreFor(formData.performance_type)}
                        placeholder={`e.g. ${maxScoreFor(formData.performance_type) === 100 ? '85' : '9.0'}`}
                        value={formData.target_score}
                        onChange={(e) => update('target_score', e.target.value)}
                        className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-border-2 text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                      {errors.target_score && <p className="text-xs text-error mt-1">{errors.target_score}</p>}
                    </div>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarClock size={16} className="text-primary" />
                    <span className="text-sm font-semibold text-text">Working days & schedule</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Working Days</label>
                    <div className="grid grid-cols-2 gap-2">
                      {WORKING_DAYS_PRESETS.map((p) => {
                        const labels: Record<string, string> = {
                          'mon-fri': 'Monday–Friday',
                          'mon-sat': 'Monday–Saturday',
                          'sat-only': 'Saturday Only',
                          'custom': 'Custom',
                        };
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => {
                              update('working_days_preset', p);
                              if (p !== 'custom') update('working_days', p);
                            }}
                            className={cn(
                              'h-11 rounded-xl text-sm font-medium transition-all cursor-pointer border',
                              formData.working_days_preset === p
                                ? 'bg-primary/15 border-primary/40 text-primary-light'
                                : 'bg-surface-2 border-border-2 text-text-muted hover:text-text',
                            )}
                          >
                            {labels[p]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {formData.working_days_preset === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">Select days</label>
                      <div className="flex gap-2 flex-wrap">
                        {WEEKDAY_KEYS.map((d) => {
                          const selected = parseWorkingDays(formData.working_days).includes(d);
                          return (
                            <button
                              key={d}
                              type="button"
                              onClick={() => {
                                const current = parseWorkingDays(formData.working_days);
                                const next = selected
                                  ? current.filter((x) => x !== d)
                                  : [...current, d];
                                update('working_days', serializeWorkingDays(next));
                              }}
                              className={cn(
                                'w-11 h-11 rounded-xl text-xs font-semibold transition-all cursor-pointer border',
                                selected
                                  ? 'bg-primary/15 border-primary/40 text-primary-light'
                                  : 'bg-surface-2 border-border-2 text-text-muted hover:text-text',
                              )}
                            >
                              {WEEKDAY_LABELS[d]}
                            </button>
                          );
                        })}
                      </div>
                      {errors.working_days && <p className="text-xs text-error mt-1">{errors.working_days}</p>}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Default Lecture Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['theory', 'practical', 'tutorial'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => update('default_lecture_type', t)}
                          className={cn(
                            'h-11 rounded-xl text-sm font-medium capitalize transition-all cursor-pointer border',
                            formData.default_lecture_type === t
                              ? 'bg-primary/15 border-primary/40 text-primary-light'
                              : 'bg-surface-2 border-border-2 text-text-muted hover:text-text',
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={16} className="text-primary" />
                    <span className="text-sm font-semibold text-text">Set your attendance goal</span>
                  </div>
                  <div className="text-center py-6">
                    <div className="text-5xl font-bold text-gradient mb-2">{formData.attendance_goal}%</div>
                    <p className="text-sm text-text-muted">Minimum attendance to maintain</p>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={100}
                    value={formData.attendance_goal}
                    onChange={(e) => update('attendance_goal', Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-text-muted">
                    <span>50%</span>
                    <span>75% (default)</span>
                    <span>100%</span>
                  </div>
                  {errors.attendance_goal && <p className="text-xs text-error mt-1">{errors.attendance_goal}</p>}
                </div>
              )}

              {step === 7 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Upload size={16} className="text-primary" />
                    <span className="text-sm font-semibold text-text">Profile picture (optional)</span>
                  </div>
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="w-24 h-24 rounded-3xl bg-surface-2 border-2 border-border-2 flex items-center justify-center overflow-hidden">
                      {formData.avatar_url ? (
                        <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl font-bold text-primary-light">
                          {(formData.full_name || 'S').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                      <span className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-surface-2 border border-border-2 text-sm text-text-secondary hover:border-primary/40 transition-all">
                        <Upload size={14} /> Upload photo
                      </span>
                    </label>
                    <p className="text-xs text-text-muted">You can skip this and add it later</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {error && (
            <p className="text-sm text-error mt-4">{error}</p>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || submitting}
              className={cn(step === 0 && 'opacity-0 pointer-events-none')}
            >
              <ArrowLeft size={16} /> Back
            </Button>

            {step < steps.length - 1 ? (
              <Button
                size="sm"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
              >
                Next <ArrowRight size={16} />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Saving…' : 'Complete setup'} {!submitting && <Check size={16} />}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
