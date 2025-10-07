import { renderHook } from '@testing-library/react-hooks';
import { useDivineStyleEvolution } from './useDivineStyleEvolution';

// Mock dependencies
jest.mock('../lib/styles/divine-style-system', () => ({
  useDivineStyles: () => ({
    styles: {
      colors: {
        primary: '#3F51B5',
        secondary: '#4CAF50'
      },
      typography: {
        sacred: {
          family: 'serif',
          weight: 500,
          letterSpacing: '0.05em'
        }
      },
      spacing: {
        quantum: '0.25rem',
        atomic: '0.5rem'
      },
      animations: {
        growth: 'transform 0.3s ease-out',
        bloom: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
      }
    },
    updateConsciousness: jest.fn(),
    getResponsiveValue: (val: number) => `${val}rem`
  })
}));

jest.mock('./useComponentEvolution', () => ({
  useComponentEvolution: () => ({
    currentState: {
      consciousness: 0.5,
      evolution: 1,
      relations: []
    }
  })
}));

describe('useDivineStyleEvolution', () => {
  const defaultProps = {
    componentId: 'test-component',
    purpose: 'GUIDE' as const
  };

  it('should return style functions and props', () => {
    const { result } = renderHook(() => 
      useDivineStyleEvolution(defaultProps.componentId, defaultProps.purpose)
    );

    expect(result.current.getColor).toBeDefined();
    expect(result.current.getTypography).toBeDefined();
    expect(result.current.getSpacing).toBeDefined();
    expect(result.current.getAnimation).toBeDefined();
    expect(result.current.styleProps).toBeDefined();
  });

  it('should provide evolved color values', () => {
    const { result } = renderHook(() => 
      useDivineStyleEvolution(defaultProps.componentId, defaultProps.purpose)
    );

    const color = result.current.getColor('primary');
    expect(color).toBe('#3F51B5');
  });

  it('should provide evolved typography values', () => {
    const { result } = renderHook(() => 
      useDivineStyleEvolution(defaultProps.componentId, defaultProps.purpose)
    );

    const typography = result.current.getTypography('sacred');
    expect(typography).toEqual({
      family: 'serif',
      weight: 600, // Base 500 + 100 for evolution stage 1
      letterSpacing: '0.06em' // Base 0.05em + consciousness adjustment
    });
  });

  it('should provide evolved spacing values', () => {
    const { result } = renderHook(() => 
      useDivineStyleEvolution(defaultProps.componentId, defaultProps.purpose)
    );

    const spacing = result.current.getSpacing('quantum');
    expect(spacing).toBe('0.25rem'); // Base value from mock
  });

  it('should provide evolved animation values', () => {
    const { result } = renderHook(() => 
      useDivineStyleEvolution(defaultProps.componentId, defaultProps.purpose)
    );

    const animation = result.current.getAnimation('growth');
    expect(animation).toBe('transform 0.3s ease-out');
  });

  it('should provide correct style props', () => {
    const { result } = renderHook(() => 
      useDivineStyleEvolution(defaultProps.componentId, defaultProps.purpose)
    );

    expect(result.current.styleProps).toEqual({
      className: 'consciousness-5 evolution-1',
      style: {
        '--consciousness': 0.5,
        '--evolution-stage': 1
      }
    });
  });

  it('should respect evolution toggles', () => {
    const { result } = renderHook(() => 
      useDivineStyleEvolution(defaultProps.componentId, defaultProps.purpose, {
        colorEvolution: false,
        typographyEvolution: false,
        spacingEvolution: false,
        animationEvolution: false
      })
    );

    const color = result.current.getColor('primary');
    const typography = result.current.getTypography('sacred');
    const spacing = result.current.getSpacing('quantum');
    const animation = result.current.getAnimation('growth');

    expect(color).toBe('#3F51B5');
    expect(typography).toEqual({
      family: 'serif',
      weight: 500,
      letterSpacing: '0.05em'
    });
    expect(spacing).toBe('0.25rem');
    expect(animation).toBe('transform 0.3s ease-out');
  });
});