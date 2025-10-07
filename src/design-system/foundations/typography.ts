export const typography = {
  // Font Families
  fontFamily: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    heading: 'Poppins, Inter, sans-serif',
    mono: 'Fira Code, Courier New, monospace',
  },
  
  // Font Sizes with Fluid Typography
  fontSize: {
    xs: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
    sm: 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
    base: 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)',
    lg: 'clamp(1.125rem, 1rem + 0.625vw, 1.5rem)',
    xl: 'clamp(1.25rem, 1.125rem + 0.625vw, 1.75rem)',
    '2xl': 'clamp(1.5rem, 1.25rem + 1.25vw, 2.25rem)',
    '3xl': 'clamp(1.875rem, 1.5rem + 1.875vw, 3rem)',
    '4xl': 'clamp(2.25rem, 1.75rem + 2.5vw, 4rem)',
    '5xl': 'clamp(3rem, 2.25rem + 3.75vw, 5rem)',
  },
  
  // Font Weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
} as const;

export type TypographyToken = keyof typeof typography;