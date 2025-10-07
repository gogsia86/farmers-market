// Styles for Context-sensitive Rendering Components
export const createDimensionalViewStyles = (
  opacity: number,
  transform: string
): React.CSSProperties => ({
  opacity,
  transform,
  transition: 'all 0.3s quantum-ease'
});

export const createConsciousnessRendererStyles = (
  filter: string,
  transform: string
): React.CSSProperties => ({
  filter,
  transform,
  transition: 'all 0.5s consciousness-ease'
});

export const createQuantumWrapperStyles = (
  filter: string,
  transform: string
): React.CSSProperties => ({
  position: 'relative',
  filter,
  transform,
  transition: 'all 0.2s quantum-ease'
});

// Advanced CSS variables for quantum effects
export const quantumStyles = {
  '--quantum-transition-base': '0.2s',
  '--quantum-ease': 'cubic-bezier(0.4, 0, 0.2, 1)',
  '--consciousness-ease': 'cubic-bezier(0.6, 0.04, 0.98, 0.335)',
  '--dimensional-transition': '0.3s',
  '--quantum-blur-base': '5px',
  '--quantum-scale-base': '1',
  '--quantum-rotate-base': '360deg'
} as React.CSSProperties;

// Global styles for quantum animations
export const globalQuantumStyles = `
  @keyframes quantum-pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.8;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes consciousness-wave {
    0% {
      filter: hue-rotate(0deg) brightness(100%);
    }
    50% {
      filter: hue-rotate(180deg) brightness(150%);
    }
    100% {
      filter: hue-rotate(360deg) brightness(100%);
    }
  }

  @keyframes dimensional-shift {
    0% {
      transform: translateZ(0) rotate(0deg);
    }
    50% {
      transform: translateZ(100px) rotate(180deg);
    }
    100% {
      transform: translateZ(0) rotate(360deg);
    }
  }
`;