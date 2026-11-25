/**
 * SoundManager.js
 * Synthesizes procedural audio for Warehouse Rescue Rush using Web Audio API.
 * Handles engine hum, pickup, delivery, worker rescue, charging, alarms, clicks & victory sounds.
 */

class SoundManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.5;
    this.engineOsc = null;
    this.engineGain = null;
    this.engineRunning = false;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.enabled = !muted;
    if (!this.enabled && this.engineGain) {
      this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  // --- Hover Engine Sound ---
  startEngine() {
    if (!this.enabled || this.engineRunning) return;
    this.init();
    if (!this.ctx) return;

    try {
      this.engineOsc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();

      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(65, this.ctx.currentTime); // Low hum

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(130, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, this.ctx.currentTime);

      this.engineGain.gain.setValueAtTime(0.04 * this.volume, this.ctx.currentTime);

      this.engineOsc.connect(filter);
      osc2.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc.start();
      osc2.start();
      this.engineOsc2 = osc2;
      this.engineRunning = true;
    } catch (e) {
      console.warn('Engine sound error:', e);
    }
  }

  updateEnginePitch(speedRatio) {
    if (!this.engineRunning || !this.engineOsc || !this.ctx) return;
    const baseFreq = 65 + speedRatio * 35;
    this.engineOsc.frequency.setTargetAtTime(baseFreq, this.ctx.currentTime, 0.1);
    if (this.engineOsc2) {
      this.engineOsc2.frequency.setTargetAtTime(baseFreq * 2, this.ctx.currentTime, 0.1);
    }
  }

  stopEngine() {
    if (!this.engineRunning) return;
    try {
      if (this.engineOsc) this.engineOsc.stop();
      if (this.engineOsc2) this.engineOsc2.stop();
      this.engineRunning = false;
    } catch (e) {}
  }

  // --- Gameplay Sound Effects ---
  playPickup() {
    if (!this.enabled) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);

    gain.gain.setValueAtTime(0.2 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  playDelivery() {
    if (!this.enabled) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.18 * this.volume, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.3);
    });
  }

  playRescue() {
    if (!this.enabled) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [587.33, 739.99, 880]; // D5, F#5, A5
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.2 * this.volume, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.25);
    });
  }

  playCharge() {
    if (!this.enabled) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.4);

    gain.gain.setValueAtTime(0.15 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  playHazard() {
    if (!this.enabled) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.setValueAtTime(100, now + 0.1);

    gain.gain.setValueAtTime(0.15 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  playClick() {
    if (!this.enabled) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.1 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  playVictory() {
    if (!this.enabled) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const arpeggio = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    arpeggio.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.2 * this.volume, now + idx * 0.1 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.5);
    });
  }

  playFail() {
    if (!this.enabled) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.5);

    gain.gain.setValueAtTime(0.2 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }
}

export const soundManager = new SoundManager();
