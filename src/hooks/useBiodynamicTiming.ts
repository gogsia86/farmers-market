import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import {
  BiodynamicTimingSystem,
  BiodynamicCycle,
  BiodynamicActivity,
  TimingConfig
} from '../lib/timing/biodynamic-timing';

export interface UseBiodynamicTimingOptions {
  updateFrequency?: number;
  sensitivity?: number;
  harmonicAlignment?: number;
  resonanceFactor?: number;
}

export function useBiodynamicTiming(
  options: UseBiodynamicTimingOptions = {}
) {
  const {
    updateFrequency = 60000, // 1 minute
    sensitivity = 0.8,
    harmonicAlignment = 0.7,
    resonanceFactor = 0.9
  } = options;

  const config: TimingConfig = {
    updateFrequency,
    sensitivity,
    harmonicAlignment,
    resonanceFactor
  };

  // Create timing system
  const timingSystem = useMemo(() => {
    return new BiodynamicTimingSystem(config);
  }, [config.updateFrequency, config.sensitivity, config.harmonicAlignment, config.resonanceFactor]);

  // Store timing system reference
  const timingSystemRef = useRef(timingSystem);
  useEffect(() => {
    timingSystemRef.current = timingSystem;
  }, [timingSystem]);

  // Store cycle state
  const [cycle, setCycle] = useState<BiodynamicCycle>(timingSystem.getCurrentCycle());

  // Subscribe to cycle updates
  useEffect(() => {
    const id = `timing-${Math.random()}`;
    timingSystem.subscribeToCycle(id, (newCycle: BiodynamicCycle) => {
      setCycle(newCycle);
    });

    return () => {
      timingSystem.unsubscribeFromCycle(id);
      timingSystem.cleanup();
    };
  }, [timingSystem]);

  // Calculate optimal timing for an activity
  const getOptimalTiming = useCallback((
    activity: BiodynamicActivity,
    duration: number
  ): Date => {
    return timingSystemRef.current.calculateOptimalTiming(activity, duration);
  }, []);

  // Check if current time is harmonious
  const isHarmoniousTime = useCallback((
    activity: BiodynamicActivity
  ): boolean => {
    return timingSystemRef.current.isHarmoniousTime(activity);
  }, []);

  // Format cycle information for display
  const getFormattedCycle = useCallback((cycle: BiodynamicCycle): string => {
    const {
      celestial,
      seasonal,
      diurnal,
      activity,
      energyLevel,
      harmonyIndex
    } = cycle;

    return `${seasonal} season, ${celestial} moon, ${diurnal} phase
Energy: ${Math.round(energyLevel * 100)}%
Harmony: ${Math.round(harmonyIndex * 100)}%
Optimal for: ${activity}`;
  }, []);

  // Get recommended activities for current cycle
  const getRecommendedActivities = useCallback((
    cycle: BiodynamicCycle
  ): BiodynamicActivity[] => {
    const recommendations: BiodynamicActivity[] = [];

    if (cycle.energyLevel > 0.6) {
      if (cycle.celestial === 'WAXING' || cycle.celestial === 'FULL') {
        recommendations.push('GROWING');
      }
      if (cycle.diurnal === 'ZENITH') {
        recommendations.push('PLANTING');
      }
      if (cycle.celestial === 'FULL' && cycle.diurnal === 'DUSK') {
        recommendations.push('HARVESTING');
      }
    } else {
      recommendations.push('RESTING');
    }

    return recommendations;
  }, []);

  return {
    currentCycle: cycle,
    getOptimalTiming,
    isHarmoniousTime,
    getFormattedCycle,
    getRecommendedActivities
  };
}