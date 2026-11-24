import { z } from 'zod';

// Only facts already published in this application's catalog and educational guides.
export const helpArticles = [
  { id: 'compras', title: 'Comprar productos 4Life', text: 'Las compras de suplementos se realizan en la tienda oficial 4Life de Antonio. El precio, la disponibilidad y las condiciones de envío se consultan allí, según tu mercado. Esta página no procesa compras de suplementos.', href: 'https://www.4life.com/12965034/shop' },
  { id: 'guias', title: 'Leer y descargar guías', text: 'Las guías educativas son gratuitas. Abre una guía desde la biblioteca para leerla, descargarla como TXT o imprimirla y guardarla como PDF. Son material educativo independiente y no sustituyen el consejo médico.', href: '/#ebooks' },
  { id: 'pagos', title: 'Pagos y cotizaciones', text: 'Los servicios se cotizan en USD. Los pagos con tarjeta están pendientes de activación. Antes de enviar criptomonedas, coordina con Antonio; la dirección Rabby indicada corresponde a Base, no a Ethereum mainnet ni a Bitcoin nativo. La página no verifica transferencias.', href: '/#contacto' },
  { id: 'servicios', title: 'Servicios digitales', text: 'Antonio ofrece creación de páginas web, tiendas, agentes de IA, automatización y CRM, y marketing digital. Solicita una propuesta personalizada; no hay una tarifa fija publicada.', href: '/#agencia' },
  { id: 'seguridad', title: 'Información responsable sobre suplementos', text: 'Los suplementos no diagnostican, tratan, curan ni previenen enfermedades. Revisa la etiqueta de tu país y consulta a un profesional de salud sobre medicamentos, alergias, embarazo o condiciones médicas. No ofrecemos diagnósticos, dosis ni tratamientos.', href: '/ebooks/suplementos' },
  { id: 'contacto', title: 'Contactar con Antonio', text: 'Puedes contactar con Antonio Rafael Espinoza Arellano por WhatsApp en +58 412 448 6046 o por correo en anespar4lifefp@gmail.com. No hay un horario ni un plazo de respuesta publicado.', href: 'https://wa.me/584124486046' },
] as const;

export const articleId = z.enum(['compras', 'guias', 'pagos', 'servicios', 'seguridad', 'contacto']);
export const supportSelection = z.object({ articleIds: z.array(articleId).max(3), handoff: z.boolean() }).strict();
export const textPart = z.object({ type: z.literal('text'), text: z.string() });
export const toolPart = z.object({ type: z.literal('dynamic-tool'), toolCallId: z.string(), toolName: z.enum(['search_help', 'lookup_order']), state: z.enum(['output-available', 'output-error']), input: z.object({ query: z.string() }), output: z.string(), errorText: z.string().optional() });
export const supportPart = z.union([textPart, toolPart]);
export const supportMessage = z.object({ id: z.string(), role: z.enum(['user', 'assistant']), parts: z.array(supportPart) });
export type SupportMessage = z.infer<typeof supportMessage>;
export type SupportPart = z.infer<typeof supportPart>;
export const supportTurn = z.object({ conversationId: z.string().uuid(), text: z.string().trim().min(1).max(2000), mode: z.enum(['chat', 'order']).default('chat'), orderNumber: z.string().trim().max(100).default(''), email: z.string().trim().max(254).default('') }).superRefine((v, ctx) => {
  if (v.mode === 'order' && (!v.orderNumber || !z.string().email().safeParse(v.email).success)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Número y correo de pedido requeridos' });
});
export const handoffInput = z.object({ conversationId: z.string().uuid(), requestId: z.string().uuid(), name: z.string().trim().min(2).max(100), email: z.string().trim().email().max(254), orderNumber: z.string().trim().max(100), summary: z.string().trim().min(10).max(2000) });
export const profileInput = z.object({ name: z.string().trim().min(2).max(100), preferences: z.string().trim().max(600) });
export const handoffText = 'No tengo información suficientemente confiable para resolverlo. Puedo solicitar atención de una persona del equipo; completa tus datos y un breve resumen. La solicitud no significa que una persona ya esté conectada.';
export const requiresHuman = (text: string) => /humano|persona|asesor|agente real|frustrad|molest|enojad|harto|no funciona|no entiendes|no me ayuda|incertidumbre|no estoy segur|diagn[oó]st|tratamiento|diabetes|embaraz|medicamento|dosis|dolor|s[ií]ntoma|curar/i.test(text);
export function articleAnswer(selection: z.infer<typeof supportSelection>) {
  if (selection.handoff || selection.articleIds.length === 0) return { text: handoffText, handoff: true };
  const articles = [...new Set(selection.articleIds)].map(id => helpArticles.find(article => article.id === id)).filter(article => article !== undefined);
  return { text: articles.map(article => `${article.text}\n\n[${article.title}](${article.href})`).join('\n\n'), handoff: false };
}
export function canReadOrder(order: { user_id: string; order_number: string; customer_email: string }, userId: string, number: string, email: string) {
  return order.user_id === userId && order.order_number === number.trim() && order.customer_email.trim().toLowerCase() === email.trim().toLowerCase();
}
export const supportEvent = z.discriminatedUnion('type', [
  z.object({ type: z.literal('message'), message: supportMessage, handoff: z.boolean() }),
  z.object({ type: z.literal('error'), text: z.string() }),
]);