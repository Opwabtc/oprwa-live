import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createElement } from "react";

export interface WalletState {
  address: string | null;
  connected: boolean;
  verified: boolean;
  network: "testnet" | "mainnet";
  walletType: string | null;
}

export interface WalletContextValue extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

/**
 * Detect and connect to the first available Bitcoin wallet.
 * Priority order: OPWallet > UniSat > OKX > Xverse
 */
async function detectAndConnect(): Promise<{ address: string; type: string }> {
  // OPWallet — primary wallet, full OPNet support
  if (typeof window !== "undefined" && window.opnet) {
    const accounts = await window.opnet.requestAccounts();
    const address = accounts[0];
    if (!address) throw new Error("OPWallet returned no accounts.");
    return { address, type: "opwallet" };
  }

  // UniSat — widely used Bitcoin wallet
  if (typeof window !== "undefined" && window.unisat) {
    const accounts = await window.unisat.requestAccounts();
    const address = accounts[0];
    if (!address) throw new Error("UniSat returned no accounts.");
    return { address, type: "unisat" };
  }

  // OKX Wallet
  if (typeof window !== "undefined" && window.okxwallet?.bitcoin) {
    const accounts = await window.okxwallet.bitcoin.requestAccounts();
    const address = accounts[0];
    if (!address) throw new Error("OKX Wallet returned no accounts.");
    return { address, type: "okx" };
  }

  throw new Error(
    "No compatible wallet found. Please install OPWallet or UniSat to continue."
  );
}

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps): JSX.Element {
  const [state, setState] = useState<WalletState>({
    address: null,
    connected: false,
    verified: false,
    network: "testnet",
    walletType: null,
  });

  const connect = useCallback(async (): Promise<void> => {
    const result = await detectAndConnect();
    setState({
      address: result.address,
      connected: true,
      verified: true, // Testnet: auto-verified
      network: "testnet",
      walletType: result.type,
    });
  }, []);

  const disconnect = useCallback((): void => {
    setState({
      address: null,
      connected: false,
      verified: false,
      network: "testnet",
      walletType: null,
    });
  }, []);

  const value: WalletContextValue = {
    ...state,
    connect,
    disconnect,
  };

  return createElement(WalletContext.Provider, { value }, children);
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (ctx === null) {
    throw new Error("useWallet must be used inside WalletProvider");
  }
  return ctx;
}
