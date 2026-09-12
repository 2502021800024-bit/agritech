import { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/supabaseClient';
import type { UserRole } from '@/types';

interface UserProfile {
  phone: string;
  role: UserRole;
  full_name: string | null;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        loadProfile(data.session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        (async () => {
          await loadProfile(newSession.user.id);
        })();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('phone, role, full_name')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      setProfile({
        phone: data.phone,
        role: data.role as UserRole,
        full_name: data.full_name,
      });
    }
    setLoading(false);
  };

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  }, []);

  return {
    session,
    profile,
    loading,
    signOut,
    setProfile,
  };
}
