import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GraduationCap, ArrowLeft, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Min 6 characters'),
});
type FormData = z.infer<typeof schema>;

export default function SignIn() {
  const navigate = useNavigate();
  const { signIn, loading } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) { navigate('/signup'); return; }
    const t = setTimeout(() => setCountdown(c => (c ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, navigate]);

  const onSubmit = async (data: FormData) => {
    setFormError(null);
    const result = await signIn(data.email, data.password);
    if (result.error) {
      if (result.error === 'NO_ACCOUNT') {
        setFormError('No account found. Please create an account.');
        setCountdown(3);
      } else {
        setFormError(result.error);
      }
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-text-muted hover:text-text transition-colors mb-8">
          <ArrowLeft size={18} />
          <span className="text-sm">Back to home</span>
        </Link>

        <div className="glass rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <GraduationCap className="text-primary" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text">Welcome back</h1>
              <p className="text-sm text-text-muted">Sign in to continue to EduTrack</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="you@university.edu"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            {formError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2 bg-error/10 border border-error/30 rounded-xl px-4 py-3"
              >
                <AlertCircle size={16} className="text-error shrink-0" />
                <span className="text-sm text-error">{formError}</span>
              </motion.div>
            )}

            {countdown !== null && (
              <p className="text-xs text-text-muted">Redirecting to sign up in {countdown}s…</p>
            )}

            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
              {!loading && <ArrowRight size={18} />}
            </Button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-light font-semibold hover:text-primary transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
