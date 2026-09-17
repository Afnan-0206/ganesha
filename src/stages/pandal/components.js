// Pandal Decoration Items & Placement Zones
// Each item has target positions on the pandal blueprint

export const PANDAL_ITEMS = [
  // Round 1 — Essential Sacred Elements
  {
    id: 'murti_platform',
    name: 'Sacred Murti Platform',
    icon: '🛕',
    description: 'The idol throne — heart of the pandal',
    targetX: 0.50, targetY: 0.45,
    zoneRadius: 0.06,
    round: 1,
    points: 30,
  },
  {
    id: 'toran',
    name: 'Toran Gateway',
    icon: '🌺',
    description: 'Marigold and mango leaf entrance arch',
    targetX: 0.50, targetY: 0.12,
    zoneRadius: 0.07,
    round: 1,
    points: 25,
  },
  {
    id: 'altar_diyas',
    name: 'Altar Diyas',
    icon: '🪔',
    description: 'Sacred oil lamps flanking the murti',
    targetX: 0.35, targetY: 0.50,
    zoneRadius: 0.06,
    round: 1,
    points: 25,
  },
  // Round 2 — Decorative Enhancements
  {
    id: 'fairy_lights',
    name: 'Toran Fairy Lights',
    icon: '💡',
    description: 'LED strings across the canopy',
    targetX: 0.50, targetY: 0.25,
    zoneRadius: 0.07,
    round: 2,
    points: 20,
  },
  {
    id: 'flower_canopy',
    name: 'Jasmine Canopy',
    icon: '🌸',
    description: 'Fragrant flower ceiling drape',
    targetX: 0.65, targetY: 0.35,
    zoneRadius: 0.07,
    round: 2,
    points: 20,
  },
  {
    id: 'bell',
    name: 'Temple Bell',
    icon: '🔔',
    description: 'Brass bell at the entrance',
    targetX: 0.50, targetY: 0.05,
    zoneRadius: 0.05,
    round: 2,
    points: 15,
  },
  {
    id: 'dhoop',
    name: 'Dhoop Incense',
    icon: '🕯️',
    description: 'Sandalwood incense stand',
    targetX: 0.65, targetY: 0.50,
    zoneRadius: 0.06,
    round: 2,
    points: 15,
  },
  // Round 3 — Grand Festival Extras
  {
    id: 'sound_system',
    name: 'Aarti Speakers',
    icon: '📢',
    description: 'Bhajan amplification system',
    targetX: 0.20, targetY: 0.30,
    zoneRadius: 0.06,
    round: 3,
    points: 15,
  },
  {
    id: 'rangoli_floor',
    name: 'Floor Rangoli',
    icon: '✨',
    description: 'Sacred kolam at the entrance steps',
    targetX: 0.50, targetY: 0.88,
    zoneRadius: 0.07,
    round: 3,
    points: 20,
  },
  {
    id: 'modak_prasad',
    name: 'Prasad Thali',
    icon: '🥟',
    description: 'Offering plate of sacred modaks',
    targetX: 0.50, targetY: 0.58,
    zoneRadius: 0.06,
    round: 3,
    points: 20,
  },
  {
    id: 'banner',
    name: 'Ganpati Banner',
    icon: '🚩',
    description: 'Saffron festival flag',
    targetX: 0.80, targetY: 0.15,
    zoneRadius: 0.06,
    round: 3,
    points: 15,
  },
];

export const PANDAL_VIGHNAS = [
  {
    id: 'limited_power',
    name: 'Limited Generator Reserve',
    description: 'Fuel conservation: Maximum capacity capped at 75W.',
    maxCapacity: 75,
    mandatoryIds: ['lights', 'diyas']
  },
  {
    id: 'quiet_zone',
    name: 'Evening Aarti Hush',
    description: 'Quiet neighborhood hours: Sound system disabled.',
    maxCapacity: 85,
    disabledIds: ['sound'],
    mandatoryIds: ['lights', 'diyas', 'decoration']
  }
];
