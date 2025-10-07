export const colors = {
  // Primary Cosmic Colors
  cosmic: {
    primary: '#667eea',
    primaryDark: '#5a6fd8',
    primaryLight: '#7c8fee',
    secondary: '#764ba2',
    accent: '#f093fb',
  },
  
  // Galactic Neutrals
  neutral: {
    stardustWhite: '#ffffff',
    moonlight: '#f8fafc',
    twilight: '#e2e8f0',
    midnight: '#1e293b',
    voidBlack: '#0f172a',
  },
  
  // Celestial Accents
  accent: {
    sunsetOrange: '#f59e0b',
    nebulaPink: '#ec4899',
    quantumBlue: '#06b6d4',
    starlightYellow: '#fbbf24',
    auroraGreen: '#10b981',
  },
  
  // Gradients
  gradients: {
    cosmic: 'linear-gradient(135deg, var(--cosmic-primary) 0%, var(--cosmic-secondary) 100%)',
    sunset: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    ocean: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    forest: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    galaxy: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  },
} as const;

export type ColorToken = keyof typeof colors;