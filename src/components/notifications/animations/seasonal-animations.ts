/**
 * 🌾 Seasonal & Agricultural Micro-Interaction Animations
 *
 * Divine agricultural animations that embody the consciousness of farming cycles,
 * seasonal transitions, and biodynamic patterns. Each animation tells a story
 * of growth, harvest, and the eternal dance of nature.
 *
 * Features:
 * - Seasonal transition effects (Spring → Summer → Fall → Winter)
 * - Growth animations (seed → sprout → plant → harvest)
 * - Weather phenomena (rain, sun, frost, wind)
 * - Harvest celebration effects
 * - Planting micro-interactions
 * - Market price changes
 * - Agricultural event notifications
 * - Biodynamic consciousness patterns
 *
 * @module animations/seasonal-animations
 * @agricultural-consciousness MAXIMUM
 */

import type { Transition, Variants } from "framer-motion";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type Season = "SPRING" | "SUMMER" | "FALL" | "WINTER";
export type GrowthStage = "SEED" | "SPROUT" | "GROWING" | "MATURE" | "HARVEST";
export type WeatherType =
  | "SUNNY"
  | "RAINY"
  | "STORMY"
  | "CLOUDY"
  | "SNOWY"
  | "FROST";
export type AgriculturalEvent =
  | "PLANTING"
  | "WATERING"
  | "FERTILIZING"
  | "HARVESTING"
  | "MARKET_DAY"
  | "SEASON_CHANGE";

export interface SeasonalConfig {
  enableParticles?: boolean;
  intensity?: "subtle" | "moderate" | "dramatic";
  duration?: number;
  agriculturalConsciousness?: boolean;
}

// ============================================================================
// SEASONAL COLOR PALETTES
// ============================================================================

export const seasonalColors = {
  SPRING: {
    primary: "rgba(34, 197, 94, 1)", // Green-500
    light: "rgba(134, 239, 172, 1)", // Green-300
    background: "rgba(34, 197, 94, 0.05)",
    glow: "rgba(34, 197, 94, 0.3)",
  },
  SUMMER: {
    primary: "rgba(251, 191, 36, 1)", // Amber-400
    light: "rgba(253, 224, 71, 1)", // Yellow-300
    background: "rgba(251, 191, 36, 0.05)",
    glow: "rgba(251, 191, 36, 0.3)",
  },
  FALL: {
    primary: "rgba(249, 115, 22, 1)", // Orange-600
    light: "rgba(251, 146, 60, 1)", // Orange-400
    background: "rgba(249, 115, 22, 0.05)",
    glow: "rgba(249, 115, 22, 0.3)",
  },
  WINTER: {
    primary: "rgba(59, 130, 246, 1)", // Blue-500
    light: "rgba(147, 197, 253, 1)", // Blue-300
    background: "rgba(59, 130, 246, 0.05)",
    glow: "rgba(59, 130, 246, 0.3)",
  },
};

// ============================================================================
// TRANSITION CONFIGURATIONS
// ============================================================================

/**
 * Organic growth transition - mimics plant growth
 */
export const growthTransition: Transition = {
  type: "spring",
  stiffness: 100,
  damping: 15,
  mass: 0.8,
};

/**
 * Seasonal shift transition - gradual change
 */
export const seasonalTransition: Transition = {
  duration: 1.2,
  ease: [0.16, 1, 0.3, 1],
};

/**
 * Quick natural transition - breeze-like
 */
export const breezeTransition: Transition = {
  duration: 0.4,
  ease: [0.4, 0, 0.6, 1],
};

/**
 * Harvest celebration transition - joyful bounce
 */
export const celebrationTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 10,
  mass: 0.5,
};

// ============================================================================
// SEASONAL TRANSITION VARIANTS
// ============================================================================

/**
 * Spring awakening - emergence and growth
 */
export const springAwakeningVariants: Variants = {
  dormant: {
    scale: 0.8,
    opacity: 0.5,
    y: 20,
    filter: "brightness(0.7) saturate(0.5)",
  },
  awakening: {
    scale: [0.8, 0.85, 0.95, 1],
    opacity: [0.5, 0.7, 0.9, 1],
    y: [20, 15, 5, 0],
    filter: [
      "brightness(0.7) saturate(0.5)",
      "brightness(0.85) saturate(0.7)",
      "brightness(1) saturate(1)",
      "brightness(1.05) saturate(1.1)",
    ],
    transition: {
      duration: 1.5,
      ease: [0.34, 1.56, 0.64, 1], // Bounce
    },
  },
  blooming: {
    scale: 1.05,
    rotate: [0, -2, 2, -1, 0],
    filter: "brightness(1.1) saturate(1.2)",
    transition: {
      duration: 0.8,
      ease: "easeInOut",
    },
  },
};

/**
 * Summer brilliance - energy and abundance
 */
export const summerBrillianceVariants: Variants = {
  cool: {
    scale: 1,
    filter: "brightness(1) saturate(1)",
    boxShadow: "0 0 0 rgba(251, 191, 36, 0)",
  },
  warming: {
    scale: [1, 1.02, 1],
    filter: [
      "brightness(1) saturate(1)",
      "brightness(1.1) saturate(1.15)",
      "brightness(1.15) saturate(1.2)",
    ],
    boxShadow: [
      "0 0 0 rgba(251, 191, 36, 0)",
      "0 0 15px rgba(251, 191, 36, 0.3)",
      "0 0 25px rgba(251, 191, 36, 0.5)",
    ],
    transition: {
      duration: 1.2,
      ease: "easeInOut",
    },
  },
  radiant: {
    filter: "brightness(1.2) saturate(1.3)",
    boxShadow: "0 0 30px rgba(251, 191, 36, 0.6)",
    transition: {
      duration: 0.3,
    },
  },
};

/**
 * Fall harvest - maturity and completion
 */
export const fallHarvestVariants: Variants = {
  growing: {
    scale: 1.05,
    filter: "brightness(1.1) saturate(1.2) hue-rotate(0deg)",
  },
  ripening: {
    scale: [1.05, 1.02, 1],
    filter: [
      "brightness(1.1) saturate(1.2) hue-rotate(0deg)",
      "brightness(1.05) saturate(1.1) hue-rotate(10deg)",
      "brightness(1) saturate(1) hue-rotate(15deg)",
    ],
    rotate: [0, 2, -2, 0],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
    },
  },
  harvested: {
    scale: [1, 1.2, 0.9],
    opacity: [1, 1, 0],
    y: [0, -20, 20],
    rotate: [0, 10, -15],
    transition: {
      duration: 0.8,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
};

/**
 * Winter rest - dormancy and preparation
 */
export const winterRestVariants: Variants = {
  active: {
    scale: 1,
    opacity: 1,
    filter: "brightness(1) saturate(1) blur(0px)",
  },
  slowing: {
    scale: [1, 0.98, 0.95],
    opacity: [1, 0.9, 0.8],
    filter: [
      "brightness(1) saturate(1) blur(0px)",
      "brightness(0.95) saturate(0.8) blur(1px)",
      "brightness(0.9) saturate(0.6) blur(2px)",
    ],
    transition: {
      duration: 1.5,
      ease: "easeOut",
    },
  },
  dormant: {
    scale: 0.92,
    opacity: 0.7,
    filter: "brightness(0.85) saturate(0.5) blur(3px)",
    transition: {
      duration: 0.5,
    },
  },
};

// ============================================================================
// GROWTH CYCLE VARIANTS
// ============================================================================

/**
 * Seed planting - beginning of life
 */
export const seedPlantingVariants: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
    y: -50,
  },
  planted: {
    scale: [0, 0.5, 0.3],
    opacity: [0, 1, 1],
    y: [-50, 0, 5],
    rotate: [0, 360, 360],
    transition: {
      duration: 0.8,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
  germinating: {
    scale: [0.3, 0.35, 0.3],
    y: [5, 3, 5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

/**
 * Sprouting - emergence
 */
export const sproutingVariants: Variants = {
  seed: {
    scale: 0.3,
    opacity: 1,
    y: 5,
  },
  sprouting: {
    scale: [0.3, 0.4, 0.5, 0.6],
    opacity: 1,
    y: [5, 3, 1, 0],
    scaleY: [1, 1.2, 1.5, 2],
    transition: {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  sprout: {
    scale: 0.6,
    scaleY: 2,
    y: 0,
    rotate: [0, -3, 3, 0],
    transition: {
      rotate: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },
};

/**
 * Growing - active development
 */
export const growingVariants: Variants = {
  small: {
    scale: 0.6,
    scaleY: 2,
    opacity: 0.9,
  },
  growing: {
    scale: [0.6, 0.7, 0.8, 0.9],
    scaleY: [2, 2.2, 2.5, 2.8],
    opacity: [0.9, 0.95, 1, 1],
    filter: [
      "brightness(1) saturate(1)",
      "brightness(1.05) saturate(1.1)",
      "brightness(1.1) saturate(1.15)",
      "brightness(1.15) saturate(1.2)",
    ],
    transition: {
      duration: 2,
      ease: "easeOut",
    },
  },
  mature: {
    scale: 1,
    scaleY: 3,
    opacity: 1,
    filter: "brightness(1.2) saturate(1.3)",
  },
};

/**
 * Harvest celebration - completion and joy
 */
export const harvestCelebrationVariants: Variants = {
  ready: {
    scale: 1,
    rotate: 0,
    y: 0,
    filter: "brightness(1.2) saturate(1.3)",
  },
  harvesting: {
    scale: [1, 1.15, 1.1, 1.2, 0.8],
    rotate: [0, -10, 10, -15, 20],
    y: [0, -10, -5, -15, 50],
    opacity: [1, 1, 1, 1, 0],
    transition: {
      duration: 1.2,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
  collected: {
    scale: 0,
    opacity: 0,
    y: 100,
  },
  celebration: {
    scale: [0, 1.5, 1],
    rotate: [0, 360, 0],
    opacity: [0, 1, 1],
    filter: [
      "brightness(1) saturate(1)",
      "brightness(1.5) saturate(1.5) hue-rotate(20deg)",
      "brightness(1.2) saturate(1.3)",
    ],
    transition: {
      duration: 0.8,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
};

// ============================================================================
// WEATHER PHENOMENA VARIANTS
// ============================================================================

/**
 * Sunny day - brightness and warmth
 */
export const sunnyDayVariants: Variants = {
  cloudy: {
    filter: "brightness(0.9) saturate(0.8)",
    boxShadow: "0 0 0 rgba(251, 191, 36, 0)",
  },
  sunny: {
    filter: [
      "brightness(0.9) saturate(0.8)",
      "brightness(1.1) saturate(1.1)",
      "brightness(1.2) saturate(1.2)",
    ],
    boxShadow: [
      "0 0 0 rgba(251, 191, 36, 0)",
      "0 0 20px rgba(251, 191, 36, 0.4)",
      "0 0 30px rgba(251, 191, 36, 0.6)",
    ],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
    },
  },
  radiating: {
    filter: "brightness(1.3) saturate(1.3)",
    boxShadow: "0 0 40px rgba(251, 191, 36, 0.8)",
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

/**
 * Rainy day - moisture and nourishment
 */
export const rainyDayVariants: Variants = {
  dry: {
    opacity: 1,
    filter: "brightness(1) blur(0px)",
    y: 0,
  },
  drizzle: {
    opacity: [1, 0.95, 1, 0.95, 1],
    filter: [
      "brightness(1) blur(0px)",
      "brightness(0.95) blur(0.5px)",
      "brightness(0.9) blur(1px)",
      "brightness(0.95) blur(0.5px)",
      "brightness(1) blur(0px)",
    ],
    y: [0, 1, 2, 1, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  pouring: {
    opacity: 0.85,
    filter: "brightness(0.85) blur(2px)",
    y: [0, 3, 0],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

/**
 * Stormy weather - intensity and drama
 */
export const stormyWeatherVariants: Variants = {
  calm: {
    x: 0,
    rotate: 0,
    filter: "brightness(1) saturate(1)",
  },
  building: {
    x: [-2, 2, -2, 2, 0],
    rotate: [-1, 1, -1, 1, 0],
    filter: [
      "brightness(1) saturate(1)",
      "brightness(0.8) saturate(0.8)",
      "brightness(1.2) saturate(1.2)",
      "brightness(0.8) saturate(0.8)",
      "brightness(1) saturate(1)",
    ],
    transition: {
      duration: 3,
      ease: "easeInOut",
    },
  },
  storming: {
    x: [-5, 5, -5, 5, -3, 3, 0],
    rotate: [-3, 3, -3, 3, -2, 2, 0],
    filter: [
      "brightness(0.7)",
      "brightness(1.3)",
      "brightness(0.7)",
      "brightness(1.3)",
      "brightness(0.7)",
      "brightness(1.3)",
      "brightness(1)",
    ],
    transition: {
      duration: 0.8,
      ease: "easeInOut",
    },
  },
};

/**
 * Snowy day - quiet and gentle
 */
export const snowyDayVariants: Variants = {
  clear: {
    opacity: 1,
    filter: "brightness(1) blur(0px)",
    y: 0,
  },
  snowing: {
    opacity: [1, 0.9, 0.95, 0.9, 1],
    filter: [
      "brightness(1) blur(0px)",
      "brightness(1.05) blur(1px)",
      "brightness(1.1) blur(2px)",
      "brightness(1.05) blur(1px)",
      "brightness(1) blur(0px)",
    ],
    y: [0, 2, 4, 2, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  blizzard: {
    opacity: 0.7,
    filter: "brightness(1.2) blur(4px)",
    x: [-3, 3, -3, 3, 0],
    y: [0, 3, 6, 3, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

/**
 * Frost - crystalline and delicate
 */
export const frostVariants: Variants = {
  warm: {
    filter: "brightness(1) saturate(1) blur(0px)",
    opacity: 1,
  },
  chilling: {
    filter: [
      "brightness(1) saturate(1) blur(0px)",
      "brightness(1.05) saturate(0.8) blur(1px)",
      "brightness(1.1) saturate(0.6) blur(2px)",
    ],
    opacity: [1, 0.95, 0.9],
    transition: {
      duration: 2,
      ease: "easeOut",
    },
  },
  frozen: {
    filter: "brightness(1.15) saturate(0.5) blur(3px)",
    opacity: 0.85,
    scale: 0.98,
  },
};

// ============================================================================
// AGRICULTURAL EVENT VARIANTS
// ============================================================================

/**
 * Planting event - new beginnings
 */
export const plantingEventVariants: Variants = {
  preparing: {
    scale: 0.9,
    y: 10,
    opacity: 0.8,
  },
  planting: {
    scale: [0.9, 1, 0.95, 1],
    y: [10, -5, 5, 0],
    opacity: [0.8, 1, 1, 1],
    rotate: [0, -10, 10, 0],
    transition: {
      duration: 1,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
  planted: {
    scale: 1,
    y: 0,
    opacity: 1,
    filter: "brightness(1.1) saturate(1.1)",
  },
};

/**
 * Watering event - nourishment
 */
export const wateringEventVariants: Variants = {
  dry: {
    opacity: 0.7,
    filter: "brightness(0.9) saturate(0.8)",
  },
  watering: {
    opacity: [0.7, 0.85, 1, 0.95, 1],
    filter: [
      "brightness(0.9) saturate(0.8)",
      "brightness(1) saturate(1)",
      "brightness(1.1) saturate(1.2)",
      "brightness(1.05) saturate(1.1)",
      "brightness(1) saturate(1)",
    ],
    scale: [1, 1.02, 1.05, 1.02, 1],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
    },
  },
  hydrated: {
    opacity: 1,
    filter: "brightness(1.1) saturate(1.2)",
    scale: 1.02,
  },
};

/**
 * Market day event - commerce and exchange
 */
export const marketDayVariants: Variants = {
  closed: {
    scale: 0.95,
    opacity: 0.7,
    filter: "brightness(0.9) saturate(0.8)",
  },
  opening: {
    scale: [0.95, 1.05, 1],
    opacity: [0.7, 1, 1],
    filter: [
      "brightness(0.9) saturate(0.8)",
      "brightness(1.2) saturate(1.3)",
      "brightness(1.1) saturate(1.1)",
    ],
    rotate: [0, -5, 5, 0],
    transition: {
      duration: 1,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
  active: {
    scale: [1, 1.02, 1],
    filter: "brightness(1.15) saturate(1.2)",
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// ============================================================================
// PRICE CHANGE ANIMATIONS
// ============================================================================

/**
 * Price increase - positive change
 */
export const priceIncreaseVariants: Variants = {
  stable: {
    y: 0,
    scale: 1,
    color: "inherit",
  },
  increasing: {
    y: [0, -10, -5, 0],
    scale: [1, 1.15, 1.1, 1.05],
    color: "rgb(34, 197, 94)", // Green
    filter: "brightness(1.2)",
    transition: {
      duration: 0.8,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
  increased: {
    scale: 1.05,
    color: "rgb(34, 197, 94)",
    filter: "brightness(1.1)",
  },
};

/**
 * Price decrease - negative change
 */
export const priceDecreaseVariants: Variants = {
  stable: {
    y: 0,
    scale: 1,
    color: "inherit",
  },
  decreasing: {
    y: [0, 10, 5, 0],
    scale: [1, 0.85, 0.9, 0.95],
    color: "rgb(239, 68, 68)", // Red
    filter: "brightness(0.9)",
    transition: {
      duration: 0.8,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
  decreased: {
    scale: 0.95,
    color: "rgb(239, 68, 68)",
    filter: "brightness(0.9)",
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get seasonal transition variants based on current and target season
 */
export function getSeasonalTransition(from: Season, to: Season): Variants {
  const transitions: Record<string, Variants> = {
    "WINTER-SPRING": springAwakeningVariants,
    "SPRING-SUMMER": summerBrillianceVariants,
    "SUMMER-FALL": fallHarvestVariants,
    "FALL-WINTER": winterRestVariants,
  };

  const key = `${from}-${to}`;
  return transitions[key] || springAwakeningVariants;
}

/**
 * Get growth stage variants
 */
export function getGrowthVariants(stage: GrowthStage): Variants {
  switch (stage) {
    case "SEED":
      return seedPlantingVariants;
    case "SPROUT":
      return sproutingVariants;
    case "GROWING":
      return growingVariants;
    case "MATURE":
      return growingVariants;
    case "HARVEST":
      return harvestCelebrationVariants;
    default:
      return seedPlantingVariants;
  }
}

/**
 * Get weather animation variants
 */
export function getWeatherVariants(weather: WeatherType): Variants {
  switch (weather) {
    case "SUNNY":
      return sunnyDayVariants;
    case "RAINY":
      return rainyDayVariants;
    case "STORMY":
      return stormyWeatherVariants;
    case "SNOWY":
      return snowyDayVariants;
    case "FROST":
      return frostVariants;
    case "CLOUDY":
      return rainyDayVariants; // Similar to drizzle
    default:
      return sunnyDayVariants;
  }
}

/**
 * Get agricultural event variants
 */
export function getAgriculturalEventVariants(
  event: AgriculturalEvent,
): Variants {
  switch (event) {
    case "PLANTING":
      return plantingEventVariants;
    case "WATERING":
      return wateringEventVariants;
    case "MARKET_DAY":
      return marketDayVariants;
    case "HARVESTING":
      return harvestCelebrationVariants;
    case "SEASON_CHANGE":
      return springAwakeningVariants; // Generic seasonal change
    default:
      return plantingEventVariants;
  }
}

/**
 * Get seasonal colors
 */
export function getSeasonalColors(season: Season) {
  return seasonalColors[season];
}

/**
 * Create custom seasonal animation with intensity
 */
export function createSeasonalAnimation(
  season: Season,
  config: SeasonalConfig = {},
): Variants {
  const { intensity = "moderate", duration = 1.2 } = config;

  const intensityMultipliers = {
    subtle: 0.5,
    moderate: 1,
    dramatic: 1.5,
  };

  const multiplier = intensityMultipliers[intensity];
  const colors = seasonalColors[season];

  return {
    initial: {
      scale: 1,
      filter: "brightness(1) saturate(1)",
      boxShadow: `0 0 0 ${colors.glow}`,
    },
    animate: {
      scale: [1, 1 + 0.05 * multiplier, 1],
      filter: [
        "brightness(1) saturate(1)",
        `brightness(${1 + 0.2 * multiplier}) saturate(${1 + 0.3 * multiplier})`,
        "brightness(1.1) saturate(1.1)",
      ],
      boxShadow: [
        `0 0 0 ${colors.glow}`,
        `0 0 ${20 * multiplier}px ${colors.glow}`,
        `0 0 ${10 * multiplier}px ${colors.glow}`,
      ],
      transition: {
        duration,
        ease: "easeInOut",
      },
    },
  };
}

// ============================================================================
// EXPORT SUMMARY
// ============================================================================

/**
 * Complete seasonal animation system
 */
export const seasonalAnimations = {
  // Seasonal transitions
  spring: springAwakeningVariants,
  summer: summerBrillianceVariants,
  fall: fallHarvestVariants,
  winter: winterRestVariants,

  // Growth cycle
  seed: seedPlantingVariants,
  sprout: sproutingVariants,
  growing: growingVariants,
  harvest: harvestCelebrationVariants,

  // Weather
  sunny: sunnyDayVariants,
  rainy: rainyDayVariants,
  stormy: stormyWeatherVariants,
  snowy: snowyDayVariants,
  frost: frostVariants,

  // Agricultural events
  planting: plantingEventVariants,
  watering: wateringEventVariants,
  market: marketDayVariants,

  // Price changes
  priceUp: priceIncreaseVariants,
  priceDown: priceDecreaseVariants,

  // Transitions
  transitions: {
    growth: growthTransition,
    seasonal: seasonalTransition,
    breeze: breezeTransition,
    celebration: celebrationTransition,
  },

  // Colors
  colors: seasonalColors,

  // Helpers
  helpers: {
    getSeasonalTransition,
    getGrowthVariants,
    getWeatherVariants,
    getAgriculturalEventVariants,
    getSeasonalColors,
    createSeasonalAnimation,
  },
};

export default seasonalAnimations;
