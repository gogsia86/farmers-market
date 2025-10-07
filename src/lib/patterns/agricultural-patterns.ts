import { useCallback, useEffect, useMemo } from 'react';
import { useSelfAwareComponent } from '../../hooks/useSelfAwareComponent';
import { useBiodynamicTiming } from '../../hooks/useBiodynamicTiming';

export type GrowthStage = 'SEED' | 'SPROUT' | 'GROWTH' | 'BLOOM' | 'FRUIT' | 'HARVEST';
export type SeasonalPhase = 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER';
export type LunarPhase = 'NEW' | 'WAXING' | 'FULL' | 'WANING';
export type ElementalAspect = 'EARTH' | 'WATER' | 'AIR' | 'FIRE' | 'AETHER';

export interface AgriculturalPattern {
  id: string;
  growthStage: GrowthStage;
  seasonalPhase: SeasonalPhase;
  lunarPhase: LunarPhase;
  elementalAspect: ElementalAspect;
  consciousness: number;
}

export interface UseAgriculturalPatternOptions {
  initialGrowthStage?: GrowthStage;
  seasonalAlignment?: boolean;
  lunarAlignment?: boolean;
  elementalBalance?: boolean;
}

const GROWTH_STAGE_SEQUENCE: GrowthStage[] = ['SEED', 'SPROUT', 'GROWTH', 'BLOOM', 'FRUIT', 'HARVEST'];
const SEASONAL_PHASE_SEQUENCE: SeasonalPhase[] = ['SPRING', 'SUMMER', 'AUTUMN', 'WINTER'];
const LUNAR_PHASE_SEQUENCE: LunarPhase[] = ['NEW', 'WAXING', 'FULL', 'WANING'];
const ELEMENTAL_ASPECT_SEQUENCE: ElementalAspect[] = ['EARTH', 'WATER', 'AIR', 'FIRE', 'AETHER'];

export function useAgriculturalPattern(
  id: string,
  options: UseAgriculturalPatternOptions = {}
) {
  const {
    initialGrowthStage = 'SEED',
    seasonalAlignment = true,
    lunarAlignment = true,
    elementalBalance = true
  } = options;

  const selfAware = useSelfAwareComponent(id, {
    purpose: 'GUARDIAN',
    animationPattern: 'GROWTH'
  });

  const biodynamic = useBiodynamicTiming();

  const pattern = useMemo<AgriculturalPattern>(() => ({
    id,
    growthStage: initialGrowthStage,
    seasonalPhase: 'SPRING',
    lunarPhase: 'NEW',
    elementalAspect: 'EARTH',
    consciousness: selfAware.state.consciousness
  }), [id, initialGrowthStage, selfAware.state.consciousness]);

  const advanceGrowthStage = useCallback(() => {
    const currentIndex = GROWTH_STAGE_SEQUENCE.indexOf(pattern.growthStage);
    const nextIndex = (currentIndex + 1) % GROWTH_STAGE_SEQUENCE.length;
    pattern.growthStage = GROWTH_STAGE_SEQUENCE[nextIndex];
    selfAware.evolve();
  }, [pattern, selfAware]);

  const alignWithSeason = useCallback(() => {
    if (!seasonalAlignment) return;
    const optimalTiming = biodynamic.getOptimalTiming('GROWING', 3600000);
    const month = new Date(optimalTiming).getMonth();
    pattern.seasonalPhase = SEASONAL_PHASE_SEQUENCE[Math.floor(month / 3)];
  }, [seasonalAlignment, biodynamic, pattern]);

  const alignWithLunarPhase = useCallback(() => {
    if (!lunarAlignment) return;
    const optimalTiming = biodynamic.getOptimalTiming('PLANTING', 3600000);
    const daysSinceNewMoon = Math.floor((Date.now() - optimalTiming.getTime()) / (24 * 60 * 60 * 1000));
    const lunarDay = daysSinceNewMoon % 28;
    pattern.lunarPhase = LUNAR_PHASE_SEQUENCE[Math.floor(lunarDay / 7)];
  }, [lunarAlignment, biodynamic, pattern]);

  const balanceElements = useCallback(() => {
    if (!elementalBalance) return;
    const consciousness = selfAware.state.consciousness;
    const elementIndex = Math.floor(consciousness * ELEMENTAL_ASPECT_SEQUENCE.length) % ELEMENTAL_ASPECT_SEQUENCE.length;
    pattern.elementalAspect = ELEMENTAL_ASPECT_SEQUENCE[elementIndex];
  }, [elementalBalance, selfAware.state.consciousness, pattern]);

  useEffect(() => {
    const interval = setInterval(() => {
      alignWithSeason();
      alignWithLunarPhase();
      balanceElements();
    }, 60 * 60 * 1000); // Update every hour

    return () => clearInterval(interval);
  }, [alignWithSeason, alignWithLunarPhase, balanceElements]);

  return {
    pattern,
    advanceGrowthStage,
    alignWithSeason,
    alignWithLunarPhase,
    balanceElements,
    ...selfAware
  };
}