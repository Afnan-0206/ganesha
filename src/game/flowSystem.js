import { FLOW_CONFIG, getFlowState } from './gameConfig';

export class FlowSystem {
  constructor(onFlowChange, onRecoveryTriggered) {
    this.flow = FLOW_CONFIG.INITIAL_FLOW;
    this.recoveryStreak = 0;
    this.wasUnstableOrBroken = false;
    this.onFlowChange = onFlowChange || (() => {});
    this.onRecoveryTriggered = onRecoveryTriggered || (() => {});
    // Elegant subtle manuscript disorders (never giant black blobs)
    this.disorders = []; // { id, type: 'smear'|'broken_stroke'|'tiny_droplet', x, y, alpha, size }
  }

  reset() {
    this.flow = FLOW_CONFIG.INITIAL_FLOW;
    this.recoveryStreak = 0;
    this.wasUnstableOrBroken = false;
    this.disorders = [];
    this.notify();
  }

  getFlow() {
    return this.flow;
  }

  getState() {
    return getFlowState(this.flow);
  }

  onHit(hitType) {
    const delta = hitType === 'PERFECT' ? FLOW_CONFIG.PERFECT_DELTA : FLOW_CONFIG.GOOD_DELTA;
    this.flow = Math.min(FLOW_CONFIG.MAX_FLOW, this.flow + delta);
    this.recoveryStreak += 1;

    // Fade existing disorders with each clean hit
    if (this.disorders.length > 0) {
      this.disorders.forEach(d => {
        d.alpha *= 0.65;
      });
      this.disorders = this.disorders.filter(d => d.alpha > 0.05);
    }

    // Check if recovery streak threshold met after unstable/broken state
    if (this.wasUnstableOrBroken && this.recoveryStreak >= FLOW_CONFIG.RECOVERY_STREAK_TARGET) {
      this.wasUnstableOrBroken = false;
      this.clearDisorders();
      this.onRecoveryTriggered({
        type: this.flow >= 85 ? 'UNSTOPPABLE FLOW' : 'FLOW RESTORED',
        streak: this.recoveryStreak
      });
    }

    this.notify();
  }

  onMiss(position = { x: 0.5, y: 0.5 }) {
    this.flow = Math.max(FLOW_CONFIG.MIN_FLOW, this.flow + FLOW_CONFIG.MISS_DELTA);
    this.recoveryStreak = 0;

    if (this.flow < FLOW_CONFIG.STATES.STEADY.min) {
      this.wasUnstableOrBroken = true;
    }

    // Add an elegant manuscript disorder: slight ink smear or severed stroke
    this.addDisorder(position.x, position.y);
    this.notify();
  }

  onMushakBonus() {
    this.flow = Math.min(FLOW_CONFIG.MAX_FLOW, this.flow + FLOW_CONFIG.MUSHAK_BONUS_DELTA);
    this.clearDisorders(0.5);
    this.notify();
  }

  addDisorder(normX, normY) {
    if (this.disorders.length > 6) {
      this.disorders.shift();
    }
    const types = ['smear', 'broken_stroke', 'tiny_droplet'];
    const type = types[Math.floor(Math.random() * types.length)];

    this.disorders.push({
      id: Date.now() + Math.random(),
      type,
      x: normX,
      y: normY,
      width: type === 'smear' ? 36 + Math.random() * 20 : 16,
      height: type === 'smear' ? 4 + Math.random() * 3 : 8,
      alpha: 0.35, // Gentle translucent smudge
      angle: (Math.random() - 0.5) * 0.25
    });
  }

  clearDisorders(factor = 1.0) {
    if (factor >= 1.0) {
      this.disorders = [];
    } else {
      this.disorders = this.disorders.slice(Math.floor(this.disorders.length * factor));
    }
  }

  getDisorders() {
    return this.disorders;
  }

  // Backward compatibility getter
  getInkBlots() {
    return this.disorders;
  }

  notify() {
    this.onFlowChange(this.flow, this.getState(), this.recoveryStreak);
  }
}
