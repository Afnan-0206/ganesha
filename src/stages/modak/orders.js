// Modak Falling Ingredients — Recipe & Item Definitions

export const INGREDIENTS = [
  { id: 'coconut', name: 'Fresh Coconut', icon: '🥥', color: '#8B6914' },
  { id: 'jaggery', name: 'Jaggery', icon: '🟤', color: '#A0522D' },
  { id: 'saffron', name: 'Kesar Saffron', icon: '🌼', color: '#FF8C00' },
  { id: 'cardamom', name: 'Elaichi', icon: '🌿', color: '#228B22' },
  { id: 'ghee', name: 'Pure Ghee', icon: '🧈', color: '#FFD700' },
  { id: 'rice_flour', name: 'Rice Flour', icon: '🌾', color: '#F5DEB3' },
  { id: 'pista', name: 'Pista', icon: '🥜', color: '#90EE90' },
  { id: 'cashew', name: 'Cashew', icon: '🥜', color: '#DEB887' },
];

// Bad items (penalties)
export const BAD_ITEMS = [
  { id: 'chili', name: 'Red Chili', icon: '🌶️', color: '#DC143C', isBad: true },
  { id: 'onion', name: 'Raw Onion', icon: '🧅', color: '#DDA0DD', isBad: true },
  { id: 'lemon', name: 'Sour Lemon', icon: '🍋', color: '#FFF44F', isBad: true },
];

export const MODAK_RECIPES = [
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
