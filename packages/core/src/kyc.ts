/**
 * KYC abstraction layer.
 * Testnet: all actions auto-verified.
 * Mainnet: plug Sumsub/Persona for restricted actions.
 */

export type KYCAction = "browse" | "buy" | "transfer" | "withdrawal";

export interface VerificationResult {
  verified: boolean;
  level: "auto" | "kyc1" | "kyc2" | "blocked";
  message?: string;
}

export interface KYCAdapter {
  verify(wallet: string): Promise<VerificationResult>;
  isEligible(wallet: string, action: KYCAction): Promise<boolean>;
}

/**
 * Testnet KYC — all actions allowed, auto_verified immediately.
 * KYC never blocks UI navigation or browsing.
 */
export class TestnetKYC implements KYCAdapter {
  async verify(_wallet: string): Promise<VerificationResult> {
    return Promise.resolve({ verified: true, level: "auto" });
  }

  async isEligible(_wallet: string, _action: KYCAction): Promise<boolean> {
    return Promise.resolve(true);
  }
}
