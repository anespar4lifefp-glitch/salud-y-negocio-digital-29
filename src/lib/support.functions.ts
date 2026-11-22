import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { handoffInput, profileInput, supportMessage } from './support';

export const loadSupport = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: conversationId, error: conversationError } = await context.supabase.rpc('open_support_conversation');
  if (conversationError || !conversationId) throw new Error('No se pudo abrir tu conversación.');
  const [messages, profile, tickets] = await Promise.all([
    context.supabase.from('support_messages').select('id,role,parts').eq('conversation_id', conversationId).order('created_at').order('id'),
    context.supabase.from('profiles').select('display_name,preferences').eq('id', context.userId).maybeSingle(),
    context.supabase.from('support_tickets').select('id,status,summary,notification_status').eq('user_id', context.userId).order('created_at', { ascending: false }).limit(5),
  ]);
  if (messages.error || profile.error || tickets.error) throw new Error('No se pudo cargar tu historial.');
  return { conversationId, messages: (messages.data ?? []).map(row => supportMessage.parse(row)), profile: profile.data, tickets: tickets.data ?? [] };
});
export const saveSupportProfile = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(input => profileInput.parse(input)).handler(async ({ data, context }) => {
  const { error } = await context.supabase.from('profiles').upsert({ id: context.userId, display_name: data.name, preferences: data.preferences });
  if (error) throw new Error('No se pudo guardar el perfil.');
  return { saved: true };
});
export const requestHandoff = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(input => handoffInput.parse(input)).handler(async ({ data, context }) => {
  const { data: ticketId, error } = await context.supabase.rpc('request_support_handoff', { _request_id: data.requestId, _conversation_id: data.conversationId, _name: data.name, _email: data.email, _order_number: data.orderNumber, _summary: data.summary });
  if (error || !ticketId) throw new Error('No se pudo guardar la solicitud. Conservamos tus datos para que puedas reintentar.');
  // Email delivery remains disabled until an owned sender domain is configured.
  return { ticketId, notificationSent: false };
});