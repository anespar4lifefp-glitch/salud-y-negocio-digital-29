import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Menu, X, ArrowUpRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/business-logo.png.asset.json';

export const shopUrl = 'https://www.4life.com/12965034/shop';
export const whatsappUrl = 'https://wa.me/584124486046';
export function Brand() {
  return <Link to="/" className="brand"><img src={logo.url} alt="Logo de saludynegociodigital" /><div><div className="brand-name"><span>salud</span>ynegociodigital</div><small>BIENESTAR · EDUCACIÓN · INTELIGENCIA ARTIFICIAL</small></div></Link>;
}
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const nav = <><a className="nav-link active" href="/#productos">Productos 4Life</a><a className="nav-link" href="/#orientador">Orientador IA</a><a className="nav-link" href="/#ebooks">Ebooks</a><a className="nav-link" href="/#agencia">Agencia IA</a><a className="nav-link" href="/#contacto">Contacto</a></>;
  return <><div className="announcement">Bienestar para tu vida. Inteligencia artificial para tu negocio. <span aria-hidden="true">↗</span></div><header className="main-header"><div className="site-width header-inner"><Brand /><nav className="desktop-nav" aria-label="Navegación principal">{nav}</nav><div className="header-actions"><Button variant="ghost" size="icon" asChild title="Abrir tienda oficial 4Life"><a href={shopUrl} target="_blank" rel="noopener noreferrer" aria-label="Abrir tienda oficial 4Life"><ArrowUpRight /></a></Button><Button className="contact-header" size="sm" asChild><a href={whatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle /> Hablemos</a></Button><Button className="mobile-menu-button" variant="ghost" size="icon" onClick={() => setOpen(!open)} aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open}>{open ? <X /> : <Menu />}</Button></div></div>{open && <nav className="mobile-nav" aria-label="Navegación móvil" onClick={() => setOpen(false)}>{nav}</nav>}</header></>;
}