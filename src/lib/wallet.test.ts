import { describe, expect, it } from 'vitest';
import { receivingWallet, walletExplorerUrl } from './wallet';

describe('Receiving wallet', () => {
  it('uses the exact receiving address supplied by Antonio', () => {
    expect(receivingWallet.address).toBe('0xa428c584a8efae30db81edba723b1288a2d6e413');
  });
  it('uses Base rather than Ethereum mainnet', () => {
    expect(receivingWallet.network).toBe('Base');
    expect(receivingWallet.chainId).toBe(8453);
    expect(walletExplorerUrl).toBe('https://basescan.org/address/0xa428c584a8efae30db81edba723b1288a2d6e413');
  });
});