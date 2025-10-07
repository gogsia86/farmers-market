import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GrowingComponent } from './GrowingComponent';

// Mock the agricultural pattern hook
jest.mock('../../lib/patterns/agricultural-patterns', () => ({
  useAgriculturalPattern: () => ({
    pattern: {
      growthStage: 'SEED',
      seasonalPhase: 'SPRING',
      lunarPhase: 'NEW',
      elementalAspect: 'EARTH',
      consciousness: 0.5
    },
    advanceGrowthStage: jest.fn(),
    handleInteraction: jest.fn(),
    startAnimation: jest.fn(),
    stopAnimation: jest.fn()
  })
}));

describe('GrowingComponent', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <GrowingComponent id="test">
        Test Content
      </GrowingComponent>
    );

    expect(getByText('Test Content')).toBeInTheDocument();
  });

  it('applies correct class names based on growth stage', () => {
    const { container } = render(
      <GrowingComponent id="test">
        Test Content
      </GrowingComponent>
    );

    const component = container.firstChild as HTMLElement;
    expect(component).toHaveClass('growing-component');
    expect(component).toHaveClass('seed');
  });

  it('applies correct data attributes', () => {
    const { container } = render(
      <GrowingComponent id="test">
        Test Content
      </GrowingComponent>
    );

    const component = container.firstChild as HTMLElement;
    expect(component).toHaveAttribute('data-season', 'spring');
    expect(component).toHaveAttribute('data-lunar', 'new');
    expect(component).toHaveAttribute('data-element', 'earth');
  });

  it('handles mouse interactions', () => {
    const { container } = render(
      <GrowingComponent id="test">
        Test Content
      </GrowingComponent>
    );

    const component = container.firstChild as HTMLElement;
    
    fireEvent.mouseEnter(component);
    fireEvent.focus(component);
    fireEvent.click(component);

    // Since we're using a mock, we just verify the component doesn't crash
    expect(component).toBeInTheDocument();
  });
});