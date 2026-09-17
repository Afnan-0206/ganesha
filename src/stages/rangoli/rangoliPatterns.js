// Rangoli Memory Grid Puzzle — 5 Progressive Rounds
// Each pattern has dots on a grid and connections the player must memorize & recreate

export const RANGOLI_ROUNDS = [
  {
    id: 'padma_5',
    name: 'Padma Star (5-Point Lotus)',
    description: 'The auspicious opening bloom.',
    previewDuration: 2.2,
    points: [
      { id: 0, x: 0.50, y: 0.20, landmark: true },  // Top petal
      { id: 1, x: 0.78, y: 0.40, landmark: false }, // Upper right
      { id: 2, x: 0.68, y: 0.76, landmark: true },  // Lower right
      { id: 3, x: 0.32, y: 0.76, landmark: true },  // Lower left
      { id: 4, x: 0.22, y: 0.40, landmark: false }, // Upper left
      { id: 5, x: 0.50, y: 0.50, landmark: true }   // Sacred center
    ],
    // Star sequence returning to center
    sequence: [0, 2, 4, 1, 3, 0, 5],
    fillColors: ['#FF7700', '#F59E0B', '#FFFDF5']
  },
  {
    id: 'surya_mandala_7',
    name: 'Surya Mandala (7-Ray Sun)',
    description: 'Radiant morning geometry.',
    previewDuration: 2.4,
    points: [
      { id: 0, x: 0.50, y: 0.18, landmark: true },
      { id: 1, x: 0.76, y: 0.28, landmark: false },
      { id: 2, x: 0.82, y: 0.58, landmark: true },
      { id: 3, x: 0.64, y: 0.82, landmark: false },
      { id: 4, x: 0.36, y: 0.82, landmark: true },
      { id: 5, x: 0.18, y: 0.58, landmark: false },
      { id: 6, x: 0.24, y: 0.28, landmark: true }
    ],
    sequence: [0, 1, 2, 3, 4, 5, 6, 0],
    fillColors: ['#E65100', '#FBBF24', '#FDE68A']
  },
  {
    id: 'ashtadal_8',
    name: 'Ashtadal (8-Petal Blossom)',
    description: 'Symmetric harmony and abundance.',
    previewDuration: 2.6,
    points: [
      { id: 0, x: 0.50, y: 0.16, landmark: true },
      { id: 1, x: 0.74, y: 0.26, landmark: false },
      { id: 2, x: 0.84, y: 0.50, landmark: true },
      { id: 3, x: 0.74, y: 0.74, landmark: false },
      { id: 4, x: 0.50, y: 0.84, landmark: true },
      { id: 5, x: 0.26, y: 0.74, landmark: false },
      { id: 6, x: 0.16, y: 0.50, landmark: true },
      { id: 7, x: 0.26, y: 0.26, landmark: false }
    ],
    sequence: [0, 2, 4, 6, 0, 1, 3, 5, 7, 1],
    fillColors: ['#D97706', '#EC4899', '#FFFDF5']
  },
  {
    id: 'diya_kolam_6',
    name: 'Diya Kolam (Sacred Flame)',
    description: 'The path of light and wisdom.',
    previewDuration: 2.3,
    points: [
      { id: 0, x: 0.50, y: 0.22, landmark: true }, // Flame tip
      { id: 1, x: 0.65, y: 0.42, landmark: false },
      { id: 2, x: 0.72, y: 0.68, landmark: true },
      { id: 3, x: 0.50, y: 0.78, landmark: true }, // Base
      { id: 4, x: 0.28, y: 0.68, landmark: true },
      { id: 5, x: 0.35, y: 0.42, landmark: false }
    ],
    sequence: [0, 1, 2, 3, 4, 5, 0, 3],
    fillColors: ['#F59E0B', '#FF7700', '#FFFBEB']
  },
  {
    id: 'diamond_mandala_9',
    name: 'Navagraha Diamond (9 Points)',
    description: 'Intricate celestial alignment.',
    previewDuration: 2.8,
    points: [
      { id: 0, x: 0.50, y: 0.15, landmark: true },
      { id: 1, x: 0.75, y: 0.30, landmark: false },
      { id: 2, x: 0.85, y: 0.50, landmark: true },
      { id: 3, x: 0.75, y: 0.70, landmark: false },
      { id: 4, x: 0.50, y: 0.85, landmark: true },
      { id: 5, x: 0.25, y: 0.70, landmark: false },
      { id: 6, x: 0.15, y: 0.50, landmark: true },
      { id: 7, x: 0.25, y: 0.30, landmark: false },
      { id: 8, x: 0.50, y: 0.50, landmark: true }
    ],
    sequence: [0, 2, 4, 6, 0, 8, 1, 3, 5, 7, 8],
    fillColors: ['#B45309', '#FBBF24', '#FFFDF5']
  }
];

export function getPatternForLevel(level = 0) {
  return RANGOLI_PATTERNS[level % RANGOLI_PATTERNS.length];
}
