// Singleton Web Audio Context Manager
let audioCtx = null;
let masterGain = null;
let isMuted = false;
let ambientOscillators = [];

export function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.85, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);
    }
  }
  return audioCtx;
}

export function getMasterGain() {
  getAudioContext();
  return masterGain;
}

export async function unlockAudio() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    await ctx.resume();
  }
  startAmbientDrone();
  return ctx;
}

function startAmbientDrone() {
  if (ambientOscillators.length > 0) return; // Already playing
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;

  const baseFreq = 136.1; // Om frequency (C#)
  const frequencies = [baseFreq, baseFreq * 1.5, baseFreq * 2];
  
  frequencies.forEach(freq => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    // Very subtle volume
    gain.gain.value = 0.05 / frequencies.length;
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.start();
    ambientOscillators.push({ osc, gain });
  });
}

export function playClickSound() {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
  
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
  
  osc.connect(gain);
  gain.connect(masterGain);
  
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.1);
}

export function getAuthoritativeTime() {
  const ctx = getAudioContext();
  return ctx ? ctx.currentTime : performance.now() / 1000;
}

export function toggleMute() {
  isMuted = !isMuted;
  if (masterGain && audioCtx) {
    masterGain.gain.setTargetAtTime(isMuted ? 0 : 0.85, audioCtx.currentTime, 0.05);
  }
  
  if (!isMuted && ambientOscillators.length === 0) {
    startAmbientDrone();
  }
  
  return isMuted;
}

export function isAudioMuted() {
  return isMuted;
}
