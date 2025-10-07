import React from 'react';
import { useBiodynamicCycles } from '../../../hooks/useBiodynamicCycles';
import styles from './BiodynamicCycleVisualizer.module.css';

export const BiodynamicCycleVisualizer: React.FC = () => {
  const {
    currentState,
    currentPhase,
    cycles,
    getOptimalTimes,
    isFavorableTime
  } = useBiodynamicCycles();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  return (
    <div className={styles.cycleVisualizer}>
      <div className={styles.currentState}>
        <h3>Current Biodynamic State</h3>
        
        <div className={styles.moonPhase}>
          <h4>Moon Phase</h4>
          <div 
            className={styles.moonIndicator}
            style={{ '--moon-phase': currentState.moonPhase } as React.CSSProperties}
          />
          <span>{(currentState.moonPhase * 100).toFixed(0)}%</span>
        </div>

        <div className={styles.zodiac}>
          <h4>Zodiac Position</h4>
          <span>{currentState.zodiacPosition}</span>
        </div>

        <div className={styles.elementalInfluences}>
          <h4>Elemental Influences</h4>
          <div className={styles.elements}>
            {Object.entries(currentState.elementalInfluence).map(([element, value]) => (
              <div key={element} className={styles.element}>
                <label>{element}</label>
                <div className={styles.elementBar}>
                  <div 
                    className={styles.elementFill}
                    style={{ width: `${value * 100}%` }}
                  />
                </div>
                <span>{(value * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.currentPhase}>
        <h3>Current Growth Phase</h3>
        <div className={styles.phaseInfo}>
          <div className={styles.phaseType}>
            <span className={styles.phaseLabel}>Type:</span>
            <span className={styles.phaseValue}>{currentPhase.type}</span>
          </div>
          <div className={styles.phaseStrength}>
            <span className={styles.phaseLabel}>Strength:</span>
            <div className={styles.strengthBar}>
              <div 
                className={styles.strengthFill}
                style={{ width: `${currentPhase.strength * 100}%` }}
              />
            </div>
          </div>
          <div className={styles.phaseDuration}>
            <span className={styles.phaseLabel}>Duration:</span>
            <span className={styles.phaseValue}>{currentPhase.duration}h remaining</span>
          </div>
        </div>
      </div>

      <div className={styles.naturalCycles}>
        <h3>Natural Cycles</h3>
        <div className={styles.cyclesGrid}>
          {cycles.map(cycle => (
            <div key={cycle.name} className={styles.cycle}>
              <h4>{cycle.name}</h4>
              <div className={styles.cyclePhase}>
                <div 
                  className={styles.phaseFill}
                  style={{ width: `${cycle.currentPhase * 100}%` }}
                />
              </div>
              <div className={styles.cycleInfo}>
                <span>Phase: {(cycle.currentPhase * 100).toFixed(0)}%</span>
                <span>Influence: {(cycle.influence * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.activityRecommendations}>
        <h3>Activity Recommendations</h3>
        <div className={styles.activities}>
          {['planting', 'harvesting', 'maintenance'].map(activity => (
            <div key={activity} className={styles.activity}>
              <h4>{activity}</h4>
              <div className={styles.favorable}>
                {isFavorableTime(activity as any) ? (
                  <span className={styles.favorable}>Favorable Now</span>
                ) : (
                  <span className={styles.unfavorable}>Wait for Better Conditions</span>
                )}
              </div>
              <div className={styles.optimalTimes}>
                <h5>Next Optimal Times:</h5>
                <ul>
                  {getOptimalTimes(activity as any)
                    .slice(0, 3)
                    .map((time, index) => (
                      <li key={index}>{formatDate(time)}</li>
                    ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};