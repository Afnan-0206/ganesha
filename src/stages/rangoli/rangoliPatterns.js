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
    round: 3,
    name: 'Ashtadal Blossom',
    subtitle: 'Eight-Petal Harmony',
    previewDuration: 3.0,
    timeLimit: 18,
    gridSize: 7,
    dots: [
      { id: 0, row: 0, col: 3, type: 'sacred' },
      { id: 1, row: 1, col: 5, type: 'normal' },
      { id: 2, row: 3, col: 6, type: 'sacred' },
      { id: 3, row: 5, col: 5, type: 'normal' },
      { id: 4, row: 6, col: 3, type: 'sacred' },
      { id: 5, row: 5, col: 1, type: 'normal' },
      { id: 6, row: 3, col: 0, type: 'sacred' },
      { id: 7, row: 1, col: 1, type: 'normal' },
      { id: 8, row: 3, col: 3, type: 'center' },
    ],
    connections: [
      [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 8], [7, 8],
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0],
      [0, 2], [2, 4], [4, 6], [6, 0],
    ],
  },
  {
    round: 4,
    name: 'Navagraha Diamond',
    subtitle: 'Celestial Interlace',
    previewDuration: 2.8,
    timeLimit: 22,
    gridSize: 7,
    dots: [
      { id: 0, row: 0, col: 3, type: 'sacred' },
      { id: 1, row: 1, col: 5, type: 'normal' },
      { id: 2, row: 3, col: 6, type: 'normal' },
      { id: 3, row: 5, col: 5, type: 'normal' },
      { id: 4, row: 6, col: 3, type: 'sacred' },
      { id: 5, row: 5, col: 1, type: 'normal' },
      { id: 6, row: 3, col: 0, type: 'normal' },
      { id: 7, row: 1, col: 1, type: 'normal' },
      { id: 8, row: 3, col: 3, type: 'center' },
      { id: 9, row: 2, col: 2, type: 'sacred' },
      { id: 10, row: 2, col: 4, type: 'sacred' },
      { id: 11, row: 4, col: 4, type: 'sacred' },
      { id: 12, row: 4, col: 2, type: 'sacred' },
    ],
    connections: [
      [0, 8], [4, 8], [2, 8], [6, 8],
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0],
      [9, 10], [10, 11], [11, 12], [12, 9],
      [0, 10], [2, 11], [4, 12], [6, 9],
      [9, 8], [10, 8], [11, 8], [12, 8],
    ],
  },
  {
    round: 5,
    name: 'Ganesh Yantra',
    subtitle: 'The Supreme Sacred Pattern',
    previewDuration: 2.5,
    timeLimit: 25,
    gridSize: 7,
    dots: [
      { id: 0, row: 0, col: 3, type: 'sacred' },
      { id: 1, row: 1, col: 5, type: 'normal' },
      { id: 2, row: 3, col: 6, type: 'sacred' },
      { id: 3, row: 5, col: 5, type: 'normal' },
      { id: 4, row: 6, col: 3, type: 'sacred' },
      { id: 5, row: 5, col: 1, type: 'normal' },
      { id: 6, row: 3, col: 0, type: 'sacred' },
      { id: 7, row: 1, col: 1, type: 'normal' },
      { id: 8, row: 3, col: 3, type: 'center' },
      { id: 9, row: 1, col: 3, type: 'normal' },
      { id: 10, row: 3, col: 5, type: 'normal' },
      { id: 11, row: 5, col: 3, type: 'normal' },
      { id: 12, row: 3, col: 1, type: 'normal' },
      { id: 13, row: 2, col: 2, type: 'sacred' },
      { id: 14, row: 2, col: 4, type: 'sacred' },
      { id: 15, row: 4, col: 4, type: 'sacred' },
      { id: 16, row: 4, col: 2, type: 'sacred' },
    ],
    sequence: [0, 2, 4, 6, 0, 8, 1, 3, 5, 7, 8],
    fillColors: ['#B45309', '#FBBF24', '#FFFDF5']
  }
];

export function getPatternForLevel(level = 0) {
  return RANGOLI_PATTERNS[level % RANGOLI_PATTERNS.length];
}
