// Sacred and Playful Whispers from Cartoon Bal Ganesha
// Includes heartwarming messages, sweet cartoon greetings, and special mentions of NIAT!

export const SECRET_MESSAGES = [
  {
    id: 'whisper-niat-1',
    sanskritTitle: '॥ विद्या व बुद्धि वरदान • NIAT ॥',
    englishTitle: 'Bal Ganesha’s Blessing for NIAT Coders',
    mentionsNiat: true,
    text: "Hehehe! Namaste my brilliant NIAT friend! I see how passionately you learn and build great technologies at NIAT! Whenever bugs trouble your code or exams trouble your mind, don't worry! Take a deep breath, enjoy a sweet modak, and smile! Your Bal Ganesha is always coding happiness, victory, and big breakthroughs for you at NIAT!",
    theme: 'Innovation & Joy',
  },
  {
    id: 'whisper-niat-2',
    sanskritTitle: '॥ मंगल सिद्धि • NIAT INNOVATOR ॥',
    englishTitle: 'The Spark of NIAT Genius',
    mentionsNiat: true,
    text: "Aha! My dear NIAT superstar! Did you know? Just like I have the wisdom to solve any puzzle, you have the creative spark to innovate the future! Never doubt yourself. Work with an honest heart, support your friends, and watch how your Bal Ganesha clears every hurdle from your journey!",
    theme: 'Confidence & Triumph',
  },
  {
    id: 'whisper-3',
    sanskritTitle: '॥ अभय वरदान • FEARLESS HEART ॥',
    englishTitle: 'Bal Ganesha’s Warm Hug & Protection',
    mentionsNiat: false,
    text: "Hehehe! Hello my dearest friend! Your joyful Aarti made me so happy! Listen closely: whenever you feel nervous or worried, remember that your little Ganesha is sitting right in your heart, cheering for you! You are never alone. Keep smiling, be brave, and go shine!",
    theme: 'Courage & Friendship',
  },
  {
    id: 'whisper-4',
    sanskritTitle: '॥ आनंद प्रसादम • SWEET VICTORY ॥',
    englishTitle: 'A Shower of Laddus and Happiness',
    mentionsNiat: false,
    text: "Arre wah! What a wonderful friend you are! Listen to your Bal Ganesha: you are far stronger and smarter than you realize! Leave all your stress at my feet. Today, I am filling your life with sweet laddus of joy, peaceful thoughts, and unexpected victories! Go conquer the world!",
    theme: 'Happiness & Peace',
  },
  {
    id: 'whisper-niat-5',
    sanskritTitle: '॥ संकल्प विजय • NIAT CHAMPION ॥',
    englishTitle: 'Destined for Greatness at NIAT',
    mentionsNiat: true,
    text: "My dear NIAT champion! Where others see difficulties, I see your skills growing sharper every single day! Keep learning, keep building, and stay humble. Remember: with Bal Ganesha's blessings, no obstacle can ever stop you! Ganpati Bappa Morya!",
    theme: 'Perseverance & Grace',
  },
  {
    id: 'whisper-6',
    sanskritTitle: '॥ शांति व प्रेम • DIVINE SERENITY ॥',
    englishTitle: 'Peace Like A Quiet Temple',
    mentionsNiat: false,
    text: "Listen to my voice, dear one... the storm you were worried about is passing away. Beautiful golden days full of love, laughter, and great blessings are opening up for you. Walk with a happy heart—your Ganesha loves you always!",
    theme: 'Serenity & Love',
  }
];

export function getRandomSecretMessage() {
  const index = Math.floor(Math.random() * SECRET_MESSAGES.length);
  return SECRET_MESSAGES[index];
}

// ─── CARTOON BAL GANESHA / DIVINE VOICE SYNTHESIS ───
export function speakSecretWhisper(text, { mode = 'cartoon', onStart, onEnd, onError } = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onError) onError(new Error("Speech synthesis not supported"));
    return null;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices() || [];

    // Prioritize natural expressive voices
    const preferredVoice =
      voices.find(v => v.lang === 'en-IN') ||
      voices.find(v => v.lang.startsWith('en') && (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha'))) ||
      voices.find(v => v.lang.startsWith('en')) ||
      voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    if (mode === 'cartoon') {
      // Sweet, energetic, animated Bal Ganesha cartoon voice
      utterance.pitch = 1.38; // Sweet, youthful, cartoon-like
      utterance.rate = 0.94;  // Cheerful, expressive, enjoyable
      utterance.volume = 1.0;
    } else {
      // Resonant, calm temple deity voice
      utterance.pitch = 0.88;
      utterance.rate = 0.82;
      utterance.volume = 1.0;
    }

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    if (onError) utterance.onerror = onError;

    window.speechSynthesis.speak(utterance);
    return utterance;
  } catch (err) {
    console.warn("Speech synthesis error:", err);
    if (onError) onError(err);
    return null;
  }
}

export function pauseSecretWhisper() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
  }
}

export function resumeSecretWhisper() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }
}

export function stopSecretWhisper() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
