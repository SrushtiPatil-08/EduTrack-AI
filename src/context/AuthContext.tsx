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

type User = { id: string; email: string; name?: string } | null;

type AuthContextValue = {
  user: User;
  initializing: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    let sub: { unsubscribe: () => void } | undefined;

    (async () => {
      const { session } = await getSession();
      if (!mounted) return;
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          name: session.user.user_metadata?.name,
        });
      }
      setInitializing(false);

      const subscription = onAuthStateChange((session: any) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email ?? '',
            name: session.user.user_metadata?.name,
          });
        } else {
          setUser(null);
        }
      });
      sub = subscription;
    })();

    return () => {
      mounted = false;
      sub?.unsubscribe();
    };
  }, []);

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
    setLoading(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, initializing, loading, signIn, signUp, signOut: handleSignOut }),
    [user, initializing, loading, signIn, signUp, handleSignOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
