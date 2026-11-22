import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';

const SupportSession = createContext<{ user: User | null; loading: boolean }>({ user: null, loading: true });
export const useSupportSession = () => useContext(SupportSession);
export function SupportSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const queries = useQueryClient();
  const router = useRouter();
  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => { if (active) { setUser(data.user); setLoading(false); } });
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== 'SIGNED_IN' && event !== 'SIGNED_OUT' && event !== 'USER_UPDATED') return;
      setUser(session?.user ?? null); setLoading(false);
      void router.invalidate();
      if (event !== 'SIGNED_OUT') void queries.invalidateQueries();
      else { void queries.cancelQueries(); queries.clear(); }
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [queries, router]);
  return <SupportSession.Provider value={{ user, loading }}>{children}</SupportSession.Provider>;
}