import { createFileRoute, notFound, Link } from '@tanstack/react-router';
import { Download, ArrowLeft, Printer, ExternalLink } from 'lucide-react';
import { guides, guideText } from '@/lib/education';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/ebooks/$guideId')({
  loader: ({ params }) => { const guide = guides.find(g => g.id === params.guideId); if (!guide) throw notFound(); return guide; },
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.title ?? 'Guía educativa'} | saludynegociodigital` }, { name: 'description', content: loaderData?.subtitle ?? 'Educación responsable sobre suplementos.' }, { property: 'og:title', content: `${loaderData?.title ?? 'Guía educativa'} | saludynegociodigital` }, { property: 'og:description', content: loaderData?.subtitle ?? 'Educación responsable sobre suplementos.' }, { property: 'og:type', content: 'article' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: GuidePage,
});
function GuidePage() {
  const guide = Route.useLoaderData();
  function download() { const url = URL.createObjectURL(new Blob([guideText(guide)], { type: 'text/plain;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = `${guide.id}-saludynegociodigital.txt`; a.click(); URL.revokeObjectURL(url); }
  return <><SiteHeader /><main className="site-width article-shell"><Button variant="ghost" asChild className="print-hide"><Link to="/" hash="ebooks"><ArrowLeft /> Volver a los ebooks</Link></Button><p className="eyebrow mt-8 text-brand-teal">BIBLIOTECA DE BIENESTAR · GUÍA GRATUITA</p><h1>{guide.title}</h1><p>{guide.subtitle}</p><div className="hero-buttons print-hide"><Button onClick={download}><Download /> Descargar guía TXT</Button><Button variant="outline" onClick={() => window.print()}><Printer /> Imprimir / guardar PDF</Button></div><div className="article-alert"><p>Material educativo independiente. No es una publicación oficial de 4Life ni sustituye asesoramiento médico. Los suplementos no están destinados a diagnosticar, tratar, curar ni prevenir enfermedades.</p></div>{guide.sections.map(section => <section key={section.title}><h2>{section.title}</h2><p>{section.text}</p></section>)}<section><h2>Fuente y consulta</h2><p>Comprueba la información y la etiqueta correspondiente a tu país antes de comprar.</p><Button variant="link" asChild><a href={guide.source} target="_blank" rel="noopener noreferrer">Consultar fuente <ExternalLink /></a></Button></section></main></>;
}