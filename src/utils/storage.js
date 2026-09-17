// LocalStorage & Supabase Cloud Leaderboard Manager for NIAT Contest
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEYS = {
  PERSONAL_BEST: 'panch_vighna_personal_best',
  LEADERBOARD: 'panch_vighna_leaderboard_niat_v3',
  PLAYER_PROFILE: 'panch_vighna_player_profile',
  AUDIO_SETTINGS: 'panch_vighna_audio_settings'
};

export const POPULAR_CAMPUSES = [
  'All NIAT Campuses',
  'NIAT Hyderabad',
  'NIAT Bengaluru',
  'NIAT Vijayawada',
  'NIAT Pune',
  'NIAT Delhi-NCR',
  'NIAT Innovation Lab'
];

// Rich contest records across NIAT campus cohorts
const DEFAULT_LEADERBOARD = [
  { id: '1', playerName: 'Aarav Sharma', campus: 'NIAT Hyderabad', score: 4950, accuracy: 99, cantosCompleted: 5, longestCombo: 88, date: '2026-09-15' },
  { id: '2', playerName: 'Ananya Reddy', campus: 'NIAT Bengaluru', score: 4890, accuracy: 98, cantosCompleted: 5, longestCombo: 82, date: '2026-09-15' },
  { id: '3', playerName: 'Rohan Verma', campus: 'NIAT Vijayawada', score: 4780, accuracy: 96, cantosCompleted: 5, longestCombo: 75, date: '2026-09-16' },
  { id: '4', playerName: 'Pooja Patel', campus: 'NIAT Pune', score: 4690, accuracy: 94, cantosCompleted: 5, longestCombo: 70, date: '2026-09-16' },
  { id: '5', playerName: 'Aditya Rao', campus: 'NIAT Hyderabad', score: 4580, accuracy: 92, cantosCompleted: 5, longestCombo: 64, date: '2026-09-16' },
  { id: '6', playerName: 'Sneha Kulkarni', campus: 'NIAT Delhi-NCR', score: 4450, accuracy: 90, cantosCompleted: 5, longestCombo: 58, date: '2026-09-17' },
  { id: '7', playerName: 'Sai Krishna', campus: 'NIAT Bengaluru', score: 4320, accuracy: 88, cantosCompleted: 5, longestCombo: 52, date: '2026-09-17' },
  { id: '8', playerName: 'Vikram Mehta', campus: 'NIAT Innovation Lab', score: 4180, accuracy: 85, cantosCompleted: 5, longestCombo: 48, date: '2026-09-17' }
];

export function getPlayerProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLAYER_PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return { nickname: 'NIAT Developer', campus: 'NIAT Hyderabad' };
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

// Fetch live global leaderboard from Supabase with graceful fallback
export async function fetchCloudLeaderboard() {
  if (!isSupabaseConfigured || !supabase) {
    return getLeaderboard();
  }

  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(50);

    if (error) {
      console.warn('Supabase fetch error, falling back to local cache:', error.message);
      return getLeaderboard();
    }

    if (data && data.length > 0) {
      const formatted = data.map(item => ({
        id: item.id,
        playerName: item.player_name,
        campus: item.campus,
        score: item.score,
        accuracy: item.accuracy,
        cantosCompleted: item.cantos_completed ?? 5,
        longestCombo: item.longest_combo ?? 5,
        date: item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
      }));

      // Cache locally for offline capability
      try {
        localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(formatted));
      } catch (_) {}

      return formatted;
    }
  } catch (err) {
    console.warn('Network error fetching Supabase leaderboard:', err);
  }

  return getLeaderboard();
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
    campus: (campus || 'NIAT Hyderabad').slice(0, 24),
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

  // Sync to Supabase Cloud in background
  if (isSupabaseConfigured && supabase) {
    supabase
      .from('leaderboard')
      .insert([
        {
          player_name: newEntry.playerName,
          campus: newEntry.campus,
          score: newEntry.score,
          accuracy: newEntry.accuracy,
          cantos_completed: newEntry.cantosCompleted,
          longest_combo: newEntry.longestCombo
        }
      ])
      .then(({ error }) => {
        if (error) {
          console.warn('Failed to push score to Supabase:', error.message);
        } else {
          console.log('Successfully recorded score in Supabase Cloud!');
        }
      })
      .catch(err => {
        console.warn('Supabase cloud push error:', err);
      });
  }

  return updated;
}
