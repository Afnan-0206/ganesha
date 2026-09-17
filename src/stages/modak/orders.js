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
    id: 'classic',
    name: 'Classic Coconut Modak',
    subtitle: 'Aarti Prasad',
    icon: '🥟',
    required: ['coconut', 'jaggery', 'ghee', 'rice_flour'],
    catchTarget: 8,
  },
  {
    id: 'saffron',
    name: 'Royal Kesar Modak',
    subtitle: 'Bhog Offering',
    icon: '✨',
    required: ['saffron', 'cashew', 'ghee', 'rice_flour'],
    catchTarget: 8,
  },
  {
    id: 'mewa',
    name: 'Dry Fruit Pista Modak',
    subtitle: 'Pandal Devotees',
    icon: '🥜',
    required: ['pista', 'cashew', 'coconut', 'cardamom'],
    catchTarget: 8,
  },
  {
    id: 'supreme',
    name: 'Ganpati Supreme Modak',
    subtitle: 'The Divine Offering',
    icon: '👑',
    required: ['saffron', 'coconut', 'jaggery', 'cardamom', 'ghee'],
    catchTarget: 10,
  },
  {
    id: 'festive',
    name: 'Festival Special',
    subtitle: 'Grand Celebration',
    icon: '🎉',
    required: ['coconut', 'pista', 'saffron', 'ghee', 'rice_flour'],
    catchTarget: 10,
  },
];

export function getRecipe(index) {
  return MODAK_RECIPES[index % MODAK_RECIPES.length];
}

export function getIngredientById(id) {
  return INGREDIENTS.find(i => i.id === id) || BAD_ITEMS.find(i => i.id === id);
}

// Generate falling items mix for a recipe
export function generateFallingItems(recipe, count = 20) {
  const items = [];
  const requiredIds = recipe.required;
  const otherIngredients = INGREDIENTS.filter(i => !requiredIds.includes(i.id));

  for (let i = 0; i < count; i++) {
    const rand = Math.random();
    let item;

    if (rand < 0.5) {
      // 50% chance: correct ingredient
      item = { ...INGREDIENTS.find(ing => ing.id === requiredIds[i % requiredIds.length]) };
      item.isCorrect = true;
    } else if (rand < 0.8) {
      // 30% chance: wrong but harmless ingredient
      item = { ...otherIngredients[Math.floor(Math.random() * otherIngredients.length)] };
      item.isCorrect = false;
    } else {
      // 20% chance: bad item (penalty)
      item = { ...BAD_ITEMS[Math.floor(Math.random() * BAD_ITEMS.length)] };
      item.isCorrect = false;
    }

    items.push({
      ...item,
      spawnDelay: i * 800 + Math.random() * 400,  // ms from start
      lane: Math.random() * 0.7 + 0.15, // x position (0.15 to 0.85)
      speed: 0.002 + (i / count) * 0.001, // increases as game progresses
    });
  }

  return items;
}
