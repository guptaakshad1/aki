import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from './supabase';
import { ensureWallet } from './wallet';
import { generateUpiId } from './format';
import type { Profile } from './types';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        (async () => {
          await loadProfile(data.session!.user.id);
          setLoading(false);
        })();
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        (async () => {
          await loadProfile(newSession!.user.id);
          setLoading(false);
        })();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string) {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id, full_name, phone, upi_id, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (existing) {
      setProfile(existing as Profile);
      await ensureWallet(userId);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const fullName = userData.user?.user_metadata?.full_name ?? 'User';
    const upiId = generateUpiId(fullName);

    const { data: newProfile } = await supabase
      .from('profiles')
      .insert({ id: userId, full_name: fullName, upi_id: upiId })
      .select('id, full_name, phone, upi_id, created_at')
      .maybeSingle();

    setProfile(newProfile as Profile);
    await ensureWallet(userId);
  }

  async function signUp(email: string, password: string, fullName: string) {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured. Add the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY variables.');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    if (data.session) {
      setSession(data.session);
      await loadProfile(data.user!.id);
    }
  }

  async function signIn(email: string, password: string) {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured. Add the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY variables.');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setSession(data.session);
    await loadProfile(data.user!.id);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
