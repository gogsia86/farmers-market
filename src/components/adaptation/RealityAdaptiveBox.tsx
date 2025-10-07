import React from 'react';
import { useRealityState } from '../../hooks/useRealityState';
import styles from './RealityAdaptiveBox.module.css';

export const RealityAdaptiveBox: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { realityState, triggerRealityShift } = useRealityState();

  const getBoxClass = () => {
    switch (realityState.dimension) {
      case 'quantum':
        return `${styles.box} ${styles['box-quantum']}`;
      case 'spiritual':
        return `${styles.box} ${styles['box-spiritual']}`;
      default:
        return `${styles.box} ${styles['box-physical']}`;
    }
  };

  return (
    <div className={getBoxClass()}>
      <div className={styles.header}>
        <strong>Reality:</strong> {realityState.dimension} | <strong>Phase:</strong> {realityState.phase}
      </div>
      <button onClick={() => triggerRealityShift({ dimension: 'quantum' })} className={styles.button}>Quantum Shift</button>
      <button onClick={() => triggerRealityShift({ dimension: 'spiritual' })}>Spiritual Shift</button>
      <div className={styles.content}>{children}</div>
    </div>
  );
};
