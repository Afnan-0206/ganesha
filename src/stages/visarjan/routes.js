// Visarjan Procession Routes & Dynamic Vighna Events

export const PROCESSION_ROUTES = [
  {
    id: 'bazaar',
    name: 'Main Bazaar Boulevard',
    type: 'direct',
    distance: 'Short (1.2 km)',
    crowd: 'High Density',
    baseTimeSeconds: 24,
    description: 'Bustling festival market with thousands of devotees singing bhajans',
    pathPoints: [
      { x: 0.15, y: 0.50 }, // Pandal
      { x: 0.38, y: 0.42 }, // Clock Tower Junction
      { x: 0.65, y: 0.45 }, // Flower Market
      { x: 0.88, y: 0.50 }  // Riverbank Ghat
    ]
  },
  {
    id: 'promenade',
    name: 'Lake Promenade',
    type: 'scenic',
    distance: 'Medium (1.6 km)',
    crowd: 'Moderate Density',
    baseTimeSeconds: 20,
    description: 'Wide paved path along the sacred lake with steady breeze',
    pathPoints: [
      { x: 0.15, y: 0.50 },
      { x: 0.35, y: 0.22 }, // North Lake Arch
      { x: 0.65, y: 0.25 }, // Promenade Viewpoint
      { x: 0.88, y: 0.50 }
    ]
  },
  {
    id: 'gardens',
    name: 'Temple Garden Lanes',
    type: 'calm',
    distance: 'Long (2.1 km)',
    crowd: 'Low Density',
    baseTimeSeconds: 28,
    description: 'Peaceful shaded lane flanked by marigold nurseries and banyan trees',
    pathPoints: [
      { x: 0.15, y: 0.50 },
      { x: 0.35, y: 0.78 }, // Banyan Grove
      { x: 0.65, y: 0.75 }, // South Garden Gate
      { x: 0.88, y: 0.50 }
    ]
  }
];

export const DYNAMIC_VIGHNAS = [
  {
    id: 'rain',
    name: 'Sudden Monsoon Showers',
    description: 'Rain sprinkles on the bazaar! Switch to sheltered promenade or proceed steadily?',
    affectedRouteId: 'bazaar',
    detourRouteId: 'promenade'
  },
  {
    id: 'crowd_surge',
    name: 'Aarti Crowd Gathering',
    description: 'Devotees gather for sunset aarti near the archway! Take garden bypass or hold steady?',
    affectedRouteId: 'promenade',
    detourRouteId: 'gardens'
  }
];
