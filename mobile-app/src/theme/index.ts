// 🌾 Farmers Market Mobile App - Divine Agricultural Theme System
// Complete theme configuration with agricultural consciousness

import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ========================================
// 🎨 COLOR PALETTE - Agricultural Consciousness
// ========================================

export const colors = {
  // Primary - Growth & Vitality
  primary: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981', // Main primary
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },

  // Secondary - Earth & Harvest
  secondary: {
    50: '#fef3c7',
    100: '#fde68a',
    200: '#fcd34d',
    300: '#fbbf24',
    400: '#f59e0b', // Main secondary
    500: '#d97706',
    600: '#b45309',
    700: '#92400e',
    800: '#78350f',
    900: '#451a03',
  },

  // Accent - Sky & Water
  accent: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main accent
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Semantic Colors
  success: {
    light: '#d1fae5',
    main: '#10b981',
    dark: '#065f46',
  },
  warning: {
    light: '#fef3c7',
    main: '#f59e0b',
    dark: '#92400e',
  },
  error: {
    light: '#fee2e2',
    main: '#ef4444',
    dark: '#991b1b',
  },
  info: {
    light: '#dbeafe',
    main: '#3b82f6',
    dark: '#1e40af',
  },

  // Neutral - Soil & Stone
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Background
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6',
    dark: '#111827',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Surface
  surface: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    elevated: '#ffffff',
    dark: '#1f2937',
  },

  // Text
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
    disabled: '#d1d5db',
    inverse: '#ffffff',
    link: '#3b82f6',
  },

  // Border
  border: {
    light: '#f3f4f6',
    main: '#e5e7eb',
    dark: '#d1d5db',
    focus: '#10b981',
  },

  // Seasonal Colors - Biodynamic Consciousness
  seasonal: {
    spring: {
      primary: '#10b981',
      secondary: '#34d399',
      background: '#ecfdf5',
    },
    summer: {
      primary: '#f59e0b',
      secondary: '#fbbf24',
      background: '#fffbeb',
    },
    fall: {
      primary: '#ea580c',
      secondary: '#fb923c',
      background: '#fff7ed',
    },
    winter: {
      primary: '#3b82f6',
      secondary: '#60a5fa',
      background: '#eff6ff',
    },
  },

  // Special Agricultural Colors
  agricultural: {
    organic: '#10b981',
    conventional: '#6b7280',
    certified: '#3b82f6',
    local: '#f59e0b',
    seasonal: '#10b981',
    fresh: '#34d399',
  },
};

// ========================================
// 📝 TYPOGRAPHY - Divine Text Hierarchy
// ========================================

export const typography = {
  // Font Families
  fontFamily: {
    regular: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
    medium: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
    }),
    semibold: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
    }),
    bold: Platform.select({
      ios: 'System',
      android: 'Roboto-Bold',
    }),
    mono: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
    }),
  },

  // Font Weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  // Line Heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
  },

  // Text Styles - Predefined combinations
  styles: {
    h1: {
      fontSize: 36,
      lineHeight: 40,
      fontWeight: '700' as const,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 30,
      lineHeight: 36,
      fontWeight: '700' as const,
      letterSpacing: -0.25,
    },
    h3: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '600' as const,
      letterSpacing: 0,
    },
    h4: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: '600' as const,
      letterSpacing: 0,
    },
    h5: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '600' as const,
      letterSpacing: 0,
    },
    h6: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600' as const,
      letterSpacing: 0,
    },
    body1: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
    body2: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400' as const,
      letterSpacing: 0.25,
    },
    button: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600' as const,
      letterSpacing: 0.5,
      textTransform: 'uppercase' as const,
    },
    label: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500' as const,
      letterSpacing: 0,
    },
    overline: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '600' as const,
      letterSpacing: 1,
      textTransform: 'uppercase' as const,
    },
  },
};

// ========================================
// 📏 SPACING - Quantum Grid System
// ========================================

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
  40: 160,
  48: 192,
};

// ========================================
// 🔲 BORDER RADIUS - Organic Curves
// ========================================

export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

// ========================================
// 🎭 SHADOWS - Depth Elevation
// ========================================

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
};

// ========================================
// ⏱️ ANIMATION - Temporal Coherence
// ========================================

export const animation = {
  duration: {
    fastest: 100,
    faster: 150,
    fast: 200,
    normal: 300,
    slow: 400,
    slower: 500,
    slowest: 600,
  },
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'spring',
  },
};

// ========================================
// 📱 BREAKPOINTS - Responsive Design
// ========================================

export const breakpoints = {
  xs: 320,
  sm: 375,
  md: 425,
  lg: 768,
  xl: 1024,
};

// ========================================
// 📐 LAYOUT - Screen Dimensions
// ========================================

export const layout = {
  screen: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  window: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  isSmallDevice: SCREEN_WIDTH < breakpoints.sm,
  isMediumDevice: SCREEN_WIDTH >= breakpoints.sm && SCREEN_WIDTH < breakpoints.lg,
  isLargeDevice: SCREEN_WIDTH >= breakpoints.lg,
};

// ========================================
// 🎯 Z-INDEX - Layering System
// ========================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 1080,
  max: 9999,
};

// ========================================
// 🌾 AGRICULTURAL DESIGN TOKENS
// ========================================

export const agricultural = {
  // Seasonal indicators
  seasonalBadge: {
    spring: {
      backgroundColor: colors.seasonal.spring.background,
      color: colors.seasonal.spring.primary,
      icon: '🌱',
    },
    summer: {
      backgroundColor: colors.seasonal.summer.background,
      color: colors.seasonal.summer.primary,
      icon: '☀️',
    },
    fall: {
      backgroundColor: colors.seasonal.fall.background,
      color: colors.seasonal.fall.primary,
      icon: '🍂',
    },
    winter: {
      backgroundColor: colors.seasonal.winter.background,
      color: colors.seasonal.winter.primary,
      icon: '❄️',
    },
  },

  // Certification badges
  certificationBadge: {
    organic: {
      backgroundColor: colors.agricultural.organic,
      color: '#ffffff',
      icon: '✓',
      label: 'Organic',
    },
    local: {
      backgroundColor: colors.agricultural.local,
      color: '#ffffff',
      icon: '📍',
      label: 'Local',
    },
    certified: {
      backgroundColor: colors.agricultural.certified,
      color: '#ffffff',
      icon: '⭐',
      label: 'Certified',
    },
  },

  // Freshness indicators
  freshnessLevel: {
    high: {
      color: colors.agricultural.fresh,
      label: 'Freshly Harvested',
      days: 1,
    },
    medium: {
      color: colors.secondary[400],
      label: 'Fresh',
      days: 3,
    },
    low: {
      color: colors.neutral[500],
      label: 'Available',
      days: 7,
    },
  },
};

// ========================================
// 🎨 THEME OBJECT - Complete Export
// ========================================

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  breakpoints,
  layout,
  zIndex,
  agricultural,
};

// Type for theme
export type Theme = typeof theme;

// ========================================
// 🌓 DARK MODE SUPPORT (Future Enhancement)
// ========================================

export const darkTheme: Theme = {
  ...theme,
  colors: {
    ...theme.colors,
    background: {
      primary: '#111827',
      secondary: '#1f2937',
      tertiary: '#374151',
      dark: '#030712',
      overlay: 'rgba(0, 0, 0, 0.75)',
    },
    surface: {
      primary: '#1f2937',
      secondary: '#374151',
      elevated: '#374151',
      dark: '#030712',
    },
    text: {
      primary: '#f9fafb',
      secondary: '#d1d5db',
      tertiary: '#9ca3af',
      disabled: '#6b7280',
      inverse: '#111827',
      link: '#60a5fa',
    },
    border: {
      light: '#374151',
      main: '#4b5563',
      dark: '#6b7280',
      focus: '#10b981',
    },
  },
};

// ========================================
// 🛠️ UTILITY FUNCTIONS
// ========================================

/**
 * Get seasonal color based on current season
 */
export function getSeasonalColor(season: 'spring' | 'summer' | 'fall' | 'winter'): string {
  return colors.seasonal[season].primary;
}

/**
 * Get spacing value by key
 */
export function getSpacing(...keys: (keyof typeof spacing)[]): number {
  return keys.reduce((acc, key) => acc + spacing[key], 0);
}

/**
 * Get responsive value based on screen size
 */
export function getResponsiveValue<T>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
}): T | undefined {
  if (layout.isLargeDevice && values.xl) return values.xl;
  if (layout.isLargeDevice && values.lg) return values.lg;
  if (layout.isMediumDevice && values.md) return values.md;
  if (layout.isSmallDevice && values.sm) return values.sm;
  return values.xs;
}

/**
 * Create shadow style for elevation
 */
export function getShadow(level: keyof typeof shadows) {
  return shadows[level];
}

/**
 * Blend two colors (simple alpha blending)
 */
export function blendColors(color1: string, color2: string, alpha: number): string {
  // Simplified - in production, use proper color manipulation library
  return color1; // Placeholder
}

export default theme;
