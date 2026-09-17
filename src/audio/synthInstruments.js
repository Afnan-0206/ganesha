import { getAudioContext, getMasterGain } from './audioContext';

// Procedural Indian Festival Audio Synthesizer
// Dhol, Tasha, Manjira, Tanpura Drone, and Ink Interaction SFX

let droneNodes = null;

// 1. Dhol Bass Beat (Dhum)
export function playDhol(time = 0, intensity = 1.0) {
  const ctx = getAudioContext();
  const master = getMasterGain();
  if (!ctx || !master) return;
  const playTime = time > 0 ? time : ctx.currentTime;

  // Sine pitch drop for drum head resonance
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(130, playTime);
  osc.frequency.exponentialRampToValueAtTime(45, playTime + 0.12);

  gain.gain.setValueAtTime(0.7 * intensity, playTime);
  gain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.35);

  osc.connect(gain);
  gain.connect(master);

  osc.start(playTime);
  osc.stop(playTime + 0.36);

  // Subtle membrane slap transient
  const noiseBuff = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.04), ctx.sampleRate);
  const data = noiseBuff.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.008));
  }
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuff;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, playTime);

  const slapGain = ctx.createGain();
  slapGain.gain.setValueAtTime(0.3 * intensity, playTime);
  slapGain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.04);

  noiseSource.connect(filter);
  filter.connect(slapGain);
  slapGain.connect(master);

  noiseSource.start(playTime);
  noiseSource.stop(playTime + 0.05);
}

// 2. Tasha Rimshot (Ta)
export function playTasha(time = 0, intensity = 0.8) {
  const ctx = getAudioContext();
  const master = getMasterGain();
  if (!ctx || !master) return;
  const playTime = time > 0 ? time : ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(320, playTime);
  osc.frequency.exponentialRampToValueAtTime(160, playTime + 0.07);

  gain.gain.setValueAtTime(0.4 * intensity, playTime);
  gain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.08);

  osc.connect(gain);
  gain.connect(master);
  osc.start(playTime);
  osc.stop(playTime + 0.09);
}

// 3. Manjira Bell Ring
export function playManjira(time = 0, pitchMultiplier = 1.0) {
  const ctx = getAudioContext();
  const master = getMasterGain();
  if (!ctx || !master) return;
  const playTime = time > 0 ? time : ctx.currentTime;

  const fundamental = 2400 * pitchMultiplier;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(fundamental, playTime);
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(fundamental * 1.414, playTime); // Inharmonic metallic chime

  gain.gain.setValueAtTime(0.25, playTime);
  gain.gain.exponentialRampToValueAtTime(0.0005, playTime + 0.6);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(master);

  osc1.start(playTime);
  osc2.start(playTime);
  osc1.stop(playTime + 0.65);
  osc2.stop(playTime + 0.65);
}

// 4. Tanpura Drone (Continuous warm meditative background)
export function startTanpuraDrone() {
  const ctx = getAudioContext();
  const master = getMasterGain();
  if (!ctx || !master || droneNodes) return;

  const baseFreq = 138.59; // C#3 root (Sa)
  const freqs = [baseFreq, baseFreq * 1.5, baseFreq * 2, baseFreq * 1.334]; // Sa, Pa, Sa', Ma
  const oscillators = [];
  const droneGain = ctx.createGain();
  droneGain.gain.setValueAtTime(0.001, ctx.currentTime);
  droneGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 3.0); // Gentle fade-in

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(650, ctx.currentTime);

  freqs.forEach((f, idx) => {
    const osc = ctx.createOscillator();
    osc.type = idx % 2 === 0 ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(f + (Math.random() * 0.4 - 0.2), ctx.currentTime);

    // Subtle gentle chorus LFO
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.15 + idx * 0.05, ctx.currentTime);
    lfoGain.gain.setValueAtTime(1.2, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();

    osc.connect(filter);
    osc.start();
    oscillators.push(osc, lfo);
  });

  filter.connect(droneGain);
  droneGain.connect(master);

  droneNodes = { oscillators, droneGain };
}

export function stopTanpuraDrone() {
  const ctx = getAudioContext();
  if (!droneNodes || !ctx) return;
  const { oscillators, droneGain } = droneNodes;
  droneGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 1.0);
  setTimeout(() => {
    oscillators.forEach(node => {
      try { node.stop(); } catch (_) {}
    });
    droneNodes = null;
  }, 1100);
}

// 5. Calligraphy Ink Stroke SFX (Perfect / Good Hit)
export function playInkStroke(isPerfect = true) {
  const ctx = getAudioContext();
  const master = getMasterGain();
  if (!ctx || !master) return;
  const now = ctx.currentTime;

  // Gentle quill friction sound
  const buff = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.08), ctx.sampleRate);
  const d = buff.getChannelData(0);
  for (let i = 0; i < d.length; i++) {
    d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  }
  const friction = ctx.createBufferSource();
  friction.buffer = buff;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.setValueAtTime(isPerfect ? 2200 : 1600, now);
  bandpass.Q.setValueAtTime(3.0, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  friction.connect(bandpass);
  bandpass.connect(gain);
  gain.connect(master);

  friction.start(now);
  friction.stop(now + 0.09);

  // Soft musical golden harmonic ping
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(isPerfect ? 880 : 660, now);
  oscGain.gain.setValueAtTime(isPerfect ? 0.22 : 0.12, now);
  oscGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.25);

  osc.connect(oscGain);
  oscGain.connect(master);
  osc.start(now);
  osc.stop(now + 0.26);
}

// 6. Ink Dispersion / Blot Sound (Miss Feedback)
export function playInkBlotSound() {
  const ctx = getAudioContext();
  const master = getMasterGain();
  if (!ctx || !master) return;
  const now = ctx.currentTime;

  // Low dull droplet impact
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(140, now);
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.14);

  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  osc.connect(gain);
  gain.connect(master);
  osc.start(now);
  osc.stop(now + 0.16);
}

// 7. Flow Restored Arpeggio
export function playFlowRestoredSound() {
  const ctx = getAudioContext();
  const master = getMasterGain();
  if (!ctx || !master) return;
  const now = ctx.currentTime;

  // Sa-Ga-Pa Indian ascending triad (C#5, F5, G#5)
  const notes = [554.37, 698.46, 830.61];
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const noteTime = now + idx * 0.09;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, noteTime);

    gain.gain.setValueAtTime(0.22, noteTime);
    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.45);

    osc.connect(gain);
    gain.connect(master);

    osc.start(noteTime);
    osc.stop(noteTime + 0.5);
  });
}

// 8. Mushak Bonus Inkpot Chime
export function playMushakChime() {
  const ctx = getAudioContext();
  const master = getMasterGain();
  if (!ctx || !master) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1108.73, now); // C#6
  osc.frequency.exponentialRampToValueAtTime(1661.22, now + 0.15); // G#6 sweep

  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  osc.connect(gain);
  gain.connect(master);
  osc.start(now);
  osc.stop(now + 0.36);
}

// 9. Manuscript Complete Celebratory Fanfare
export function playManuscriptCompleteFanfare() {
  const ctx = getAudioContext();
  const master = getMasterGain();
  if (!ctx || !master) return;
  const now = ctx.currentTime;

  // Grand celebratory festive chord progression
  const chords = [
    [277.18, 349.23, 415.30, 554.37], // Sa-Ga-Pa-Sa'
    [329.63, 415.30, 493.88, 659.25], // Komal Ni
    [277.18, 415.30, 554.37, 830.61]  // Final Grand Sa
  ];

  chords.forEach((chord, chordIdx) => {
    const chordTime = now + chordIdx * 0.45;
    chord.forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, chordTime);

      gain.gain.setValueAtTime(0.18, chordTime);
      gain.gain.exponentialRampToValueAtTime(0.001, chordTime + 1.2);

      osc.connect(gain);
      gain.connect(master);
      osc.start(chordTime);
      osc.stop(chordTime + 1.25);
    });
  });
}

// 10. Sacred Temple Bell / Aarti Ghanta
export function playTempleBell(time = 0, intensity = 0.85) {
  const ctx = getAudioContext();
  const master = getMasterGain();
  if (!ctx || !master) return;
  const playTime = time > 0 ? time : ctx.currentTime;

  // Bell harmonics: fundamental + tierce + quint + octave
  const freqs = [587.33, 880, 1174.66, 1760]; // D5, A5, D6, A6 bell resonance
  const weights = [0.35, 0.22, 0.15, 0.08];

  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, playTime);

    gain.gain.setValueAtTime(weights[idx] * intensity, playTime);
    gain.gain.exponentialRampToValueAtTime(0.0005, playTime + 1.4);

    osc.connect(gain);
    gain.connect(master);
    osc.start(playTime);
    osc.stop(playTime + 1.45);
  });
}

// 11. Sacred Shankha (Conch shell invocation)
export function playShankhaSound() {
  const ctx = getAudioContext();
  const master = getMasterGain();
  if (!ctx || !master) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc2.type = 'triangle';

  // Characteristic conch resonant pitch sweep
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.4);
  osc.frequency.exponentialRampToValueAtTime(440, now + 1.2);
  osc.frequency.linearRampToValueAtTime(435, now + 2.0);

  osc2.frequency.setValueAtTime(222, now);
  osc2.frequency.exponentialRampToValueAtTime(331, now + 0.4);
  osc2.frequency.exponentialRampToValueAtTime(442, now + 1.2);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(600, now);
  filter.frequency.exponentialRampToValueAtTime(1400, now + 0.5);
  filter.frequency.exponentialRampToValueAtTime(800, now + 2.0);

  gain.gain.setValueAtTime(0.01, now);
  gain.gain.linearRampToValueAtTime(0.28, now + 0.35);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

  osc.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(master);

  osc.start(now);
  osc2.start(now);
  osc.stop(now + 2.25);
  osc2.stop(now + 2.25);
}
