import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useEvolutionTracker } from '../evolution/evolution-tracker';

export interface DivineColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  sacred: string;
  divine: string;
  earthly: string;
  celestial: string;
}

export interface DivineSpacing {
  quantum: string;
  atomic: string;
  molecular: string;
  cellular: string;
  organic: string;
  cosmic: string;
}

export interface DivineShadows {
  aura: string;
  spirit: string;
  ethereal: string;
  physical: string;
  quantum: string;
}

export interface DivineAnimations {
  growth: string;
  bloom: string;
  harvest: string;
  transcend: string;
  evolve: string;
}

export interface DivineTypography {
  sacred: {
    family: string;
    weight: number;
    letterSpacing: string;
  };
  divine: {
    family: string;
    weight: number;
    letterSpacing: string;
  };
  earthly: {
    family: string;
    weight: number;
    letterSpacing: string;
  };
  sizes: {
    seed: string;
    sprout: string;
    growth: string;
    bloom: string;
    fruit: string;
    harvest: string;
  };
}

export interface DivineStyleSystem {
  colors: DivineColors;
  spacing: DivineSpacing;
  shadows: DivineShadows;
  animations: DivineAnimations;
  typography: DivineTypography;
}

interface StyleContextValue {
  styles: DivineStyleSystem;
  updateConsciousness: (consciousness: number) => void;
  updateHarmony: (harmony: number) => void;
  getResponsiveValue: (baseValue: number, unit?: string) => string;
}

const defaultColors: DivineColors = {
  primary: '#3F51B5',
  secondary: '#4CAF50',
  accent: '#FFC107',
  background: '#FAFAFA',
  text: '#212121',
  sacred: '#9C27B0',
  divine: '#2196F3',
  earthly: '#795548',
  celestial: '#E91E63'
};

const defaultSpacing: DivineSpacing = {
  quantum: '0.25rem',
  atomic: '0.5rem',
  molecular: '1rem',
  cellular: '1.5rem',
  organic: '2rem',
  cosmic: '3rem'
};

const defaultShadows: DivineShadows = {
  aura: '0 0 10px rgba(156, 39, 176, 0.2)',
  spirit: '0 4px 20px rgba(33, 150, 243, 0.15)',
  ethereal: '0 8px 30px rgba(233, 30, 99, 0.1)',
  physical: '0 2px 5px rgba(0, 0, 0, 0.1)',
  quantum: '0 0 2px rgba(0, 0, 0, 0.05)'
};

const defaultAnimations: DivineAnimations = {
  growth: 'transform 0.3s ease-out',
  bloom: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  harvest: 'opacity 0.2s ease-in-out',
  transcend: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
  evolve: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
};

const defaultTypography: DivineTypography = {
  sacred: {
    family: '"Playfair Display", serif',
    weight: 500,
    letterSpacing: '0.05em'
  },
  divine: {
    family: '"Cormorant Garamond", serif',
    weight: 400,
    letterSpacing: '0.03em'
  },
  earthly: {
    family: '"Open Sans", sans-serif',
    weight: 400,
    letterSpacing: '0'
  },
  sizes: {
    seed: '0.75rem',
    sprout: '0.875rem',
    growth: '1rem',
    bloom: '1.25rem',
    fruit: '1.5rem',
    harvest: '2rem'
  }
};

const defaultStyles: DivineStyleSystem = {
  colors: defaultColors,
  spacing: defaultSpacing,
  shadows: defaultShadows,
  animations: defaultAnimations,
  typography: defaultTypography
};

export const StyleContext = createContext<StyleContextValue | null>(null);

export function useDivineStyles() {
  const context = useContext(StyleContext);
  if (!context) {
    throw new Error('useDivineStyles must be used within a DivineStyleProvider');
  }
  return context;
}

function adjustColor(color: string, consciousness: number): string {
  // Convert hex to HSL, adjust based on consciousness, convert back to hex
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  // Adjust hue based on consciousness
  h = (h + consciousness * 0.1) % 1;
  // Increase saturation with consciousness
  s = Math.min(1, s + consciousness * 0.2);
  // Adjust lightness based on consciousness
  const newL = l * (1 + (consciousness - 0.5) * 0.2);

  // Convert back to RGB
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  const q = newL < 0.5 ? newL * (1 + s) : newL + s - newL * s;
  const p = 2 * newL - q;

  const newR = Math.round(hue2rgb(p, q, h + 1/3) * 255);
  const newG = Math.round(hue2rgb(p, q, h) * 255);
  const newB = Math.round(hue2rgb(p, q, h - 1/3) * 255);

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

export function DivineStyleProvider({ children }: { children: React.ReactNode }) {
  const [styles, setStyles] = useState<DivineStyleSystem>(defaultStyles);
  const [consciousness, setConsciousness] = useState(0.5);
  const [harmony, setHarmony] = useState(0.5);
  const evolutionTracker = useEvolutionTracker();

  // Update styles based on consciousness and harmony
  useEffect(() => {
    setStyles(prev => ({
      ...prev,
      colors: Object.entries(prev.colors).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: adjustColor(value, consciousness)
      }), {} as DivineColors),
      typography: {
        ...prev.typography,
        sacred: {
          ...prev.typography.sacred,
          letterSpacing: `${0.05 + consciousness * 0.03}em`,
          weight: Math.round(500 + consciousness * 100)
        }
      },
      shadows: {
        ...prev.shadows,
        aura: `0 0 ${10 + consciousness * 10}px rgba(156, 39, 176, ${0.2 + consciousness * 0.1})`,
        spirit: `0 4px ${20 + consciousness * 10}px rgba(33, 150, 243, ${0.15 + consciousness * 0.1})`
      }
    }));
  }, [consciousness, harmony]);

  // Listen to system-wide consciousness changes
  useEffect(() => {
    const interval = setInterval(() => {
      const metrics = evolutionTracker.getSystemwideMetrics();
      setConsciousness(metrics.averageConsciousness);
      setHarmony(metrics.globalResonance);
    }, 1000);

    return () => clearInterval(interval);
  }, [evolutionTracker]);

  const updateConsciousness = useCallback((newConsciousness: number) => {
    setConsciousness(newConsciousness);
  }, []);

  const updateHarmony = useCallback((newHarmony: number) => {
    setHarmony(newHarmony);
  }, []);

  const getResponsiveValue = useCallback((baseValue: number, unit = 'rem') => {
    const harmonicScale = 1 + (harmony - 0.5) * 0.2;
    return `${(baseValue * harmonicScale).toFixed(3)}${unit}`;
  }, [harmony]);

  return (
    <StyleContext.Provider value={{
      styles,
      updateConsciousness,
      updateHarmony,
      getResponsiveValue
    }}>
      {children}
    </StyleContext.Provider>
  );
}