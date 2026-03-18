/**
 * Type declarations for injected Bitcoin wallet providers.
 * OPWallet, UniSat, Xverse, OKX — each injects a provider into window.
 */

interface OPNetWalletProvider {
  requestAccounts(): Promise<string[]>;
  getAccounts(): Promise<string[]>;
  getNetwork(): Promise<string>;
  signPsbt(psbtHex: string, options?: { autoFinalized?: boolean }): Promise<string>;
  pushPsbt(psbtHex: string): Promise<string>;
  on(event: string, handler: (...args: unknown[]) => void): void;
  removeListener(event: string, handler: (...args: unknown[]) => void): void;
}

interface UnisatProvider {
  requestAccounts(): Promise<string[]>;
  getAccounts(): Promise<string[]>;
  getNetwork(): Promise<string>;
  signPsbt(psbtHex: string, options?: { autoFinalized?: boolean }): Promise<string>;
  pushPsbt(psbtHex: string): Promise<string>;
  on(event: string, handler: (...args: unknown[]) => void): void;
  removeListener(event: string, handler: (...args: unknown[]) => void): void;
}

interface XverseBitcoinProvider {
  request(method: string, options: unknown): Promise<unknown>;
}

interface XverseProviders {
  BitcoinProvider?: XverseBitcoinProvider;
}

interface OKXWalletBitcoin {
  requestAccounts(): Promise<string[]>;
  getAccounts(): Promise<string[]>;
  signPsbt(psbtHex: string, options?: unknown): Promise<string>;
}

interface OKXWallet {
  bitcoin?: OKXWalletBitcoin;
}

declare global {
  interface Window {
    opnet?: OPNetWalletProvider;
    unisat?: UnisatProvider;
    XverseProviders?: XverseProviders;
    okxwallet?: OKXWallet;
  }
}

export {};
