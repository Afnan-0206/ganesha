// Dynamic Difficulty & Speed Engine
// Authentic festive difficulty tiers: Devotee (Bhakta), Celebrant (Utsavi), Temple Master (Mahant)

export const DIFFICULTY_STORAGE_KEY = 'panch_vighna_difficulty_v1';

export const DIFFICULTY_TIERS = {
  devotee: {
    id: 'devotee',
    name: 'Devotee',
    sanskritName: 'Bhakta',
    icon: '🌸',
    desc: 'Gentle cadence & relaxed timing. Ideal for a meditative, joyful festival experience.',
    speedMult: 0.8,
    // Stage 3 (Modak) tuning
    modakSpeed: 0.0033,
    modakSpawnInterval: 1.2,
    catchRadiusBonus: 0.03,
    steamZone: { min: 32, max: 72 }, // Wide 40% golden window
    steamNeedleSpeed: 2.0,
    // Stage 4 (Dhol) tuning
    dholSpeedMult: 0.8,
    timingMult: 1.35, // 35% more forgiving
    scoreMult: 1.0,
    badgeColor: '#10B981',
    badgeBg: 'rgba(16, 185, 129, 0.18)',
    badgeBorder: 'rgba(16, 185, 129, 0.5)',
  },
  celebrant: {
    id: 'celebrant',
    name: 'Celebrant',
    sanskritName: 'Utsavi',
    icon: '🪔',
    desc: 'The authentic balanced festival celebration. Standard speeds & true traditional rhythms.',
    speedMult: 1.0,
    // Stage 3 (Modak) tuning
    modakSpeed: 0.0042,
    modakSpawnInterval: 1.0,
    catchRadiusBonus: 0,
    steamZone: { min: 40, max: 65 }, // Standard 25% golden window
    steamNeedleSpeed: 2.5,
    // Stage 4 (Dhol) tuning
    dholSpeedMult: 1.0,
    timingMult: 1.0,
    scoreMult: 1.15,
    badgeColor: '#F59E0B',
    badgeBg: 'rgba(245, 158, 11, 0.18)',
    badgeBorder: 'rgba(245, 158, 11, 0.5)',
  },
  master: {
    id: 'master',
    name: 'Temple Master',
    sanskritName: 'Mahant',
    icon: '👑',
    desc: 'Fast dhol processions, swift modak catches & strict steamer precision. 35% Score Bonus!',
    speedMult: 1.25,
    // Stage 3 (Modak) tuning
    modakSpeed: 0.0055,
    modakSpawnInterval: 0.85,
    catchRadiusBonus: -0.015,
    steamZone: { min: 45, max: 60 }, // Tight 15% golden window
    steamNeedleSpeed: 3.2,
    // Stage 4 (Dhol) tuning
    dholSpeedMult: 1.25,
    timingMult: 0.78, // Tighter precision window
    scoreMult: 1.35, // High score bonus
    badgeColor: '#EC4899',
    badgeBg: 'rgba(236, 72, 153, 0.18)',
    badgeBorder: 'rgba(236, 72, 153, 0.5)',
  },
};

export const DEFAULT_DIFFICULTY_ID = 'celebrant';

export function getDifficultyById(id) {
  return DIFFICULTY_TIERS[id] || DIFFICULTY_TIERS[DEFAULT_DIFFICULTY_ID];
}

export function getCurrentDifficulty() {
  if (typeof window === 'undefined') {
    return DIFFICULTY_TIERS[DEFAULT_DIFFICULTY_ID];
  }
  try {
    const saved = localStorage.getItem(DIFFICULTY_STORAGE_KEY);
    if (saved && DIFFICULTY_TIERS[saved]) {
      return DIFFICULTY_TIERS[saved];
    }
  } catch {
    // LocalStorage fallback
  }
  return DIFFICULTY_TIERS[DEFAULT_DIFFICULTY_ID];
}

export function setCurrentDifficulty(id) {
  const tier = getDifficultyById(id);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(DIFFICULTY_STORAGE_KEY, tier.id);
      window.dispatchEvent(new CustomEvent('panch_vighna_difficulty_changed', { detail: tier }));
    } catch {
      // LocalStorage fallback
    }
  }
  return tier;
}

// Legacy DifficultyEngine preserved for backward compatibility
export class DifficultyEngine {
  constructor() {
    this.mistakePressure = 0; // 0.0 to 1.0
  }

  reset() {
    this.mistakePressure = 0;
  }

  recordHit(streak) {
    this.mistakePressure = Math.max(0, this.mistakePressure - 0.15);
  }

  recordMiss() {
    this.mistakePressure = Math.min(0.8, this.mistakePressure + 0.25);
  }

  shouldAddSyncopation(baseValue) {
    if (baseValue === 0 && this.mistakePressure > 0.4) {
      return Math.random() < this.mistakePressure * 0.4;
    }
    return false;
  }

  getEffectivePattern(canto) {
    const base = [...canto.basePattern];
    if (this.mistakePressure > 0.3) {
      for (let i = 0; i < base.length; i++) {
        if (base[i] === 0 && Math.random() < this.mistakePressure * 0.35) {
          base[i] = 1;
        }
      }
    }
    return base;
  }
}
