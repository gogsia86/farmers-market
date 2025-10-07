import { QuantumSignificance } from './quantumCalculations';

export interface CelestialBody {
  name: string;
  type: 'planet' | 'star' | 'satellite';
  position: {
    azimuth: number;   // degrees
    altitude: number;   // degrees
    rightAscension: number; // hours
    declination: number;    // degrees
  };
  influence: {
    growth: number;     // 0-1
    vitality: number;   // 0-1
    resonance: number;  // 0-1
  };
}

export interface AstronomicalEvent {
  type: 'conjunction' | 'opposition' | 'transit' | 'phase';
  bodies: string[];
  timestamp: number;
  significance: number; // 0-1
  duration: number;     // hours
}

export interface CelestialInfluence {
  overall: number;      // 0-1
  growth: number;       // 0-1
  vitality: number;     // 0-1
  resonance: number;    // 0-1
  primaryBody: string;
  activeEvents: AstronomicalEvent[];
}

export class CelestialAlignmentSystem {
  private celestialBodies: Map<string, CelestialBody> = new Map();
  private events: AstronomicalEvent[] = [];
  private readonly J2000 = new Date('2000-01-01T12:00:00Z').getTime();
  
  constructor() {
    this.initializeCelestialBodies();
  }

  private initializeCelestialBodies() {
    // Initialize major celestial bodies
    const bodies: CelestialBody[] = [
      {
        name: 'Sun',
        type: 'star',
        position: this.calculateSolarPosition(),
        influence: {
          growth: 1.0,
          vitality: 1.0,
          resonance: 1.0
        }
      },
      {
        name: 'Moon',
        type: 'satellite',
        position: this.calculateLunarPosition(),
        influence: {
          growth: 0.8,
          vitality: 0.9,
          resonance: 0.95
        }
      },
      // Add other planets...
    ];

    bodies.forEach(body => this.celestialBodies.set(body.name, body));
  }

  private calculateSolarPosition() {
    const now = new Date();
    const daysSinceJ2000 = (now.getTime() - this.J2000) / (1000 * 60 * 60 * 24);
    
    // Simplified solar position calculation
    const meanLongitude = (280.46 + 0.9856474 * daysSinceJ2000) % 360;
    const meanAnomaly = (357.528 + 0.9856003 * daysSinceJ2000) % 360;
    
    // Simplified position for demonstration
    return {
      azimuth: meanLongitude,
      altitude: 90 - Math.abs(meanAnomaly - 180),
      rightAscension: meanLongitude / 15, // Convert to hours
      declination: 23.44 * Math.sin((meanLongitude - 80) * Math.PI / 180)
    };
  }

  private calculateLunarPosition() {
    const now = new Date();
    const daysSinceJ2000 = (now.getTime() - this.J2000) / (1000 * 60 * 60 * 24);
    
    // Simplified lunar position calculation
    const meanLongitude = (218.316 + 13.176396 * daysSinceJ2000) % 360;
    const meanAnomaly = (134.963 + 13.064993 * daysSinceJ2000) % 360;
    
    return {
      azimuth: meanLongitude,
      altitude: 45 + 5 * Math.sin(meanAnomaly * Math.PI / 180),
      rightAscension: meanLongitude / 15,
      declination: 5.145 * Math.sin(meanAnomaly * Math.PI / 180)
    };
  }

  public updatePositions() {
    this.celestialBodies.forEach((body, name) => {
      switch (name) {
        case 'Sun':
          body.position = this.calculateSolarPosition();
          break;
        case 'Moon':
          body.position = this.calculateLunarPosition();
          break;
        // Update other bodies...
      }
    });
  }

  public calculateAlignment(significance: QuantumSignificance): CelestialInfluence {
    this.updatePositions();
    this.updateEvents();

    const activeEvents = this.getActiveEvents();
    const baseInfluence = this.calculateBaseInfluence();
    
    return {
      overall: baseInfluence.overall * significance.value,
      growth: baseInfluence.growth * significance.dimensionalResonance,
      vitality: baseInfluence.vitality * significance.temporalWeight,
      resonance: baseInfluence.resonance * significance.confidence,
      primaryBody: this.determinePrimaryBody(),
      activeEvents
    };
  }

  private calculateBaseInfluence(): Omit<CelestialInfluence, 'primaryBody' | 'activeEvents'> {
    let totalGrowth = 0;
    let totalVitality = 0;
    let totalResonance = 0;
    let count = 0;

    this.celestialBodies.forEach(body => {
      const weight = this.calculateBodyWeight(body);
      totalGrowth += body.influence.growth * weight;
      totalVitality += body.influence.vitality * weight;
      totalResonance += body.influence.resonance * weight;
      count++;
    });

    return {
      overall: (totalGrowth + totalVitality + totalResonance) / (3 * count),
      growth: totalGrowth / count,
      vitality: totalVitality / count,
      resonance: totalResonance / count
    };
  }

  private calculateBodyWeight(body: CelestialBody): number {
    const altitudeWeight = (90 + body.position.altitude) / 180;
    return altitudeWeight * (body.type === 'star' ? 1.5 : 1.0);
  }

  private determinePrimaryBody(): string {
    let maxInfluence = 0;
    let primaryBody = '';

    this.celestialBodies.forEach((body, name) => {
      const influence = this.calculateBodyWeight(body) * 
        (body.influence.growth + body.influence.vitality + body.influence.resonance) / 3;
      
      if (influence > maxInfluence) {
        maxInfluence = influence;
        primaryBody = name;
      }
    });

    return primaryBody;
  }

  private updateEvents() {
    const now = Date.now();
    
    // Remove past events
    this.events = this.events.filter(event => 
      event.timestamp + event.duration * 60 * 60 * 1000 > now
    );

    // Calculate upcoming events
    const newEvents = this.calculateUpcomingEvents();
    this.events.push(...newEvents);
  }

  private calculateUpcomingEvents(): AstronomicalEvent[] {
    const events: AstronomicalEvent[] = [];
    const now = Date.now();

    // Example: Calculate lunar phase events
    const newMoon = new Date('2025-10-05T12:00:00Z').getTime();
    const lunarMonth = 29.53 * 24 * 60 * 60 * 1000;
    const phaseDuration = 24; // hours

    for (let i = 0; i < 4; i++) {
      const phaseTime = newMoon + (lunarMonth * i / 4);
      if (phaseTime > now) {
        events.push({
          type: 'phase',
          bodies: ['Moon'],
          timestamp: phaseTime,
          significance: 0.8,
          duration: phaseDuration
        });
      }
    }

    return events;
  }

  private getActiveEvents(): AstronomicalEvent[] {
    const now = Date.now();
    return this.events.filter(event => {
      const eventEnd = event.timestamp + event.duration * 60 * 60 * 1000;
      return event.timestamp <= now && eventEnd >= now;
    });
  }

  public getUpcomingEvents(hoursAhead: number = 168): AstronomicalEvent[] {
    const now = Date.now();
    const futureLimit = now + hoursAhead * 60 * 60 * 1000;
    
    return this.events
      .filter(event => event.timestamp > now && event.timestamp <= futureLimit)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  public getCelestialBodies(): Map<string, CelestialBody> {
    return new Map(this.celestialBodies);
  }
}