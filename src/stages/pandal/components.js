// Pandal Stage: Electrical & Illumination Circuit Components

export const PANDAL_NODES = [
  {
    id: 'generator',
    name: 'Main Generator',
    type: 'source',
    capacity: 100,
    x: 0.18,
    y: 0.50,
    icon: '⚡',
    desc: 'Primary Festival Power Source'
  },
  {
    id: 'lights',
    name: 'Toran Fairy Lights',
    type: 'load',
    powerCost: 25,
    required: true,
    x: 0.48,
    y: 0.22,
    icon: '💡',
    desc: 'Illuminates the grand entrance arch'
  },
  {
    id: 'diyas',
    name: 'Electric Diya Garlands',
    type: 'load',
    powerCost: 15,
    required: true,
    x: 0.78,
    y: 0.24,
    icon: '🪔',
    desc: 'Sanctum altar illumination'
  },
  {
    id: 'decoration',
    name: 'Flower & Silk Canopy',
    type: 'load',
    powerCost: 20,
    required: false,
    x: 0.48,
    y: 0.78,
    icon: '🌺',
    desc: 'Ceiling floral glow chandeliers'
  },
  {
    id: 'sound',
    name: 'Aarti Audio Speakers',
    type: 'load',
    powerCost: 25,
    required: false,
    x: 0.78,
    y: 0.76,
    icon: '📢',
    desc: 'Temple chimes & chants amplifier'
  },
  {
    id: 'dhol_stage',
    name: 'Dholak Stage Spotlights',
    type: 'load',
    powerCost: 15,
    required: false,
    x: 0.50,
    y: 0.50,
    icon: '🥁',
    desc: 'Procession stage spotlights'
  }
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
