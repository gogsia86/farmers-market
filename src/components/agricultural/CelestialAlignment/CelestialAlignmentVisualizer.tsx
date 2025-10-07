import React from 'react';
import { useCelestialAlignment } from '../../../hooks/useCelestialAlignment';
import styles from './CelestialAlignmentVisualizer.module.css';

export const CelestialAlignmentVisualizer: React.FC = () => {
  const {
    celestialInfluence,
    celestialBodies,
    upcomingEvents,
    isOptimalTime,
    getNextOptimalTime
  } = useCelestialAlignment();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  const activities = ['planting', 'harvesting', 'maintenance'] as const;

  return (
    <div className={styles.alignmentVisualizer}>
      <section className={styles.overallInfluence}>
        <h3>Celestial Influence</h3>
        <div className={styles.influenceMetrics}>
          <div className={styles.metric}>
            <label>Overall</label>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                data-value={celestialInfluence.overall}
              />
              <span>{(celestialInfluence.overall * 100).toFixed(1)}%</span>
            </div>
          </div>
          <div className={styles.metric}>
            <label>Growth</label>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                data-value={celestialInfluence.growth}
              />
              <span>{(celestialInfluence.growth * 100).toFixed(1)}%</span>
            </div>
          </div>
          <div className={styles.metric}>
            <label>Vitality</label>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                data-value={celestialInfluence.vitality}
              />
              <span>{(celestialInfluence.vitality * 100).toFixed(1)}%</span>
            </div>
          </div>
          <div className={styles.metric}>
            <label>Resonance</label>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                data-value={celestialInfluence.resonance}
              />
              <span>{(celestialInfluence.resonance * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.celestialBodies}>
        <h3>Celestial Bodies</h3>
        <div className={styles.bodiesGrid}>
          {Array.from(celestialBodies.entries()).map(([name, body]) => (
            <div key={name} className={styles.celestialBody}>
              <h4>{name}</h4>
              <div className={styles.bodyPosition}>
                <span>Alt: {body.position.altitude.toFixed(1)}°</span>
                <span>Az: {body.position.azimuth.toFixed(1)}°</span>
              </div>
              <div className={styles.bodyInfluence}>
                <div className={styles.influenceBar}>
                  <div
                    className={styles.influenceFill}
                    data-value={(
                      body.influence.growth +
                      body.influence.vitality +
                      body.influence.resonance
                    ) / 3}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.activeEvents}>
        <h3>Active Events</h3>
        <div className={styles.eventsList}>
          {celestialInfluence.activeEvents.map((event, index) => (
            <div key={index} className={styles.event}>
              <div className={styles.eventType}>{event.type}</div>
              <div className={styles.eventBodies}>{event.bodies.join(' + ')}</div>
              <div className={styles.eventSignificance}>
                Significance: {(event.significance * 100).toFixed(1)}%
              </div>
              <div className={styles.eventDuration}>
                Duration: {event.duration}h
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.upcomingEvents}>
        <h3>Upcoming Events</h3>
        <div className={styles.timelineEvents}>
          {upcomingEvents.map((event, index) => (
            <div key={index} className={styles.timelineEvent}>
              <div className={styles.eventTime}>
                {formatDate(new Date(event.timestamp))}
              </div>
              <div className={styles.eventDetails}>
                <span className={styles.eventType}>{event.type}</span>
                <span className={styles.eventBodies}>{event.bodies.join(' + ')}</span>
              </div>
              <div className={styles.eventSignificance}>
                {(event.significance * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.activityRecommendations}>
        <h3>Activity Recommendations</h3>
        <div className={styles.activities}>
          {activities.map(activity => (
            <div key={activity} className={styles.activity}>
              <h4>{activity}</h4>
              <div className={styles.activityStatus}>
                {isOptimalTime(activity) ? (
                  <span className={styles.optimal}>Optimal Time Now</span>
                ) : (
                  <span className={styles.suboptimal}>
                    Next Optimal Time: {
                      getNextOptimalTime(activity)
                        ? formatDate(getNextOptimalTime(activity)!)
                        : 'None found'
                    }
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};