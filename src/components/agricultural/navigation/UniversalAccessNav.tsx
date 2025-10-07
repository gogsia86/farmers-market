'use client';

import { useEffect } from 'react';
import { useOrganicNavigation } from '../../../hooks/useOrganicNavigation';
import styles from './UniversalAccessNav.module.css';

interface UniversalAccessNavProps {
  children: React.ReactNode;
  className?: string;
  consciousnessLevel?: number;
}

export function UniversalAccessNav({ children, className = '', consciousnessLevel = 1 }: UniversalAccessNavProps) {
  const { navigationFlow } = useOrganicNavigation();

  useEffect(() => {
    // Create aria labels and descriptions based on quantum state
    const updateAccessibility = () => {
      document.querySelectorAll('[data-nav-node]').forEach((node) => {
        const nodeId = node.getAttribute('data-nav-id');
        if (nodeId) {
          const navNode = navigationFlow.nodes.get(nodeId);
          if (navNode) {
            const resonance = Math.round(navNode.quantumState.resonance * 100);
            const harmony = Math.round(navNode.quantumState.harmony * 100);
            
            node.setAttribute('aria-label', `${navNode.label} - Resonance: ${resonance}%, Harmony: ${harmony}%`);
            node.setAttribute('role', 'button');
            node.setAttribute('tabindex', '0');
          }
        }
      });
    };

    updateAccessibility();
    // Update accessibility when navigation flow changes
    return () => {
      document.querySelectorAll('[data-nav-node]').forEach((node) => {
        node.removeAttribute('aria-label');
        node.removeAttribute('role');
        node.removeAttribute('tabindex');
      });
    };
  }, [navigationFlow]);

  return (
    <div 
      className={`${styles.universalNav} ${className}`}
      style={{ '--consciousness-level': consciousnessLevel } as { [key: string]: number }}
      role="navigation"
      aria-label="Universal Navigation"
    >
      <div className={styles.consciousnessIndicator}>
        Consciousness Level: {consciousnessLevel}
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}