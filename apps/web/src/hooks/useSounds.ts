/**
 * useSounds — Web Audio API micro sound system.
 * All sounds are synthesized (no external files). Subtle and premium.
 * AudioContext is lazily created on first use (requires user gesture).
 */

let _ctx: AudioContext | null = null;

function ctx(): AudioContext {
  if (!_ctx) _ctx = new AudioContext();
  if (_ctx.state === 'suspended') void _ctx.resume();
  return _ctx;
}

type OscType = OscillatorType;

function tone(
  freq: number,
  duration: number,
  type: OscType = 'sine',
  gain = 0.06,
  startDelay = 0,
  pitchEnv?: { to: number; at: number },
): void {
  try {
    const c = ctx();
    const osc = c.createOscillator();
    const g = c.createGain();
    const t0 = c.currentTime + startDelay;

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (pitchEnv) osc.frequency.exponentialRampToValueAtTime(pitchEnv.to, t0 + pitchEnv.at);

    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    osc.connect(g);
    g.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.01);
  } catch {
    // AudioContext unavailable (SSR / blocked by browser policy)
  }
}

export const sounds = {
  /** Subtle UI click — buttons, toggles */
  click(): void {
    tone(1200, 0.06, 'sine', 0.028);
    tone(900, 0.05, 'sine', 0.015, 0.03);
  },

  /** Open buy modal / start interaction */
  open(): void {
    tone(480, 0.12, 'sine', 0.045);
    tone(600, 0.10, 'sine', 0.032, 0.08);
  },

  /** Wallet connect success */
  walletConnect(): void {
    tone(392, 0.14, 'sine', 0.055);             // G4
    tone(523.25, 0.16, 'sine', 0.048, 0.10);   // C5
    tone(659.25, 0.22, 'sine', 0.038, 0.20);   // E5
  },

  /** Transaction submitted / signing */
  submit(): void {
    tone(440, 0.10, 'sine', 0.05);
    tone(554.37, 0.12, 'sine', 0.038, 0.09);   // C#5
  },

  /** Transaction settled — premium ascending chime */
  success(): void {
    tone(523.25, 0.18, 'sine', 0.065);          // C5
    tone(659.25, 0.18, 'sine', 0.055, 0.12);   // E5
    tone(783.99, 0.24, 'sine', 0.048, 0.24);   // G5
    tone(1046.5, 0.30, 'sine', 0.035, 0.38);   // C6 — top note sparkle
  },

  /** Error / transaction failed */
  error(): void {
    tone(280, 0.16, 'sine', 0.05);
    tone(220, 0.22, 'sine', 0.042, 0.12, { to: 180, at: 0.22 });
  },

  /** Amount +/− adjust */
  adjust(): void {
    tone(700, 0.04, 'sine', 0.022);
  },
} as const;

export type SoundName = keyof typeof sounds;
