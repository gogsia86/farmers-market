import { createStyles } from '@emotion/react';

export const environmentalStyles = createStyles({
  environmentalAdapter: {
    position: 'relative',
    transition: 'all 0.3s quantum-ease',
    willChange: 'opacity, transform',
    opacity: 'var(--intensity)',
    transform: 'scale(var(--resonance))',
  },

  cyclePhaseGrowth: {
    animation: 'growthPulse 3s infinite',
  },

  cyclePhaseHarvest: {
    animation: 'harvestGlow 2s infinite',
  },

  cyclePhaseRest: {
    animation: 'restTransition 4s ease-in-out infinite',
  },

  cyclePhasePreparation: {
    animation: 'prepareShimmer 2.5s linear infinite',
  },

  '@keyframes growthPulse': {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.02)' },
    '100%': { transform: 'scale(1)' },
  },

  '@keyframes harvestGlow': {
    '0%': { filter: 'brightness(1)' },
    '50%': { filter: 'brightness(1.1)' },
    '100%': { filter: 'brightness(1)' },
  },

  '@keyframes restTransition': {
    '0%': { opacity: 1 },
    '50%': { opacity: 0.9 },
    '100%': { opacity: 1 },
  },

  '@keyframes prepareShimmer': {
    '0%': { backgroundPosition: '-200% center' },
    '100%': { backgroundPosition: '200% center' },
  },

  layered: {
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)',
      pointerEvents: 'none',
    },
  },
});