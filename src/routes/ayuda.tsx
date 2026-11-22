import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { helpArticles } from '@/lib/support';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/ayuda')({
  head: () => ({ meta: [{ title: 'Ayuda y atención al cliente | saludynegociodigital' }, { name: 'description', content: 'Información sobre compras oficiales 4Life, guías educativas, servicios digitales y contacto con Antonio.' }, { property: 'og:title', content: 'Ayuda al cliente | saludynegociodigital' }, { property: 'og:description', content: 'Respuestas documentadas sobre compras, pagos, guías educativas y contacto.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: HelpPage,
});
function HelpPage() {
  return <><SiteHeader /><main className="site-width article-shell"><Button variant="ghost" asChild><Link to="/"><ArrowLeft /> Volver</Link></Button><h1>Ayuda al cliente</h1>{helpArticles.map(article => <section id={article.id} key={article.id}><h2>{article.title}</h2><p>{article.text}</p><Button variant="link" asChild><a href={article.href}>Consultar <ArrowUpRight /></a></Button></section>)}</main></>;
}