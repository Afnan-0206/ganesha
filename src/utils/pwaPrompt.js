// Universal PWA Install Prompt Handler
// Supports Chromium 1-tap install (beforeinstallprompt), standalone detection, and iOS Safari Add-to-Home-Screen guide

let deferredPrompt = null;
const listeners = new Set();

export function isStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
}

export function isIos() {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua);
}

export function isAndroid() {
  if (typeof window === 'undefined') return false;
  return /android/.test(window.navigator.userAgent.toLowerCase());
}

export function canPromptInstall() {
  return deferredPrompt !== null;
}

export function subscribePwaState(callback) {
  listeners.add(callback);
  // Initial state notification
  callback({
    canInstall: canPromptInstall(),
    isInstalled: isStandalone(),
    isIos: isIos(),
  });
  return () => {
    listeners.delete(callback);
  };
}

function notifyListeners() {
  const state = {
    canInstall: canPromptInstall(),
    isInstalled: isStandalone(),
    isIos: isIos(),
  };
  listeners.forEach(cb => {
    try {
      cb(state);
    } catch (e) {
      console.warn('PWA state callback error', e);
    }
  });
}

// Global window event listener initialization
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent default mini-infobar on mobile Chrome
    e.preventDefault();
    deferredPrompt = e;
    notifyListeners();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notifyListeners();
  });
}

export async function promptPwaInstall() {
  if (!deferredPrompt) {
    return { outcome: 'unavailable' };
  }

  try {
    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      deferredPrompt = null;
      notifyListeners();
    }
    return choiceResult;
  } catch (err) {
    console.warn('PWA prompt error:', err);
    return { outcome: 'error', error: err };
  }
}
