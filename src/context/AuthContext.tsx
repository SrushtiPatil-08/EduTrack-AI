import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  getSession,
  onAuthStateChange,
  signInWithEmail,
  signUpWithEmail,
  signOut,
} from '@/services/auth';
import { getProfile } from '@/services/db';

type User = { id: string; email: string; name?: string } | null;

type Profile = {
  id: string;
  full_name: string;
  college_name: string | null;
  branch: string | null;
  semester: number | null;
  academic_year: string | null;
  attendance_goal: number;
  avatar_url: string | null;
  onboarding_completed: boolean;
} | null;

type AuthContextValue = {
  user: User;
  profile: Profile;
  initializing: boolean;
  loading: boolean;
  needsOnboarding: boolean;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [profile, setProfile] = useState<Profile>(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadProfile = useCallback(async (userId: string) => {
    const { profile: p, error } = await getProfile(userId);
    if (!error && p) {
      setProfile(p as Profile);
    } else {
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await loadProfile(user.id);
    }
  }, [user?.id, loadProfile]);

  useEffect(() => {
    let mounted = true;
    let sub: { unsubscribe: () => void } | undefined;

    (async () => {
      const { session } = await getSession();
      if (!mounted) return;
      if (session?.user) {
        const u = {
          id: session.user.id,
          email: session.user.email ?? '',
          name: session.user.user_metadata?.name,
        };
        setUser(u);
        await loadProfile(u.id);
      }
      setInitializing(false);

      const subscription = onAuthStateChange((session: any) => {
        if (session?.user) {
          const u = {
            id: session.user.id,
            email: session.user.email ?? '',
            name: session.user.user_metadata?.name,
          };
          setUser(u);
          (async () => {
            await loadProfile(u.id);
          })();
        } else {
          setUser(null);
          setProfile(null);
        }
      });
      sub = subscription;
    })();

    return () => {
      mounted = false;
      sub?.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    const result = await signInWithEmail(email, password);
    setLoading(false);
    if (result.error) return { error: result.error };
    return {};
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    setLoading(true);
    const result = await signUpWithEmail(name, email, password);
    setLoading(false);
    if (result.error) return { error: result.error };
    return {};
  }, []);

  const handleSignOut = useCallback(async () => {
    setLoading(true);
    await signOut();
    setUser(null);
    setProfile(null);
    setLoading(false);
  }, []);

  const needsOnboarding = !!user && (!profile || !profile.onboarding_completed);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      initializing,
      loading,
      needsOnboarding,
      refreshProfile,
      signIn,
      signUp,
      signOut: handleSignOut,
    }),
    [user, profile, initializing, loading, needsOnboarding, refreshProfile, signIn, signUp, handleSignOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
