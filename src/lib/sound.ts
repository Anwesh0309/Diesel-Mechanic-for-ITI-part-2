/**
 * Workshop & Simulation Web Audio Sound Engine
 * Synthesizes tactile mechanical clicks, automotive relay snaps, diagnostic tones, and simulation feedback.
 * No external audio files required — zero latency, fully offline.
 */

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let soundEnabled = true;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    audioCtx = new AudioContextClass();
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.35, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => { /* user gesture required */ });
  }
  return audioCtx;
}

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

/** Synthesize a short burst of band-pass filtered white noise for tactile microswitch click texture */
function createNoiseBuffer(ctx: AudioContext, duration = 0.015): AudioBuffer {
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
  }
  return buffer;
}

/** Crisp mechanical switch / tact button click */
function playMechanicalClick(ctx: AudioContext, gainNode: GainNode, pitch = 1200, volume = 0.45) {
  const t = ctx.currentTime;
  
  // High-frequency tactile noise transient
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = createNoiseBuffer(ctx, 0.012);
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.setValueAtTime(2800, t);
  noiseFilter.Q.setValueAtTime(2.5, t);
  
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(volume * 0.6, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.012);
  
  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(gainNode);
  noiseSource.start(t);

  // Pitch-drop body oscillator
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(pitch, t);
  osc.frequency.exponentialRampToValueAtTime(160, t + 0.018);

  oscGain.gain.setValueAtTime(volume * 0.8, t);
  oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.018);

  osc.connect(oscGain);
  oscGain.connect(gainNode);
  osc.start(t);
  osc.stop(t + 0.02);
}

/** Automotive 12V relay click (double snap: solenoid armature + contact strike) */
function playRelayClick(ctx: AudioContext, gainNode: GainNode, volume = 0.5) {
  const t = ctx.currentTime;

  // First click (armature pull)
  playMechanicalClick(ctx, gainNode, 850, volume * 0.6);

  // Second click 24ms later (metallic contact strike)
  window.setTimeout(() => {
    if (!audioCtx || !soundEnabled) return;
    const t2 = audioCtx.currentTime;
    
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1900, t2);
    osc.frequency.exponentialRampToValueAtTime(320, t2 + 0.025);

    g.gain.setValueAtTime(volume * 0.7, t2);
    g.gain.exponentialRampToValueAtTime(0.001, t2 + 0.025);

    osc.connect(g);
    g.connect(gainNode);
    osc.start(t2);
    osc.stop(t2 + 0.03);
  }, 24);
}

/** Subtle tactile interface tick */
function playSoftTick(ctx: AudioContext, gainNode: GainNode, volume = 0.25) {
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(950, t);
  osc.frequency.exponentialRampToValueAtTime(300, t + 0.012);

  g.gain.setValueAtTime(volume, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.012);

  osc.connect(g);
  g.connect(gainNode);
  osc.start(t);
  osc.stop(t + 0.015);
}

let lastSlideTime = 0;

export const sound = {
  /**
   * Play click sound for user interactions
   */
  click(type: 'click' | 'tick' | 'relay' | 'tap' = 'click') {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx || !masterGain) return;
    try {
      if (type === 'relay') {
        playRelayClick(ctx, masterGain);
      } else if (type === 'tick') {
        playSoftTick(ctx, masterGain, 0.2);
      } else if (type === 'tap') {
        playSoftTick(ctx, masterGain, 0.28);
      } else {
        playMechanicalClick(ctx, masterGain, 1250, 0.45);
      }
    } catch { /* ignore audio errors */ }
  },

  /**
   * Rotary / slider notch detent tick (throttled for smooth tactile feel)
   */
  slideTick() {
    if (!soundEnabled) return;
    const now = performance.now();
    if (now - lastSlideTime < 32) return;
    lastSlideTime = now;
    const ctx = getAudioContext();
    const gain = masterGain;
    if (!ctx || !gain) return;
    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2400, t);
      osc.frequency.exponentialRampToValueAtTime(400, t + 0.008);
      g.gain.setValueAtTime(0.18, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.008);
      osc.connect(g);
      g.connect(gain);
      osc.start(t);
      osc.stop(t + 0.01);
    } catch { /* ignore */ }
  },

  /**
   * Automotive relay snap (switches, toggles, resets)
   */
  relay() {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    const gain = masterGain;
    if (!ctx || !gain) return;
    try {
      playRelayClick(ctx, gain, 0.55);
    } catch { /* ignore */ }
  },

  /**
   * Multimeter / Diagnostic continuity test beep
   */
  beep() {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    const gain = masterGain;
    if (!ctx || !gain) return;
    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2200, t);
      g.gain.setValueAtTime(0.3, t);
      g.gain.setValueAtTime(0.3, t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      osc.connect(g);
      g.connect(gain);
      osc.start(t);
      osc.stop(t + 0.055);
    } catch { /* ignore */ }
  },

  /**
   * Simulation success chime (two warm ascending harmonic tones)
   */
  success() {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    const gain = masterGain;
    if (!ctx || !gain) return;
    try {
      const t = ctx.currentTime;
      const notes = [659.25, 987.77]; // E5, B5
      notes.forEach((freq, idx) => {
        const start = t + idx * 0.07;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        g.gain.setValueAtTime(0.001, start);
        g.gain.linearRampToValueAtTime(0.35, start + 0.015);
        g.gain.exponentialRampToValueAtTime(0.001, start + 0.18);

        osc.connect(g);
        g.connect(gain);
        osc.start(start);
        osc.stop(start + 0.2);
      });
    } catch { /* ignore */ }
  },

  /**
   * Diagnostic warning / simulation mistake buzzer (two rapid low diagnostic alert pulses)
   */
  error() {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    const gain = masterGain;
    if (!ctx || !gain) return;
    try {
      const t = ctx.currentTime;
      [0, 0.1].forEach((delay) => {
        const start = t + delay;
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const g = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(165, start);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(750, start);

        g.gain.setValueAtTime(0.28, start);
        g.gain.exponentialRampToValueAtTime(0.001, start + 0.07);

        osc.connect(filter);
        filter.connect(g);
        g.connect(gain);

        osc.start(start);
        osc.stop(start + 0.08);
      });
    } catch { /* ignore */ }
  },

  /**
   * Simulation hint ping (delicate 880Hz chime)
   */
  hint() {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    const gain = masterGain;
    if (!ctx || !gain) return;
    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(1174.66, t + 0.15); // D6

      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.3, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(g);
      g.connect(gain);
      osc.start(t);
      osc.stop(t + 0.25);
    } catch { /* ignore */ }
  },

  /**
   * Complete fanfare (triumphant 4-note chord arpeggio)
   */
  finish() {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    const gain = masterGain;
    if (!ctx || !gain) return;
    try {
      const t = ctx.currentTime;
      const arpeggio = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      arpeggio.forEach((freq, i) => {
        const start = t + i * 0.08;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = i === 3 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, start);

        const duration = i === 3 ? 0.45 : 0.2;
        g.gain.setValueAtTime(0.001, start);
        g.gain.linearRampToValueAtTime(0.35, start + 0.015);
        g.gain.exponentialRampToValueAtTime(0.001, start + duration);

        osc.connect(g);
        g.connect(gain);
        osc.start(start);
        osc.stop(start + duration + 0.02);
      });
    } catch { /* ignore */ }
  },
};

/**
 * Initializes global click listener so EVERY click anywhere in the app plays a sound!
 */
export function initGlobalClickSound() {
  if (typeof window === 'undefined') return;

  let lastClickTime = 0;

  window.addEventListener(
    'pointerdown',
    (e) => {
      // Warm up audio context on first user gesture
      getAudioContext();

      if (!soundEnabled) return;

      const now = performance.now();
      // Debounce slightly to prevent double-firing on touch devices
      if (now - lastClickTime < 28) return;
      lastClickTime = now;

      const target = e.target as HTMLElement | null;
      if (!target) {
        sound.click('tap');
        return;
      }

      // If clicking directly on or inside a range slider, let slideTick handle movement
      if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'range') {
        sound.slideTick();
        return;
      }

      // Check if interactive element
      const interactive = target.closest('button, a, input, select, textarea, [role="button"], [role="radio"], [role="tab"], [role="switch"], [data-ans], [data-opt], [data-task], [data-stage], .btn, [data-cell]');
      if (interactive) {
        const isToggle = interactive.getAttribute('role') === 'switch' ||
          interactive.getAttribute('aria-pressed') !== null ||
          interactive.hasAttribute('data-testid') && interactive.getAttribute('data-testid')?.includes('toggle');
        
        if (isToggle) {
          sound.click('relay');
        } else {
          sound.click('click');
        }
      } else {
        // Any other click on the page gets a crisp subtle tap
        sound.click('tap');
      }
    },
    { capture: true, passive: true }
  );

  // Also hook range sliders for continuous tactile clicks as user drags
  window.addEventListener(
    'input',
    (e) => {
      const target = e.target as HTMLElement | null;
      if (target && target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'range') {
        sound.slideTick();
      }
    },
    { capture: true, passive: true }
  );
}
