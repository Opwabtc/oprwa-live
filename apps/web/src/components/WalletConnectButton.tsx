import React, { useState, useEffect, useRef } from 'react';
import { useWalletStore } from '@/store/walletStore';

interface WalletOption {
  id: string;
  name: string;
  description: string;
  initial: string;
  installUrl: string;
  check: () => boolean;
}

const WALLETS: WalletOption[] = [
  {
    id: 'opwallet',
    name: 'OPWallet',
    description: 'Native OPNet Bitcoin wallet',
    initial: 'O',
    installUrl: 'https://opwallet.io',
    check: () => typeof window !== 'undefined' && Boolean(window.opnet),
  },
  {
    id: 'unisat',
    name: 'UniSat',
    description: 'Bitcoin and BRC-20 wallet',
    initial: 'U',
    installUrl: 'https://unisat.io',
    check: () => typeof window !== 'undefined' && Boolean(window.unisat),
  },
  {
    id: 'okx',
    name: 'OKX Wallet',
    description: 'Multi-chain crypto wallet',
    initial: 'K',
    installUrl: 'https://www.okx.com/web3',
    check: () =>
      typeof window !== 'undefined' && Boolean(window.okxwallet?.bitcoin),
  },
];

async function connectWallet(
  walletId: string
): Promise<{ address: string; type: string }> {
  if (walletId === 'opwallet') {
    if (!window.opnet) throw new Error('OPWallet not detected. Please install it.');
    const accounts = await window.opnet.requestAccounts();
    const address = accounts[0];
    if (!address) throw new Error('OPWallet returned no accounts.');
    return { address, type: 'opwallet' };
  }
  if (walletId === 'unisat') {
    if (!window.unisat) throw new Error('UniSat not detected. Please install it.');
    const accounts = await window.unisat.requestAccounts();
    const address = accounts[0];
    if (!address) throw new Error('UniSat returned no accounts.');
    return { address, type: 'unisat' };
  }
  if (walletId === 'okx') {
    if (!window.okxwallet?.bitcoin)
      throw new Error('OKX Wallet not detected. Please install it.');
    const accounts = await window.okxwallet.bitcoin.requestAccounts();
    const address = accounts[0];
    if (!address) throw new Error('OKX Wallet returned no accounts.');
    return { address, type: 'okx' };
  }
  throw new Error(`Unknown wallet: ${walletId}`);
}

function friendlyError(err: unknown): string {
  if (err instanceof Error) {
    if (err.message.includes('rejected') || err.message.includes('denied'))
      return 'Rejected. Please approve in your wallet.';
    return err.message;
  }
  return 'Failed to connect. Please try again.';
}

function truncateAddress(addr: string): string {
  if (addr.length <= 16) return addr;
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}

export function WalletConnectButton(): React.JSX.Element {
  const { address, connected, network, connect, disconnect } = useWalletStore();
  const [open, setOpen] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent): void => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setErrorMsg('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') { setOpen(false); setErrorMsg(''); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const handleConnect = (walletId: string): void => {
    if (connecting) return;
    setConnecting(walletId);
    setErrorMsg('');
    connectWallet(walletId)
      .then(({ address: addr, type }) =>
        connect(addr, type).then(() => {
          setConnecting(null);
          setOpen(false);
        })
      )
      .catch((err: unknown) => {
        setConnecting(null);
        setErrorMsg(friendlyError(err));
      });
  };

  if (connected && address) {
    return (
      <div ref={wrapRef} className="wallet-btn-wrap">
        <button
          className="wallet-btn wallet-btn--connected"
          onClick={() => setOpen((v) => !v)}
          aria-label="Wallet menu"
          aria-expanded={open}
        >
          <span className="wallet-btn__dot" aria-hidden="true" />
          <span className="wallet-btn__address">{truncateAddress(address)}</span>
          <span className="wallet-btn__network">{network}</span>
        </button>
        {open && (
          <div className="wallet-dropdown" role="menu">
            <div className="wallet-dropdown__title">Connected</div>
            <button
              className="wallet-dropdown__option"
              onClick={() => { disconnect(); setOpen(false); }}
              role="menuitem"
            >
              <div className="wallet-dropdown__icon" style={{ background: 'var(--danger-dim)', borderColor: 'var(--danger-border)', color: 'var(--danger)' }}>✕</div>
              <div className="wallet-dropdown__info">
                <span className="wallet-dropdown__name">Disconnect</span>
                <span className="wallet-dropdown__desc">End this session</span>
              </div>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="wallet-btn-wrap">
      <button
        className="wallet-btn wallet-btn--connect"
        onClick={() => { setOpen((v) => !v); setErrorMsg(''); }}
        aria-label="Connect Bitcoin wallet"
        aria-expanded={open}
        aria-haspopup="true"
      >
        Connect Wallet
      </button>

      {open && (
        <div className="wallet-dropdown" role="dialog" aria-label="Choose wallet">
          <div className="wallet-dropdown__title">Choose wallet</div>

          {errorMsg && (
            <div className="wallet-dropdown__error" role="alert">
              {errorMsg}
            </div>
          )}

          {WALLETS.map((wallet) => {
            const detected = wallet.check();
            const isConnecting = connecting === wallet.id;
            return (
              <button
                key={wallet.id}
                className={`wallet-dropdown__option${!detected ? ' wallet-dropdown__option--unavailable' : ''}`}
                onClick={() => { if (detected) handleConnect(wallet.id); }}
                disabled={!detected || Boolean(connecting)}
                aria-label={detected ? `Connect ${wallet.name}` : `${wallet.name} — not installed`}
              >
                <div className="wallet-dropdown__icon">{wallet.initial}</div>
                <div className="wallet-dropdown__info">
                  <span className="wallet-dropdown__name">{wallet.name}</span>
                  <span className="wallet-dropdown__desc">
                    {isConnecting ? `Connecting…` : detected ? wallet.description : (
                      <>Not installed — <a href={wallet.installUrl} target="_blank" rel="noopener noreferrer" className="wallet-dropdown__install-link" onClick={(e) => e.stopPropagation()}>Install</a></>
                    )}
                  </span>
                </div>
                <span className="wallet-dropdown__arrow" aria-hidden="true">
                  {isConnecting
                    ? <span className="wallet-dropdown__connecting" />
                    : detected ? '›' : ''}
                </span>
              </button>
            );
          })}

          <p className="wallet-dropdown__note">Testnet only · No real funds required</p>
        </div>
      )}
    </div>
  );
}
