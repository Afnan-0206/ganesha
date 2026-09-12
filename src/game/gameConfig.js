// Central Authoritative Game Configuration

export const TIMING_WINDOWS = {
  PERFECT_MS: 70,  // ±70 ms (Ensures smooth, reliable Perfect hits on desktop & mobile)
  GOOD_MS: 140,    // ±140 ms
  MISS_THRESHOLD_MS: 190 // Anything later is an automatic miss
};

export const FLOW_CONFIG = {
  INITIAL_FLOW: 75,
  MAX_FLOW: 100,
  MIN_FLOW: 0,
  
  PERFECT_DELTA: 4.0,
  GOOD_DELTA: 2.0,
  MISS_DELTA: -7.5,
  MUSHAK_BONUS_DELTA: 16.0,

  // Recovery streak requirement to trigger "FLOW RESTORED"
  RECOVERY_STREAK_TARGET: 5,

  // Flow State Thresholds
  STATES: {
    PURE: { min: 80, label: 'PURE FLOW', id: 'pure', color: '#10B981' },
    STEADY: { min: 60, label: 'STEADY FLOW', id: 'steady', color: '#F59E0B' },
    UNSTABLE: { min: 35, label: 'UNSTABLE FLOW', id: 'unstable', color: '#F97316' },
    BROKEN: { min: 0, label: 'BROKEN FLOW', id: 'broken', color: '#DC2626' }
  }
};

export function getFlowState(flow) {
  if (flow >= FLOW_CONFIG.STATES.PURE.min) return FLOW_CONFIG.STATES.PURE;
  if (flow >= FLOW_CONFIG.STATES.STEADY.min) return FLOW_CONFIG.STATES.STEADY;
  if (flow >= FLOW_CONFIG.STATES.UNSTABLE.min) return FLOW_CONFIG.STATES.UNSTABLE;
  return FLOW_CONFIG.STATES.BROKEN;
}

export const SCORE_WEIGHTS = {
  VERSE_HIT: 10,
  ACCURACY_MULT: 2,
  COMBO_MULT: 5,
  CANTO_COMPLETE_BONUS: 250,
  PERFECT_BONUS: 5
};

export const RATINGS = {
  MASTER: { minPercent: 95, title: 'MASTER OF FLOW', badge: '✦✦✦' },
  STEADFAST: { minPercent: 85, title: 'STEADFAST SCRIBE', badge: '✦✦' },
  DEDICATED: { minPercent: 70, title: 'DEDICATED SCRIBE', badge: '✦' },
  CONTINUES: { minPercent: 0, title: 'THE VOW CONTINUES', badge: '•' }
};

export function calculateRating(flowAvgPercent) {
  if (flowAvgPercent >= RATINGS.MASTER.minPercent) return RATINGS.MASTER;
  if (flowAvgPercent >= RATINGS.STEADFAST.minPercent) return RATINGS.STEADFAST;
  if (flowAvgPercent >= RATINGS.DEDICATED.minPercent) return RATINGS.DEDICATED;
  return RATINGS.CONTINUES;
}
