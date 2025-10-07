'use client';

import { useCallback, useEffect, useState } from 'react';
import { useOrganicNavigation } from '../../../hooks/useOrganicNavigation';
import { useRouter } from 'next/navigation';
import type { NavigationNode } from '../../../lib/navigation/types';
import styles from './NaturalProgressionFlow.module.css';

interface NaturalProgressionFlowProps {
  flows: Array<{
    id: string;
    label: string;
    season: string;
    path: string;
    next?: string;
    previous?: string;
  }>;
  className?: string;
}

export function NaturalProgressionFlow({ flows, className = '' }: NaturalProgressionFlowProps) {
  const router = useRouter();
  const getCurrentSeason = useCallback((): string => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'SPRING';
    if (month >= 5 && month <= 7) return 'SUMMER';
    if (month >= 8 && month <= 10) return 'FALL';
    return 'WINTER';
  }, []);

  const [currentSeason, setCurrentSeason] = useState(getCurrentSeason());
  const { navigationFlow, addNavigationNode, updateNavigationPath, getNavigationStyles } = useOrganicNavigation();

  useEffect(() => {
    // Initialize flow nodes
    flows.forEach(flow => {
      const node: Omit<NavigationNode, 'quantumState'> = {
        type: 'button',
        label: flow.label,
        path: flow.path,
        season: flow.season
      };
      addNavigationNode(flow.id, node);
    });
  }, [flows, addNavigationNode]);

  const handleProgression = useCallback((flowId: string) => {
    const flow = flows.find(f => f.id === flowId);
    if (flow) {
      updateNavigationPath([...navigationFlow.currentPath, flowId]);
      router.push(flow.path);
    }
  }, [flows, navigationFlow, updateNavigationPath, router]);

  return (
    <div className={`${styles.progression} ${className}`}>
      <div className={styles.seasonIndicator}>
        Current Season: {currentSeason}
      </div>
      <div className={styles.flowContainer}>
        {flows.map((flow) => (
          <button
            key={flow.id}
            onClick={() => handleProgression(flow.id)}
            className={`${styles.flowNode} ${flow.season === currentSeason ? styles.active : ''}`}
            style={getNavigationStyles(flow.id) as { [key: string]: string | number }}
          >
            <span className={styles.label}>{flow.label}</span>
            <span className={styles.season}>{flow.season}</span>
          </button>
        ))}
      </div>
    </div>
  );
}