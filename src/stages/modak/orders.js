// Modak Stage: Order Queue & Recipe Definitions

export const FILLING_TYPES = [
  { id: 'classic', name: 'Jaggery & Coconut', icon: '🥥', color: '#D97706' },
  { id: 'saffron', name: 'Kesar Saffron Cashew', icon: '✨', color: '#F59E0B' },
  { id: 'mewa', name: 'Dry Fruit Pista', icon: '🥜', color: '#10B981' }
];

export const INITIAL_ORDERS = [
  {
    id: 1,
    title: 'Aarti Prasad',
    targetCount: 3,
    fillingId: 'classic',
    desc: '3 Classic Coconut Modaks for morning aarti'
  },
  {
    id: 2,
    title: 'Bhog Offering',
    targetCount: 2,
    fillingId: 'saffron',
    desc: '2 Royal Kesar Modaks for main sanctum'
  },
  {
    id: 3,
    title: 'Pandal Devotees',
    targetCount: 4,
    fillingId: 'mewa',
    desc: '4 Dry-Fruit Modaks for visiting pilgrims'
  }
];
