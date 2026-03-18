import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createElement } from "react";
import { TestnetKYC } from "./kyc";

export interface WalletState {
  address: string | null;
  connected: boolean;
  verified: boolean;
  network: "testnet" | "mainnet";
}

export interface WalletContextValue extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

const kyc = new TestnetKYC();

/**
 * Generate a deterministic mock testnet address from a seed.
 * In production this is replaced by @btc-vision/walletconnect.
 */
function generateMockAddress(): string {
  const chars = "0123456789abcdef";
  let addr = "opt1sq";
  for (let i = 0; i < 38; i++) {
    addr += chars[Math.floor(Math.random() * chars.length)];
  }
  return addr;
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
  });

  const connect = useCallback(async (): Promise<void> => {
    const mockAddress = generateMockAddress();
    const result = await kyc.verify(mockAddress);
    setState({
      address: mockAddress,
      connected: true,
      verified: result.verified,
      network: "testnet",
    });
  }, []);

  const disconnect = useCallback((): void => {
    setState({
      address: null,
      connected: false,
      verified: false,
      network: "testnet",
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
