import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

export async function authenticateSupport(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer /, '');
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!token || token.split('.').length !== 3 || !url || !key) return null;
  const supabase = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { headers: { Authorization: `Bearer ${token}` }, fetch: (input, init) => { const headers = new Headers(init?.headers); headers.set('apikey', key); return fetch(input, { ...init, headers }); } } });
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims?.sub) return null;
  return { supabase, userId: data.claims.sub };
}