import { getAudioContext, getMasterGain } from './audioContext';
import { playDhol, playTasha, playManjira } from './synthInstruments';

// Procedural 20-Second Cinematic Score for "PANCH VIGHNA: Five Vighnas. One Festival."
// 100% synthesized in real time with Web Audio API - Zero external copyrighted audio.

let activeCinematicNodes = [];
let cinematicIntervalId = null;

export function startCinematicAudio(onTimeUpdate, onComplete) {
  const ctx = getAudioContext();
  const master = getMasterGain();
  if (!ctx || !master) return null;

  stopCinematicAudio();

  const startTime = ctx.currentTime + 0.05;
  activeCinematicNodes = [];

  // 1. Ambient Drone (0s to 20s) - Meditative Tanpura Sa (C#3) & Pa (G#3)
  const droneGain = ctx.createGain();
  droneGain.gain.setValueAtTime(0.001, startTime);
  droneGain.gain.linearRampToValueAtTime(0.18, startTime + 2.5);
  droneGain.gain.setValueAtTime(0.18, startTime + 17.0);
  droneGain.gain.linearRampToValueAtTime(0.0001, startTime + 20.0);

  const baseFreq = 138.59; // C#3
  [baseFreq, baseFreq * 1.5, baseFreq * 2.0].forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    osc.type = idx === 0 ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450 + idx * 80, startTime);

    osc.connect(filter);
    filter.connect(droneGain);
    osc.start(startTime);
    osc.stop(startTime + 20.2);
    activeCinematicNodes.push(osc);
  });
  droneGain.connect(master);

  // 2. Diya Flame Whispering Ambience (0s to 4s)
  const flameBuff = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 3.5), ctx.sampleRate);
  const fData = flameBuff.getChannelData(0);
  for (let i = 0; i < fData.length; i++) {
    fData[i] = (Math.random() * 2 - 1) * 0.02;
  }
  const flameSource = ctx.createBufferSource();
  flameSource.buffer = flameBuff;
  const flameFilter = ctx.createBiquadFilter();
  flameFilter.type = 'bandpass';
  flameFilter.frequency.setValueAtTime(800, startTime);
  const flameGain = ctx.createGain();
  flameGain.gain.setValueAtTime(0.001, startTime);
  flameGain.gain.linearRampToValueAtTime(0.08, startTime + 1.2);
  flameGain.gain.linearRampToValueAtTime(0.0001, startTime + 3.8);

  flameSource.connect(flameFilter);
  flameFilter.connect(flameGain);
  flameGain.connect(master);
  flameSource.start(startTime);
  flameSource.stop(startTime + 4.0);
  activeCinematicNodes.push(flameSource);

  // 3. Heartbeat Dhol Pulses (3.5s to 9.0s)
  const heartbeatTimes = [3.5, 4.7, 5.8, 6.7, 7.5, 8.2, 8.8];
  heartbeatTimes.forEach((t, idx) => {
    const playT = startTime + t;
    setTimeout(() => {
      playDhol(playT, 0.6 + idx * 0.06);
      if (idx >= 3) {
        playTasha(playT + 0.35, 0.4);
      }
      if (idx % 2 === 0) {
        playManjira(playT, 0.9);
      }
    }, t * 1000);
  });

  // 4. Sacred Flute Melody (Raag Bhoopali: Sa-Re-Ga-Pa-Dha in C#) for Ganesha's Presence (9.0s to 12.5s)
  const melodyNotes = [
    { time: 9.0, freq: 554.37, dur: 0.8 }, // Sa (C#5)
    { time: 9.7, freq: 622.25, dur: 0.6 }, // Re (D#5)
    { time: 10.3, freq: 698.46, dur: 1.0 }, // Ga (F5)
    { time: 11.2, freq: 830.61, dur: 0.9 }, // Pa (G#5)
    { time: 12.0, freq: 554.37, dur: 1.2 }  // Sa
  ];
  melodyNotes.forEach(m => {
    const noteT = startTime + m.time;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(m.freq, noteT);

    gain.gain.setValueAtTime(0.001, noteT);
    gain.gain.linearRampToValueAtTime(0.18, noteT + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, noteT + m.dur);

    osc.connect(gain);
    gain.connect(master);
    osc.start(noteT);
    osc.stop(noteT + m.dur + 0.1);
    activeCinematicNodes.push(osc);
  });

  // 5. Five Vighna Symbolic Chimes (12.2s, 12.7s, 13.2s, 13.7s, 14.2s)
  const vighnaPitches = [1.0, 1.15, 1.33, 1.5, 1.8];
  vighnaPitches.forEach((p, idx) => {
    const t = 12.2 + idx * 0.5;
    setTimeout(() => {
      playManjira(startTime + t, p);
      playTasha(startTime + t, 0.5);
    }, t * 1000);
  });

  // 6. Celebratory Percussion Crescendo & Grand Diya Burst (15.0s to 18.0s)
  for (let i = 0; i < 8; i++) {
    const t = 15.0 + i * 0.35;
    setTimeout(() => {
      playDhol(startTime + t, 1.0);
      playTasha(startTime + t + 0.17, 0.85);
      if (i % 2 === 0) playManjira(startTime + t, 1.0);
    }, t * 1000);
  }

  // 7. Grand Sacred Bronze Bell Chime for Title (18.0s)
  setTimeout(() => {
    playGrandBell(startTime + 18.0);
  }, 18000);

  // Time Tracker interval
  const introStartEpoch = Date.now();
  cinematicIntervalId = setInterval(() => {
    const elapsedSeconds = (Date.now() - introStartEpoch) / 1000;
    if (onTimeUpdate) onTimeUpdate(elapsedSeconds);

    if (elapsedSeconds >= 20.0) {
      stopCinematicAudio();
      if (onComplete) onComplete();
    }
  }, 33);

  return () => stopCinematicAudio();
}

export function stopCinematicAudio() {
  if (cinematicIntervalId) {
    clearInterval(cinematicIntervalId);
    cinematicIntervalId = null;
  }
  activeCinematicNodes.forEach(node => {
    try {
      node.stop();
      node.disconnect();
    } catch (_) {}
  });
  activeCinematicNodes = [];
}

// Grand Temple Bell Chime (C#4 + harmonic overtones)
function playGrandBell(time) {
  const ctx = getAudioContext();
  const master = getMasterGain();
  if (!ctx || !master) return;

  const bellFreqs = [277.18, 554.37, 830.61, 1108.73, 1661.22];
  bellFreqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq + idx * 2.5, time);

    const amp = 0.22 / (idx + 1);
    gain.gain.setValueAtTime(amp, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 3.5);

    osc.connect(gain);
    gain.connect(master);
    osc.start(time);
    osc.stop(time + 3.6);
    activeCinematicNodes.push(osc);
  });
}
