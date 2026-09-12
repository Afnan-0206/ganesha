// LocalStorage Leaderboard & Multi-Campus Manager for NIAT Contest

const STORAGE_KEYS = {
  PERSONAL_BEST: 'panch_vighna_personal_best',
  LEADERBOARD: 'panch_vighna_leaderboard_v2',
  PLAYER_PROFILE: 'panch_vighna_player_profile',
  AUDIO_SETTINGS: 'panch_vighna_audio_settings'
};

export const POPULAR_CAMPUSES = [
  'All Campuses',
  'IIT Bombay',
  'BITS Pilani',
  'NIT Trichy',
  'IIIT Hyderabad',
  'COEP Pune',
  'IIT Delhi',
  'Anna University'
];

// Rich multi-campus contest records across participating colleges
const DEFAULT_LEADERBOARD = [
  { id: '1', playerName: 'Arjun S.', campus: 'IIT Bombay', score: 4920, accuracy: 98, cantosCompleted: 5, longestCombo: 84, date: '2026-09-11' },
  { id: '2', playerName: 'Priya N.', campus: 'BITS Pilani', score: 4850, accuracy: 96, cantosCompleted: 5, longestCombo: 76, date: '2026-09-11' },
  { id: '3', playerName: 'Devendra K.', campus: 'NIT Trichy', score: 4710, accuracy: 94, cantosCompleted: 5, longestCombo: 68, date: '2026-09-12' },
  { id: '4', playerName: 'Ananya R.', campus: 'IIIT Hyderabad', score: 4580, accuracy: 92, cantosCompleted: 5, longestCombo: 60, date: '2026-09-12' },
  { id: '5', playerName: 'Rohan M.', campus: 'COEP Pune', score: 4420, accuracy: 89, cantosCompleted: 5, longestCombo: 52, date: '2026-09-12' },
  { id: '6', playerName: 'Tanvi J.', campus: 'IIT Bombay', score: 4290, accuracy: 87, cantosCompleted: 5, longestCombo: 49, date: '2026-09-12' },
  { id: '7', playerName: 'Siddharth V.', campus: 'IIT Delhi', score: 4150, accuracy: 85, cantosCompleted: 4, longestCombo: 44, date: '2026-09-12' },
  { id: '8', playerName: 'Kavya M.', campus: 'Anna University', score: 3980, accuracy: 82, cantosCompleted: 4, longestCombo: 38, date: '2026-09-12' }
];

export function getPlayerProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLAYER_PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return { nickname: 'Devoted Celebrant', campus: 'IIT Bombay' };
}

export function savePlayerProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEYS.PLAYER_PROFILE, JSON.stringify(profile));
  } catch (_) {}
}

export function getPersonalBest() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PERSONAL_BEST);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}

export function savePersonalBest(summary) {
  try {
    const current = getPersonalBest();
    if (!current || summary.score > current.score) {
      localStorage.setItem(STORAGE_KEYS.PERSONAL_BEST, JSON.stringify(summary));
      return true; // New record!
    }
  } catch (_) {}
  return false;
}

export function getLeaderboard() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return DEFAULT_LEADERBOARD;
}

export function submitScoreToLeaderboard({ playerName, campus, score, accuracy, cantosCompleted, longestCombo }) {
  // Sanity check
  if (score > 25000 || accuracy > 100) {
    return getLeaderboard();
  }

  const currentList = getLeaderboard();
  const newEntry = {
    id: 'entry_' + Date.now(),
    playerName: (playerName || 'Celebrant').slice(0, 24),
    campus: (campus || 'IIT Bombay').slice(0, 24),
    score: Math.round(score),
    accuracy: Math.round(accuracy),
    cantosCompleted: Math.min(5, Math.max(1, cantosCompleted || 5)),
    longestCombo: Math.round(longestCombo || 5),
    date: new Date().toISOString().split('T')[0]
  };

  const updated = [...currentList, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 30); // Top 30

  try {
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(updated));
  } catch (_) {}

  return updated;
}
