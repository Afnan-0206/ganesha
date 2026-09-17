// Rangoli Memory Grid Puzzle — 5 Progressive Rounds
// Each pattern has dots on a grid and connections the player must memorize & recreate

export const RANGOLI_ROUNDS = [
  {
    round: 1,
    name: 'Padma Bloom',
    subtitle: 'The Opening Lotus',
    previewDuration: 3.5,
    timeLimit: 12,
    gridSize: 5, // 5x5 grid
    // Dots defined as grid positions (row, col) from 0
    dots: [
      { id: 0, row: 0, col: 2, type: 'sacred' },
      { id: 1, row: 2, col: 0, type: 'normal' },
      { id: 2, row: 2, col: 4, type: 'normal' },
      { id: 3, row: 4, col: 2, type: 'sacred' },
      { id: 4, row: 2, col: 2, type: 'center' },
    ],
    // Connections player must recreate (pairs of dot ids)
    connections: [
      [0, 4], [1, 4], [2, 4], [3, 4],
      [0, 1], [1, 3], [3, 2], [2, 0],
    ],
  },
  {
    round: 2,
    name: 'Surya Mandala',
    subtitle: 'Six Rays of Light',
    previewDuration: 3.2,
    timeLimit: 15,
    gridSize: 5,
    dots: [
      { id: 0, row: 0, col: 2, type: 'sacred' },
      { id: 1, row: 1, col: 4, type: 'normal' },
      { id: 2, row: 3, col: 4, type: 'normal' },
      { id: 3, row: 4, col: 2, type: 'sacred' },
      { id: 4, row: 3, col: 0, type: 'normal' },
      { id: 5, row: 1, col: 0, type: 'normal' },
      { id: 6, row: 2, col: 2, type: 'center' },
    ],
    connections: [
      [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
    ],
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
