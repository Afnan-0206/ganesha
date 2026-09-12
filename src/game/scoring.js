import { SCORE_WEIGHTS, calculateRating } from './gameConfig';

export class ScoreKeeper {
  constructor() {
    this.reset();
  }

  reset() {
    this.totalScore = 0;
    this.versesHit = 0;
    this.perfectHits = 0;
    this.goodHits = 0;
    this.misses = 0;
    this.currentCombo = 0;
    this.longestCombo = 0;
    this.cantosCompleted = 0;
    this.flowHistory = [];
    this.startTime = Date.now();
  }

  recordHit(type, currentFlow) {
    this.versesHit += 1;
    this.currentCombo += 1;
    if (this.currentCombo > this.longestCombo) {
      this.longestCombo = this.currentCombo;
    }

    if (type === 'PERFECT') {
      this.perfectHits += 1;
      this.totalScore += SCORE_WEIGHTS.VERSE_HIT + SCORE_WEIGHTS.PERFECT_BONUS;
    } else if (type === 'GOOD') {
      this.goodHits += 1;
      this.totalScore += SCORE_WEIGHTS.VERSE_HIT;
    }

    // Add combo multiplier
    this.totalScore += Math.floor(this.currentCombo * 1.5);
    this.recordFlow(currentFlow);
  }

  recordMiss(currentFlow) {
    this.misses += 1;
    this.currentCombo = 0;
    this.recordFlow(currentFlow);
  }

  recordFlow(flow) {
    this.flowHistory.push(flow);
  }

  recordCantoComplete(cantoIndex) {
    this.cantosCompleted = Math.max(this.cantosCompleted, cantoIndex);
    this.totalScore += SCORE_WEIGHTS.CANTO_COMPLETE_BONUS;
  }

  getAccuracy() {
    const totalAttempts = this.versesHit + this.misses;
    if (totalAttempts === 0) return 100;
    // Perfect counts 100%, Good counts 70%
    const weighted = (this.perfectHits * 1.0) + (this.goodHits * 0.7);
    return Math.round((weighted / totalAttempts) * 100);
  }

  getAverageFlow() {
    if (this.flowHistory.length === 0) return 75;
    const sum = this.flowHistory.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.flowHistory.length);
  }

  getFinalSummary() {
    const accuracy = this.getAccuracy();
    const averageFlow = this.getAverageFlow();
    const flowRating = calculateRating(averageFlow);
    const sessionDurationSeconds = Math.round((Date.now() - this.startTime) / 1000);

    // Final deterministic formula as per contest spec:
    // score = (versesHit * 10) + (accuracyPercent * 2) + (longestCombo * 5) + cantoBonus + flowBonus
    const finalScore = Math.max(
      this.totalScore,
      (this.versesHit * SCORE_WEIGHTS.VERSE_HIT) +
      (accuracy * SCORE_WEIGHTS.ACCURACY_MULT) +
      (this.longestCombo * SCORE_WEIGHTS.COMBO_MULT) +
      (this.cantosCompleted * SCORE_WEIGHTS.CANTO_COMPLETE_BONUS) +
      Math.round(averageFlow * 2)
    );

    return {
      score: finalScore,
      versesHit: this.versesHit,
      perfectHits: this.perfectHits,
      goodHits: this.goodHits,
      misses: this.misses,
      accuracy,
      currentCombo: this.currentCombo,
      longestCombo: this.longestCombo,
      cantosCompleted: this.cantosCompleted,
      averageFlow,
      flowRating,
      sessionDurationSeconds
    };
  }
}
