// Singleton Web Audio Context Manager
let audioCtx = null;
let masterGain = null;
let isMuted = false;

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
  return ctx;
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
  return isMuted;
}

export function isAudioMuted() {
  return isMuted;
}
