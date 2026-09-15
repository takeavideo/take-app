import { Session, User } from '@supabase/supabase-js';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { isSupabaseConfigured } from '@/lib/env';
import { supabase } from '@/lib/supabase';
import { getCurrentProfile } from '@/services/profileService';
import { Profile } from '@/types/supabase';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isConfigured: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId: string) {
    try {
      const currentProfile = await getCurrentProfile(userId);
      setProfile(currentProfile);
    } catch {
      setProfile(null);
    }
  }

  const refreshProfile = useCallback(async () => {
    if (!session?.user.id) {
      setProfile(null);
      return;
    }

    await loadProfile(session.user.id);
  }, [session?.user.id]);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      setSession(data.session);
      if (data.session?.user.id) {
        await loadProfile(data.session.user.id);
      }
      setLoading(false);
    }

    bootstrap();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user.id) {
        loadProfile(nextSession.user.id);
        return;
      }

      setProfile(null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      isConfigured: isSupabaseConfigured,
      refreshProfile,
    }),
    [loading, profile, refreshProfile, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }

  return context;
}
