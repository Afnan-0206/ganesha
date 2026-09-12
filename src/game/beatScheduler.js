import { playDhol, playTasha, playManjira } from '../audio/synthInstruments';
import { getRandomGlyph } from '../data/glyphs';

export class BeatScheduler {
  constructor({ audioCtx, canto, difficultyEngine, onGlyphSpawn, onCantoComplete }) {
    this.ctx = audioCtx;
    this.canto = canto;
    this.difficultyEngine = difficultyEngine;
    this.onGlyphSpawn = onGlyphSpawn || (() => {});
    this.onCantoComplete = onCantoComplete || (() => {});

    this.isPlaying = false;
    this.lookaheadMs = 25.0;
    this.scheduleAheadTime = 0.4; // seconds
    this.travelDuration = 1.8; // seconds that glyph takes to travel to writing point

    this.secondsPerBeat = 60.0 / canto.bpm;
    this.nextBeatTime = 0;
    this.currentBeatIndex = 0;
    this.totalBeatsInCanto = Math.floor(canto.durationSeconds / this.secondsPerBeat);
    this.timerId = null;
  }

  start(startTimeOffset = 0.2) {
    if (!this.ctx) return;
    this.isPlaying = true;
    this.nextBeatTime = this.ctx.currentTime + startTimeOffset;
    this.currentBeatIndex = 0;
    this.scheduleLoop();
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  scheduleLoop() {
    if (!this.isPlaying) return;

    // While there are beats that need to be scheduled within the scheduleAheadTime window
    while (this.nextBeatTime < this.ctx.currentTime + this.scheduleAheadTime && this.currentBeatIndex < this.totalBeatsInCanto) {
      this.scheduleBeat(this.nextBeatTime, this.currentBeatIndex);
      this.nextBeatTime += this.secondsPerBeat;
      this.currentBeatIndex++;
    }

    // Check if all beats have finished and elapsed
    if (this.currentBeatIndex >= this.totalBeatsInCanto && this.ctx.currentTime >= this.nextBeatTime + 1.0) {
      this.stop();
      this.onCantoComplete();
      return;
    }

    this.timerId = setTimeout(() => this.scheduleLoop(), this.lookaheadMs);
  }

  scheduleBeat(time, beatIndex) {
    const pattern = this.difficultyEngine.getEffectivePattern(this.canto);
    const patternIndex = beatIndex % pattern.length;
    const isNoteActive = pattern[patternIndex] === 1;
    const isDownbeat = patternIndex % 4 === 0;

    // 1. Audio Scheduling
    if (isDownbeat) {
      playDhol(time, 1.0);
    } else if (isNoteActive) {
      playTasha(time, this.canto.tashaIntensity);
    }

    if (beatIndex % (this.canto.manjiraRate * 4) === 0) {
      playManjira(time, 1.0);
    }

    // 2. Visual Glyph Scheduling (only for active hit notes)
    if (isNoteActive) {
      const glyph = {
        id: `canto${this.canto.id}_beat${beatIndex}_${Math.random()}`,
        glyphData: getRandomGlyph(),
        targetTime: time,
        spawnTime: time - this.travelDuration,
        travelDuration: this.travelDuration,
        beatIndex,
        hit: false,
        missed: false,
        hitType: null,
        verseChar: String.fromCharCode(65 + (beatIndex % 26)) // internal index
      };
      this.onGlyphSpawn(glyph);
    }
  }
}
