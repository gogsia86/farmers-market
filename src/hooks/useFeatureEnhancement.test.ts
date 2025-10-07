/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { useFeatureEnhancement } from './useFeatureEnhancement';
import { ProgressiveEnhancementProvider } from '../components/adaptation/progressive-enhancement';
import { AdaptationProvider } from '../components/adaptation/context-adaptation-engine';
import React, { ReactNode } from 'react';

const MockBasicComponent = () => React.createElement('div', null, 'Basic');
const MockEnhancedComponent = () => React.createElement('div', null, 'Enhanced');
const MockFallbackComponent = () => React.createElement('div', null, 'Fallback');

describe('useFeatureEnhancement', () => {
  const mockFeatures = [
    {
      id: 'feature1',
      name: 'Test Feature 1',
      requiredConsciousnessLevel: 5,
      deviceRequirements: {
        memory: 4,
        cpu: 2,
        network: 'medium' as const
      },
      enhancementComponent: MockEnhancedComponent,
      fallbackComponent: MockFallbackComponent
    }
  ];

  const Wrapper = ({ children }: { children: ReactNode }) => (
    React.createElement(AdaptationProvider, null,
      React.createElement(ProgressiveEnhancementProvider, null, children)
    )
  );

  beforeEach(() => {
    Object.defineProperty(window, 'navigator', {
      value: {
        deviceMemory: 8,
        hardwareConcurrency: 4,
        connection: {
          effectiveType: '4g'
        },
        onLine: true
      },
      writable: true
    });
  });

  it('activates features when requirements are met', () => {
    const { result } = renderHook(
      () => useFeatureEnhancement(mockFeatures, 'test-component'),
      { wrapper: Wrapper }
    );

    expect(result.current.activeFeatures).toHaveLength(1);
    expect(result.current.getFeatureComponent('feature1')).toBe(MockEnhancedComponent);
  });

  it('provides fallback when requirements are not met', () => {
    Object.defineProperty(window, 'navigator', {
      value: {
        deviceMemory: 2,
        hardwareConcurrency: 1,
        connection: {
          effectiveType: '3g'
        },
        onLine: true
      },
      writable: true
    });

    const { result } = renderHook(
      () => useFeatureEnhancement(mockFeatures, 'test-component'),
      { wrapper: Wrapper }
    );

    expect(result.current.activeFeatures).toHaveLength(0);
    expect(result.current.getFallbackComponent('feature1')).toBe(MockFallbackComponent);
  });

  it('updates active features when capabilities change', () => {
    const { result, rerender } = renderHook(
      () => useFeatureEnhancement(mockFeatures, 'test-component'),
      { wrapper: Wrapper }
    );

    expect(result.current.activeFeatures).toHaveLength(1);

    // Simulate device capability change
    Object.defineProperty(window, 'navigator', {
      value: {
        deviceMemory: 2,
        hardwareConcurrency: 1,
        connection: {
          effectiveType: '3g'
        },
        onLine: true
      },
      writable: true
    });

    rerender();

    expect(result.current.activeFeatures).toHaveLength(0);
  });
});