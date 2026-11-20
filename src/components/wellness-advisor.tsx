import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Link } from '@tanstack/react-router';
import { Leaf, LoaderCircle, ArrowUpRight, BookOpen, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { suggestWellness } from '@/lib/wellness.functions';
import { wellnessProducts, type WellnessResult } from '@/lib/wellness';
import { guides } from '@/lib/education';
import { shopUrl } from './site-header';

export function WellnessAdvisor() {
  const suggest = useServerFn(suggestWellness);
  const [goals, setGoals] = useState('');
  const [preferences, setPreferences] = useState('');
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<WellnessResult | null>(null);
  const [error, setError] = useState('');
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending) return;
    setPending(true); setError(''); setResult(null);
    try { const response = await suggest({ data: { goals, preferences } }); setResult(response.result); setError(response.error ?? ''); }
    catch { setError('No se pudo completar la consulta. Inténtalo más tarde; tus objetivos se conservan.'); }
    finally { setPending(false); }
  }
  return <section className="section site-width" id="orientador"><div className="section-heading"><div><div className="eyebrow">ORIENTACIÓN EDUCATIVA CON IA</div><h2>Descubre opciones para tu bienestar</h2><p className="section-description">Explora productos por tus preferencias y lecturas relacionadas, sin diagnósticos ni recomendaciones médicas.</p></div><Leaf className="text-brand-teal" size={30} /></div><div className="wellness-layout"><form onSubmit={submit} className="space-y-5"><div className="space-y-2"><Label htmlFor="wellness-goals">Tus objetivos de bienestar</Label><Textarea id="wellness-goals" placeholder="Quiero aprender sobre suplementos y mejorar mis hábitos cotidianos…" required minLength={10} maxLength={1200} value={goals} onChange={e => setGoals(e.target.value)} disabled={pending} /></div><div className="space-y-2"><Label htmlFor="wellness-preferences">Tus preferencias (opcional)</Label><Textarea id="wellness-preferences" placeholder="Prefiero una bebida o sobres fáciles de llevar…" maxLength={600} value={preferences} onChange={e => setPreferences(e.target.value)} disabled={pending} /></div><p className="section-description">No incluyas datos personales ni tu historia clínica. El texto se envía a un servicio de IA para esta consulta; no se guarda en la app.</p><Button type="submit" disabled={pending || goals.trim().length < 10}>{pending ? <LoaderCircle className="animate-spin" /> : <Leaf />}{pending ? 'Buscando opciones…' : 'Obtener sugerencias'}</Button></form><div className="wellness-results" aria-live="polite" aria-busy={pending}>{pending ? <p className="section-description">Revisando el catálogo y las guías educativas…</p> : error ? <p role="alert" className="text-sm text-destructive">{error}</p> : result ? <><h3 className="text-lg mb-3">Tus opciones para explorar</h3><p className="section-description mb-4">{result.medicalConcern ? 'Por seguridad, no sugerimos suplementos para situaciones médicas. Consulta a un profesional de salud; esta guía ofrece criterios generales de lectura.' : 'Selección por temas de interés y preferencias de presentación, no por eficacia médica. Consulta la etiqueta de tu país antes de comprar.'}</p>{result.products.map(id => { const product = wellnessProducts.find(p => p.id === id); return product ? <article className="wellness-item" key={id}><h3 className="font-semibold text-sm">{product.name}</h3><p className="section-description mt-2">{product.detail}</p><Button variant="link" size="sm" asChild className="px-0"><a href={shopUrl} target="_blank" rel="noopener noreferrer">Consultar en 4Life <ArrowUpRight /></a></Button></article> : null; })}{!result.medicalConcern && result.products.length === 0 && <p className="section-description">No encontramos un producto pertinente; puedes comenzar con las guías.</p>}{result.guides.map(id => { const guide = guides.find(g => g.id === id); return guide ? <Button variant="outline" asChild className="wellness-guide" key={id}><Link to="/ebooks/$guideId" params={{ guideId: id }}><BookOpen />{guide.title}</Link></Button> : null; })}</> : <div className="space-y-3"><ShieldCheck className="text-brand-teal" size={28} /><h3 className="text-lg">Información, no diagnóstico</h3><p className="section-description">Los suplementos no diagnostican, tratan, curan ni previenen enfermedades. La IA no sustituye el consejo médico ni indica dosis o tratamientos.</p></div>}</div></div></section>;
}