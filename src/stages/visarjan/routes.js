// Visarjan River Navigation — Obstacle & Collectible Data

export const OBSTACLE_TYPES = [
  { id: 'rock', icon: '🪨', width: 0.06, height: 0.05, damage: 15 },
  { id: 'log', icon: '🪵', width: 0.10, height: 0.04, damage: 10 },
  { id: 'whirlpool', icon: '🌀', width: 0.07, height: 0.07, damage: 20 },
  { id: 'trash', icon: '🗑️', width: 0.05, height: 0.05, damage: 8 },
];

export const COLLECTIBLE_TYPES = [
  { id: 'diya', icon: '🪔', points: 10, width: 0.04, height: 0.04 },
  { id: 'marigold', icon: '🌼', points: 8, width: 0.04, height: 0.04 },
  { id: 'lotus', icon: '🪷', points: 15, width: 0.05, height: 0.05 },
  { id: 'conch', icon: '🐚', points: 12, width: 0.04, height: 0.04 },
];

// Game constants
export const GAME_DURATION = 45; // seconds
export const BOAT_Y_SPEED = 0.008;
export const BASE_SCROLL_SPEED = 0.003;
export const MAX_SCROLL_SPEED = 0.008;

// Generate obstacles for the river journey
export function generateRiverObjects(duration) {
  const objects = [];
  const totalSegments = Math.floor(duration * 2); // ~2 objects per second

  for (let i = 0; i < totalSegments; i++) {
    const timeOffset = (i / totalSegments);
    const difficulty = timeOffset; // 0 to 1, increases over time

    // Spawn obstacle or collectible
    if (Math.random() < 0.55 + difficulty * 0.15) {
      // Obstacle
      const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
      objects.push({
        uid: `obs-${i}`,
        kind: 'obstacle',
        ...type,
        x: 1.1 + i * 0.25 + Math.random() * 0.1,
        y: 0.15 + Math.random() * 0.65,
        speed: BASE_SCROLL_SPEED + difficulty * (MAX_SCROLL_SPEED - BASE_SCROLL_SPEED),
        active: true,
        hit: false,
      });
    } else {
      // Collectible
      const type = COLLECTIBLE_TYPES[Math.floor(Math.random() * COLLECTIBLE_TYPES.length)];
      objects.push({
        uid: `col-${i}`,
        kind: 'collectible',
        ...type,
        x: 1.1 + i * 0.25 + Math.random() * 0.1,
        y: 0.15 + Math.random() * 0.65,
        speed: BASE_SCROLL_SPEED + difficulty * (MAX_SCROLL_SPEED - BASE_SCROLL_SPEED) * 0.8,
        active: true,
        collected: false,
      });
    }
  }

  return objects;
}
