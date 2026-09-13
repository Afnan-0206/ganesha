// Panch Vighna: Global Festival Session State Manager
// Shared state across all 5 stages (Rangoli, Pandal, Modak, Dhol, Visarjan)

export const STAGES = [
  { id: 'rangoli', name: 'RANGOLI', title: 'The First Vighna', subtitle: 'Draw the Beginning', skill: 'Pattern & Memory' },
  { id: 'pandal', name: 'PANDAL', title: 'The Second Vighna', subtitle: 'Light the Celebration', skill: 'Spatial Circuit' },
  { id: 'modak', name: 'MODAK', title: 'The Third Vighna', subtitle: 'The Prasad Rush', skill: 'Precision Kitchen' },
  { id: 'dhol', name: 'DHOL', title: 'The Fourth Vighna', subtitle: 'Call of the Procession', skill: 'Rhythm Call & Response' },
  { id: 'visarjan', name: 'VISARJAN', title: 'The Fifth Vighna', subtitle: 'The Final Journey', skill: 'Route Strategy' }
];

export class FestivalState {
  constructor() {
    this.reset();
  }

  reset() {
    this.currentStageIndex = 0;
    this.festivalFlow = 100;
    this.vighnasOvercome = 0;
    this.stageScores = {
      rangoli: 0,
      pandal: 0,
      modak: 0,
      dhol: 0,
      visarjan: 0
    };
    this.stageAccuracy = {
      rangoli: 0,
      pandal: 0,
      modak: 0,
      dhol: 0,
      visarjan: 0
    };
    this.stageDetails = {
      rangoli: null,
      pandal: null,
      modak: null,
      dhol: null,
      visarjan: null
    };
    this.startTime = Date.now();
  }

  saveToStorage() {
    try {
      const state = {
        currentStageIndex: this.currentStageIndex,
        festivalFlow: this.festivalFlow,
        vighnasOvercome: this.vighnasOvercome,
        stageScores: this.stageScores,
        stageAccuracy: this.stageAccuracy,
        stageDetails: this.stageDetails,
        startTime: this.startTime
      };
      localStorage.setItem('ganesha_festival_state', JSON.stringify(state));
    } catch (e) {
      console.warn("Failed to save state to localStorage", e);
    }
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem('ganesha_festival_state');
      if (data) {
        const state = JSON.parse(data);
        this.currentStageIndex = state.currentStageIndex || 0;
        this.festivalFlow = state.festivalFlow || 100;
        this.vighnasOvercome = state.vighnasOvercome || 0;
        this.stageScores = state.stageScores || this.stageScores;
        this.stageAccuracy = state.stageAccuracy || this.stageAccuracy;
        this.stageDetails = state.stageDetails || this.stageDetails;
        this.startTime = state.startTime || Date.now();
        return true;
      }
    } catch (e) {
      console.warn("Failed to load state from localStorage", e);
    }
    return false;
  }

  clearStorage() {
    try {
      localStorage.removeItem('ganesha_festival_state');
    } catch (e) {
      // ignore
    }
  }

  getCurrentStage() {
    return STAGES[this.currentStageIndex] || STAGES[0];
  }

  getTotalFestivalScore() {
    return (
      (this.stageScores.rangoli || 0) +
      (this.stageScores.pandal || 0) +
      (this.stageScores.modak || 0) +
      (this.stageScores.dhol || 0) +
      (this.stageScores.visarjan || 0)
    );
  }

  recordStageResult(stageId, score, accuracy, details = {}) {
    const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));
    const normalizedAccuracy = Math.max(0, Math.min(100, Math.round(accuracy)));

    this.stageScores[stageId] = normalizedScore;
    this.stageAccuracy[stageId] = normalizedAccuracy;
    this.stageDetails[stageId] = details;

    // A stage completed successfully counts as a Vighna overcome
    if (normalizedScore >= 60) {
      this.vighnasOvercome += 1;
    }

    // Flow adjustment: strong play maintains 90-100% flow
    if (normalizedScore >= 85) {
      this.adjustFlow(5);
    } else if (normalizedScore < 60) {
      this.adjustFlow(-10);
    }
    
    this.saveToStorage();
  }

  adjustFlow(delta) {
    this.festivalFlow = Math.max(0, Math.min(100, Math.round(this.festivalFlow + delta)));
    this.saveToStorage();
  }

  advanceStage() {
    if (this.currentStageIndex < STAGES.length - 1) {
      this.currentStageIndex += 1;
      this.saveToStorage();
      return true;
    }
    this.clearStorage(); // Clear when festival is fully completed
    return false; 
  }

  getWeakestVighna() {
    let lowestStage = STAGES[0];
    let minScore = Infinity;

    STAGES.forEach(stage => {
      const s = this.stageScores[stage.id];
      if (s < minScore) {
        minScore = s;
        lowestStage = stage;
      }
    });

    return { stage: lowestStage, score: minScore };
  }

  getFestivalRank() {
    const total = this.getTotalFestivalScore();
    if (total >= 475) return { title: 'FESTIVAL MASTER', min: 475, badge: '✦✦✦✦✦' };
    if (total >= 450) return { title: 'DEVOTED ORGANIZER', min: 450, badge: '✦✦✦✦' };
    if (total >= 400) return { title: 'STEADFAST CELEBRANT', min: 400, badge: '✦✦✦' };
    if (total >= 300) return { title: 'RISING CELEBRANT', min: 300, badge: '✦✦' };
    return { title: 'THE FESTIVAL CONTINUES', min: 0, badge: '✦' };
  }

  getSummary() {
    return {
      totalScore: this.getTotalFestivalScore(),
      maxScore: 500,
      festivalFlow: this.festivalFlow,
      vighnasOvercome: this.vighnasOvercome,
      stageScores: { ...this.stageScores },
      stageAccuracy: { ...this.stageAccuracy },
      stageDetails: { ...this.stageDetails },
      weakestVighna: this.getWeakestVighna(),
      rank: this.getFestivalRank(),
      sessionDuration: Math.round((Date.now() - this.startTime) / 1000)
    };
  }
}
