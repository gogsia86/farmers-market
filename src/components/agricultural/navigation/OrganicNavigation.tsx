'use client';

import { useCallback, useEffect } from 'react';
import { useOrganicNavigation } from '../../../hooks/useOrganicNavigation';
import { useRouter } from 'next/navigation';
import type { NavigationNode } from '../../../lib/navigation/types';
import styles from './OrganicNavigation.module.css';

interface OrganicNavigationProps {
  initialNodes: Map<string, Omit<NavigationNode, 'quantumState'>>;
  className?: string;
}

export function OrganicNavigation({ initialNodes, className = '' }: OrganicNavigationProps) {
  const router = useRouter();
  const { navigationFlow, addNavigationNode, updateNavigationPath, getNavigationStyles } = useOrganicNavigation();

  useEffect(() => {
    // Initialize navigation nodes
    initialNodes.forEach((node, id) => {
      addNavigationNode(id, node);
    });
  }, [initialNodes, addNavigationNode]);

  const handleNavigation = useCallback((nodeId: string) => {
    const node = navigationFlow.nodes.get(nodeId);
    if (node) {
      updateNavigationPath([...navigationFlow.currentPath, nodeId]);
      router.push(node.path);
    }
  }, [navigationFlow, updateNavigationPath, router]);

  return (
    <nav 
      className={`${styles.navigation} ${className}`}
      style={{
        '--nav-flow': navigationFlow.quantumState.resonance,
        '--nav-harmony': navigationFlow.quantumState.harmony
      } as { [key: string]: string | number }}
    >
      <ul className={styles.list}>
        {Array.from(navigationFlow.nodes.entries()).map(([id, node]) => (
          <li key={id} className={styles.item}>
            <button
              onClick={() => handleNavigation(id)}
              className={styles.button}
              style={getNavigationStyles(id) as { [key: string]: string | number }}
            >
              {node.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}