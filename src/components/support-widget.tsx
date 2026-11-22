import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Headset, X, UserRound, LogOut, ArrowLeft, Send, LoaderCircle, MessageCircle, BookOpen } from 'lucide-react';
import { LovableMark } from '@lovable.dev/cloud-auth-js/react';
import { lovable } from '@/integrations/lovable';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Conversation, ConversationContent, ConversationScrollButton } from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import { PromptInput, PromptInputTextarea, PromptInputFooter, PromptInputSubmit } from '@/components/ai-elements/prompt-input';
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from '@/components/ai-elements/tool';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { useSupportSession } from './support-session';
import { loadSupport, requestHandoff, saveSupportProfile } from '@/lib/support.functions';
import { supportEvent, type SupportMessage } from '@/lib/support';
import logo from '@/assets/business-logo.png.asset.json';

function GoogleMark() {
  return <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-[18px]"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>;
}

export default function SupportWidget() {
  const [open, setOpen] = useState(false);
  const { user, loading } = useSupportSession();
  const [authError, setAuthError] = useState('');
  const [authPending, setAuthPending] = useState(false);
  async function signIn(provider: 'google' | 'lovable') {
    setAuthPending(true); setAuthError('');
    try {
      sessionStorage.setItem('support-open', 'yes');
      const response = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
      if (response.error) setAuthError('No pudimos iniciar sesión. Inténtalo más tarde.');
    } catch { setAuthError('No pudimos iniciar sesión. Inténtalo más tarde.'); }
    finally { setAuthPending(false); }
  }
  useEffect(() => { if (sessionStorage.getItem('support-open') === 'yes') { setOpen(true); sessionStorage.removeItem('support-open'); } }, []);
  return <>
    <Button className="support-launcher" size="icon" onClick={() => setOpen(!open)} aria-label={open ? 'Cerrar soporte' : 'Abrir soporte al cliente'} aria-expanded={open} title="Soporte al cliente">{open ? <X /> : <Headset />}</Button>
    {open && <section className="support-panel" aria-label="Soporte al cliente"><header className="support-header"><img src={logo.url} alt="saludynegociodigital" /><div className="min-w-0 flex-1"><h2>Atención al cliente</h2><p>saludynegociodigital</p></div><Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Cerrar panel de soporte" title="Cerrar"><X /></Button></header>
      {loading ? <div className="support-intro"><LoaderCircle className="animate-spin" /></div> : user ? <CustomerConversation key={user.id} userId={user.id} email={user.email ?? ''} /> : <div className="support-intro"><h3>Bienvenido, ¿en qué podemos ayudarte?</h3><p>Inicia sesión para conservar tu conversación, consultar pedidos de tu cuenta y solicitar atención humana.</p><Button className="google-signin" variant="outline" disabled={authPending} onClick={() => signIn('google')}><GoogleMark />Continuar con Google</Button><Button variant="outline" className="w-full" disabled={authPending} onClick={() => signIn('lovable')}><LovableMark />Continuar con Lovable</Button>{authError && <p role="alert" className="text-destructive">{authError}</p>}<Button variant="link" asChild><Link to="/ayuda" onClick={() => setOpen(false)}><BookOpen />Consultar ayuda sin iniciar sesión</Link></Button><p className="support-privacy">Tu historial y perfil se conservan en tu cuenta. Si solicitas atención humana, el equipo podrá recibir el historial y tus datos de contacto. No compartas contraseñas, tarjetas ni información médica.</p></div>}
    </section>}
  </>;
}

function CustomerConversation({ userId, email }: { userId: string; email: string }) {
  const load = useServerFn(loadSupport);
  const handoff = useServerFn(requestHandoff);
  const saveProfile = useServerFn(saveSupportProfile);
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['support', userId], queryFn: () => load() });
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [pane, setPane] = useState<'chat' | 'order' | 'handoff' | 'profile'>('chat');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [needsHuman, setNeedsHuman] = useState(false);
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const controller = useRef<AbortController | null>(null);
  const composer = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => { if (query.data) setMessages(query.data.messages); }, [query.data]);
  useEffect(() => { if (pane === 'chat' && !busy) composer.current?.focus(); }, [pane, busy, query.data]);
  useEffect(() => () => { controller.current?.abort(); }, []);

  async function send(value: string, order?: { number: string; email: string }) {
    if (busy || !query.data || !value.trim()) return;
    setBusy(true); setError(''); setNotice(''); setText(''); setPane('chat');
    setMessages(previous => [...previous, { id: crypto.randomUUID(), role: 'user', parts: [{ type: 'text', text: value }] }]);
    const abort = new AbortController(); controller.current = abort;
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Inicia sesión para continuar.');
      const response = await fetch('/api/support', { method: 'POST', signal: abort.signal, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.session.access_token}` }, body: JSON.stringify({ conversationId: query.data.conversationId, text: value, mode: order ? 'order' : 'chat', orderNumber: order?.number ?? '', email: order?.email ?? '' }) });
      if (!response.ok || !response.body) throw new Error(response.status === 409 ? 'Ya hay una consulta en curso. Inténtalo más tarde.' : 'No pudimos completar la consulta.');
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = ''; let completed = false;
      while (true) {
        const chunk = await reader.read(); if (chunk.done) break;
        buffer += decoder.decode(chunk.value, { stream: true });
        let boundary = buffer.indexOf('\n\n');
        while (boundary !== -1) {
          const frame = buffer.slice(0, boundary); buffer = buffer.slice(boundary + 2);
          if (frame.startsWith('data: ')) {
            const event = supportEvent.parse(JSON.parse(frame.slice(6)));
            if (event.type === 'error') throw new Error(event.text);
            setMessages(previous => [...previous, event.message]); setNeedsHuman(event.handoff); completed = true;
          }
          boundary = buffer.indexOf('\n\n');
        }
      }
      if (!completed) throw new Error('La respuesta quedó incompleta. Puedes solicitar atención humana.');
      await query.refetch();
    } catch (caught) {
      if (!abort.signal.aborted) { setError(caught instanceof Error ? caught.message : 'No se pudo completar la consulta.'); setText(value); setNeedsHuman(true); }
      else setNotice('Consulta detenida. Tu mensaje permanece en el historial.');
      if (!abort.signal.aborted) await query.refetch();
    } finally { if (controller.current === abort) { setBusy(false); controller.current = null; } }
  }
  async function submitTicket(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy || !query.data) return;
    const form = new FormData(event.currentTarget); setBusy(true); setError('');
    try {
      const result = await handoff({ data: { requestId, conversationId: query.data.conversationId, name: String(form.get('name') ?? ''), email: String(form.get('email') ?? ''), orderNumber: String(form.get('orderNumber') ?? ''), summary: String(form.get('summary') ?? '') } });
      setNotice(`Solicitud ${result.ticketId.slice(0, 8)} guardada con tu historial. El aviso por correo aún no está activo; no hay una persona conectada al chat. Puedes contactar directamente con el equipo.`);
      setRequestId(crypto.randomUUID()); setPane('chat'); setNeedsHuman(false); await query.refetch();
    } catch { setError('No se pudo guardar la solicitud. Reintenta sin cerrar el formulario.'); }
    finally { setBusy(false); }
  }
  async function submitProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    const form = new FormData(event.currentTarget); setBusy(true); setError('');
    try { await saveProfile({ data: { name: String(form.get('name') ?? ''), preferences: String(form.get('preferences') ?? '') } }); await query.refetch(); setNotice('Perfil guardado.'); setPane('chat'); }
    catch { setError('No se pudo guardar el perfil.'); } finally { setBusy(false); }
  }
  async function signOut() { controller.current?.abort(); await queryClient.cancelQueries(); queryClient.clear(); await supabase.auth.signOut(); }
  const openPane = (value: typeof pane) => { setPane(value); setError(''); };
  return <div className="support-body">
    <nav className="support-toolbar" aria-label="Opciones de soporte"><Button size="sm" variant="outline" onClick={() => openPane('handoff')} disabled={busy}><Headset />Hablar con una persona</Button><div className="flex gap-1"><Button size="icon" variant="ghost" title="Mi perfil" aria-label="Mi perfil" onClick={() => openPane('profile')} disabled={busy}><UserRound /></Button><Button size="icon" variant="ghost" title="Cerrar sesión" aria-label="Cerrar sesión" onClick={signOut}><LogOut /></Button></div></nav>
    {query.isPending ? <div className="support-intro"><Shimmer>Cargando tu conversación…</Shimmer></div> : query.isError ? <div className="support-intro"><p role="alert">No se pudo cargar tu conversación.</p><Button onClick={() => query.refetch()}>Reintentar</Button></div> : <>
    {pane === 'chat' ? <><Conversation className="support-transcript"><ConversationContent className="gap-5 p-4">{messages.length === 0 && <div className="space-y-4"><h3 className="text-lg">Hola{query.data?.profile?.display_name ? `, ${query.data.profile.display_name}` : ''}.</h3><p className="text-sm text-muted-foreground">¿Qué necesitas resolver hoy?</p><div className="support-suggestions"><Button size="sm" variant="outline" onClick={() => openPane('order')}>Consultar mi pedido</Button><Button size="sm" variant="outline" onClick={() => send('¿Dónde compro los productos y cómo descargo las guías?')}>Preguntas frecuentes</Button><Button size="sm" variant="outline" onClick={() => openPane('handoff')}>Hablar con una persona</Button></div></div>}{messages.map(message => <Message key={message.id} from={message.role}><MessageContent>{message.parts.map((part, index) => part.type === 'text' ? <MessageResponse key={index}>{part.text}</MessageResponse> : <Tool key={part.toolCallId} defaultOpen={false}><ToolHeader type="dynamic-tool" toolName={part.toolName} state={part.state} title={part.toolName === 'lookup_order' ? 'Consulta de pedido' : 'Ayuda consultada'} /><ToolContent><ToolInput input={part.input} /><ToolOutput output={part.output} errorText={part.errorText} /></ToolContent></Tool>)}</MessageContent></Message>)}{busy && <Message from="assistant"><MessageContent><Shimmer>Consultando información verificada…</Shimmer></MessageContent></Message>}{notice && <p className="support-notice" role="status">{notice}</p>}{needsHuman && <Button variant="secondary" size="sm" onClick={() => openPane('handoff')} disabled={busy}>Solicitar atención humana</Button>}{query.data?.tickets.map(ticket => <div className="support-ticket" key={ticket.id}><strong>Solicitud {ticket.id.slice(0, 8)}</strong><span>{ticket.status === 'closed' ? 'Cerrada' : ticket.status === 'in_progress' ? 'En atención' : 'Registrada'}</span></div>)}</ConversationContent><ConversationScrollButton aria-label="Ir al último mensaje" /></Conversation>
    <div className="support-composer">{error && <p className="text-xs text-destructive mb-2" role="alert">{error}</p>}<PromptInput onSubmit={({ text: value }) => send(value)}><PromptInputTextarea ref={composer} name="message" aria-label="Tu pregunta de soporte" placeholder="Escribe tu pregunta…" maxLength={2000} value={text} onChange={event => setText(event.target.value)} disabled={busy} /><PromptInputFooter className="justify-end"><PromptInputSubmit status={busy ? 'submitted' : 'ready'} aria-label={busy ? 'Detener consulta' : 'Enviar pregunta'} title={busy ? 'Detener' : 'Enviar'} disabled={!busy && !text.trim()} onStop={() => controller.current?.abort()} /></PromptInputFooter></PromptInput><p className="support-privacy">Historial privado en tu cuenta · Sin diagnósticos médicos</p></div></> : <div className="support-form-pane"><Button variant="ghost" size="sm" onClick={() => openPane('chat')} disabled={busy}><ArrowLeft />Volver al chat</Button>
      {pane === 'profile' ? <form onSubmit={submitProfile} className="support-form"><h3>Mi perfil</h3><Label htmlFor="support-name">Nombre</Label><Input id="support-name" name="name" required minLength={2} maxLength={100} defaultValue={query.data?.profile?.display_name ?? ''} /><Label htmlFor="support-preferences">Preferencias de atención</Label><Textarea id="support-preferences" name="preferences" maxLength={600} defaultValue={query.data?.profile?.preferences ?? ''} placeholder="Por ejemplo, prefiero respuestas breves por correo." /><Button type="submit" disabled={busy}>{busy ? <LoaderCircle className="animate-spin" /> : <UserRound />}Guardar perfil</Button></form> : pane === 'order' ? <form className="support-form" onSubmit={event => { event.preventDefault(); const form = new FormData(event.currentTarget); void send('Quiero consultar el estado de mi pedido.', { number: String(form.get('orderNumber') ?? ''), email: String(form.get('email') ?? '') }); }}><h3>Consultar mi pedido</h3><p>Solo mostramos pedidos que coincidan con tu cuenta, número y correo.</p><Label htmlFor="lookup-number">Número de pedido</Label><Input id="lookup-number" name="orderNumber" required maxLength={100} /><Label htmlFor="lookup-email">Correo del pedido</Label><Input id="lookup-email" name="email" type="email" required maxLength={254} defaultValue={email} /><Button type="submit" disabled={busy}>Consultar pedido</Button></form> : <form className="support-form" onSubmit={submitTicket}><h3>Atención de una persona</h3><p>Guardaremos tu solicitud y el historial para revisión. El aviso automático aún no está activo.</p><Label htmlFor="ticket-name">Nombre</Label><Input id="ticket-name" name="name" required minLength={2} maxLength={100} defaultValue={query.data?.profile?.display_name ?? ''} /><Label htmlFor="ticket-email">Correo de contacto</Label><Input id="ticket-email" name="email" type="email" required maxLength={254} defaultValue={email} /><Label htmlFor="ticket-order">Número de pedido (opcional)</Label><Input id="ticket-order" name="orderNumber" maxLength={100} /><Label htmlFor="ticket-summary">Resumen del problema</Label><Textarea id="ticket-summary" name="summary" required minLength={10} maxLength={2000} /><Button type="submit" disabled={busy}>{busy ? <LoaderCircle className="animate-spin" /> : <Send />}Guardar solicitud</Button><Button variant="outline" asChild><a href="mailto:anespar4lifefp@gmail.com"><MessageCircle />Contactar al equipo por correo</a></Button></form>}{error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </div>}</>}
  </div>;
}