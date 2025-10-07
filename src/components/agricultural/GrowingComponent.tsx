import React from 'react';
import styles from './GrowingComponent.module.css';
import { useAgriculturalPattern, GrowthStage } from '../../lib/patterns/agricultural-patterns';

const GROWTH_STAGE_SEQUENCE: GrowthStage[] = ['SEED', 'SPROUT', 'GROWTH', 'BLOOM', 'FRUIT', 'HARVEST'];

interface GrowingComponentProps {
  id: string;
  children: React.ReactNode;
}

export function GrowingComponent({ id, children }: GrowingComponentProps) {
  const {
    pattern,
    advanceGrowthStage,
    handleInteraction,
    startAnimation,
    stopAnimation
  } = useAgriculturalPattern(id, {
    initialGrowthStage: 'SEED',
    seasonalAlignment: true,
    lunarAlignment: true,
    elementalBalance: true
  });

  React.useEffect(() => {
    startAnimation();
    return () => stopAnimation();
  }, [startAnimation, stopAnimation]);

  return (
    <div 
      className={`${styles['growing-component']} ${styles[pattern.growthStage.toLowerCase()]}`}
      data-season={pattern.seasonalPhase.toLowerCase()}
      data-lunar={pattern.lunarPhase.toLowerCase()}
      data-element={pattern.elementalAspect.toLowerCase()}
      onMouseEnter={() => handleInteraction('HOVER')}
      onFocus={() => handleInteraction('FOCUS')}
      onClick={() => {
        handleInteraction('TOUCH');
        advanceGrowthStage();
      }}
    >
      {children}
    </div>
  );
}