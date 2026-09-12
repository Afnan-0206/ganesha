// Dynamic Difficulty Engine
// Adapts pattern density and syncopation smoothly based on flow state and streak

export class DifficultyEngine {
  constructor() {
    this.mistakePressure = 0; // 0.0 to 1.0
  }

  reset() {
    this.mistakePressure = 0;
  }

  recordHit(streak) {
    // Recovery naturally eases mistake pressure
    this.mistakePressure = Math.max(0, this.mistakePressure - 0.15);
  }

  recordMiss() {
    // Misses build slight syncopation pressure (clamped)
    this.mistakePressure = Math.min(0.8, this.mistakePressure + 0.25);
  }

  shouldAddSyncopation(baseValue) {
    // If base pattern is quiet, mistake pressure may occasionally add a soft offbeat
    if (baseValue === 0 && this.mistakePressure > 0.4) {
      return Math.random() < this.mistakePressure * 0.4;
    }
    return false;
  }

  getEffectivePattern(canto) {
    const base = [...canto.basePattern];
    if (this.mistakePressure > 0.3) {
      // Create slight variation for pressure
      for (let i = 0; i < base.length; i++) {
        if (base[i] === 0 && Math.random() < this.mistakePressure * 0.35) {
          base[i] = 1;
        }
      }
    }
    return base;
  }
}
