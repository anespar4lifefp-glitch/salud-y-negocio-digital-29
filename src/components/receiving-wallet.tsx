import { useState } from 'react';
import { Copy, Check, ExternalLink, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { receivingWallet, walletExplorerUrl } from '@/lib/wallet';
import { QRCodeSVG } from 'qrcode.react';

export function ReceivingWallet() {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  async function copyAddress() {
    try { await navigator.clipboard.writeText(receivingWallet.address); setCopyState('copied'); }
    catch { setCopyState('error'); }
  }
  return <div className="receiving-wallet mt-4 max-w-sm" aria-label="Dirección Rabby en Base"><p className="flex items-center gap-2 text-xs font-semibold"><Wallet size={15} /> {receivingWallet.walletName} · Red {receivingWallet.network}</p><figure className="wallet-qr"><QRCodeSVG value={receivingWallet.address} size={176} level="M" marginSize={4} title="Dirección pública Rabby en Base" /><figcaption>Rabby · Solo red Base</figcaption></figure><div className="mt-2 flex items-start gap-2"><code className="min-w-0 break-all text-xs leading-relaxed text-muted-foreground">{receivingWallet.address}</code><Button className="shrink-0" variant="outline" size="icon" aria-label="Copiar dirección de Rabby" title="Copiar dirección de Rabby" onClick={copyAddress}>{copyState === 'copied' ? <Check /> : <Copy />}</Button><Button className="shrink-0" variant="ghost" size="icon" asChild title="Ver dirección en BaseScan"><a href={walletExplorerUrl} target="_blank" rel="noopener noreferrer" aria-label="Ver dirección en BaseScan"><ExternalLink /></a></Button></div><p className="mt-2 text-xs text-muted-foreground" role="status">{copyState === 'copied' ? 'Dirección copiada.' : copyState === 'error' ? 'No se pudo copiar. Selecciona la dirección y cópiala manualmente.' : 'Confirma con Antonio el importe y el activo antes de enviar.'}</p><p className="section-description mt-2">Solo red Base; no Ethereum mainnet ni Bitcoin nativo. No se verifican pagos automáticamente.</p></div>;
}