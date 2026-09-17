// Visarjan River Navigation — Obstacle & Collectible Data

export const OBSTACLE_TYPES = [
  { id: 'rock', icon: '🪨', width: 0.06, height: 0.05, damage: 15 },
  { id: 'log', icon: '🪵', width: 0.09, height: 0.04, damage: 10 },
  { id: 'whirlpool', icon: '🌀', width: 0.07, height: 0.07, damage: 18 },
  { id: 'trash', icon: '🍃', width: 0.05, height: 0.05, damage: 8 },
];

export const COLLECTIBLE_TYPES = [
  { id: 'diya', icon: '🪔', points: 15, width: 0.045, height: 0.045 },
  { id: 'marigold', icon: '🌼', points: 10, width: 0.045, height: 0.045 },
  { id: 'lotus', icon: '🪷', points: 20, width: 0.05, height: 0.05 },
  { id: 'conch', icon: '🐚', points: 15, width: 0.045, height: 0.045 },
];

// High-speed, responsive festival river journey
export const GAME_DURATION = 30; // 30 seconds of fast-paced river excitement
export const BOAT_Y_SPEED = 0.022; // Snappy, ultra-responsive steering
export const BASE_SCROLL_SPEED = 0.0085; // Fast flow so items come swiftly
export const MAX_SCROLL_SPEED = 0.014;

// Generate rich, fast-flowing obstacles and blessings for the river journey
export function generateRiverObjects(duration = GAME_DURATION) {
  const objects = [];
  const totalCount = Math.floor(duration * 2.8); // Rich density of floating items

  for (let i = 0; i < totalCount; i++) {
    const progress = i / totalCount;
    const speed = BASE_SCROLL_SPEED + progress * (MAX_SCROLL_SPEED - BASE_SCROLL_SPEED);

    // Initial position starts immediately on screen (0.65) so items appear from second 1
    const posX = 0.65 + (i * 0.09) + (Math.random() * 0.03);
    const posY = 0.18 + Math.random() * 0.62;

    if (Math.random() < 0.52) {
      // Collectible blessing (diyas, lotus, marigolds)
      const type = COLLECTIBLE_TYPES[Math.floor(Math.random() * COLLECTIBLE_TYPES.length)];
      objects.push({
        uid: `col-${i}`,
        kind: 'collectible',
        ...type,
        x: posX,
        y: posY,
        speed: speed * 0.95,
        active: true,
        collected: false,
      });
    } else {
      // River obstacle
      const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
      objects.push({
        uid: `obs-${i}`,
        kind: 'obstacle',
        ...type,
        x: posX,
        y: posY,
        speed: speed,
        active: true,
        hit: false,
      });
    }
  }

  return objects;
}
