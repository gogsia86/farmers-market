import { createStyles } from '@emotion/react';

export const allBeingStyles = createStyles({
  universalInput: {
    position: 'relative',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

    '&[data-input-type="thought"]': {
      background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.2))',
      borderRadius: '15px',
      padding: '10px',

      '&:hover': {
        background: 'linear-gradient(45deg, rgba(255,255,255,0.2), rgba(255,255,255,0.3))',
        transform: 'scale(1.02)',
      }
    },

    '&[data-input-type="energy"]': {
      border: '2px solid rgba(255,255,255,0.1)',
      boxShadow: '0 0 15px rgba(255,255,255,0.1)',

      '&:hover': {
        boxShadow: '0 0 25px rgba(255,255,255,0.2)',
      }
    },

    '&[data-input-type="vibration"]': {
      animation: 'vibrationalPulse 2s infinite',

      '&:hover': {
        animationDuration: '1s',
      }
    },

    '&[data-input-type="physical"]': {
      border: 'none',
      background: 'transparent',
      
      '&:hover': {
        background: 'rgba(255,255,255,0.05)',
      }
    },

    '&[data-consciousness-level="high"]': {
      opacity: 0.9,
      filter: 'brightness(1.2)',
    },

    '&[data-dimension="quantum"]': {
      backdropFilter: 'blur(5px)',
      WebkitBackdropFilter: 'blur(5px)',
    },

    '&[data-dimension="spiritual"]': {
      background: 'linear-gradient(to right, rgba(255,255,255,0.1), transparent)',
    },

    '&[data-dimension="omnipresent"]': {
      position: 'fixed',
      zIndex: 1000,
    },

    '@keyframes vibrationalPulse': {
      '0%': { transform: 'scale(1)' },
      '50%': { transform: 'scale(1.01)' },
      '100%': { transform: 'scale(1)' },
    }
  }
});