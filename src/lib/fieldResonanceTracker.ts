import { QuantumSignificance } from './quantumCalculations';

export interface FieldPoint {
  x: number;
  y: number;
  resonance: number;    // 0-1
  intensity: number;    // 0-1
  frequency: number;    // Hz
  phase: number;        // 0-2π
}

export interface ResonancePattern {
  id: string;
  type: 'standing' | 'traveling' | 'harmonic' | 'interference';
  frequency: number;
  amplitude: number;
  phase: number;
  nodes: FieldPoint[];
}

export interface FieldSection {
  id: string;
  bounds: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  resonanceScore: number;
  dominantPattern: string | null;
  activePatterns: string[];
}

export interface ResonanceAnalysis {
  overallResonance: number;
  patternDensity: number;
  harmonicStability: number;
  phaseCoherence: number;
  dominantFrequencies: number[];
  recommendations: string[];
}

export class FieldResonanceTracker {
  private patterns: Map<string, ResonancePattern> = new Map();
  private sections: Map<string, FieldSection> = new Map();
  private readonly sampleRate = 1000; // Hz
  private readonly minFrequency = 0.1; // Hz
  private readonly maxFrequency = 100;  // Hz

  constructor(
    private readonly fieldDimensions: { width: number; height: number },
    private readonly resolution: number = 1 // meters
  ) {
    this.initializeField();
  }

  private initializeField() {
    // Create initial grid of field sections
    const { width, height } = this.fieldDimensions;
    const sectionSize = 10 * this.resolution; // 10m x 10m sections

    for (let x = 0; x < width; x += sectionSize) {
      for (let y = 0; y < height; y += sectionSize) {
        const section: FieldSection = {
          id: `section-${x}-${y}`,
          bounds: {
            x1: x,
            y1: y,
            x2: Math.min(x + sectionSize, width),
            y2: Math.min(y + sectionSize, height)
          },
          resonanceScore: 0,
          dominantPattern: null,
          activePatterns: []
        };
        this.sections.set(section.id, section);
      }
    }
  }

  public detectPatterns(significance: QuantumSignificance): void {
    // Clear old patterns
    this.patterns.clear();

    // Generate new patterns based on quantum significance
    const patternCount = Math.floor(significance.value * 10) + 1;
    
    for (let i = 0; i < patternCount; i++) {
      const pattern = this.generatePattern(significance);
      this.patterns.set(pattern.id, pattern);
    }

    // Update section resonances
    this.updateSectionResonances();
  }

  private generatePattern(significance: QuantumSignificance): ResonancePattern {
    const type = this.selectPatternType(significance);
    const frequency = this.generateFrequency(significance);
    const amplitude = significance.value * Math.random();
    const phase = Math.random() * 2 * Math.PI;

    return {
      id: `pattern-${Date.now()}-${Math.random()}`,
      type,
      frequency,
      amplitude,
      phase,
      nodes: this.generateNodes(type, frequency, amplitude, phase)
    };
  }

  private selectPatternType(significance: QuantumSignificance): ResonancePattern['type'] {
    const types: ResonancePattern['type'][] = ['standing', 'traveling', 'harmonic', 'interference'];
    const index = Math.floor(significance.value * types.length);
    return types[index];
  }

  private generateFrequency(significance: QuantumSignificance): number {
    const range = this.maxFrequency - this.minFrequency;
    return this.minFrequency + (range * significance.value * Math.random());
  }

  private generateNodes(
    type: ResonancePattern['type'],
    frequency: number,
    amplitude: number,
    phase: number
  ): FieldPoint[] {
    const nodes: FieldPoint[] = [];
    const { width, height } = this.fieldDimensions;
    const step = this.resolution;

    for (let x = 0; x < width; x += step) {
      for (let y = 0; y < height; y += step) {
        const resonance = this.calculateResonance(x, y, type, frequency, amplitude, phase);
        if (resonance > 0.1) { // Only include significant nodes
          nodes.push({
            x,
            y,
            resonance,
            intensity: amplitude * resonance,
            frequency,
            phase: (phase + (x + y) / (width + height) * 2 * Math.PI) % (2 * Math.PI)
          });
        }
      }
    }

    return nodes;
  }

  private calculateResonance(
    x: number,
    y: number,
    type: ResonancePattern['type'],
    frequency: number,
    amplitude: number,
    phase: number
  ): number {
    const { width, height } = this.fieldDimensions;
    const normalizedX = x / width;
    const normalizedY = y / height;

    switch (type) {
      case 'standing':
        return Math.abs(
          Math.sin(2 * Math.PI * frequency * normalizedX + phase) *
          Math.sin(2 * Math.PI * frequency * normalizedY)
        );
      case 'traveling':
        return Math.abs(
          Math.sin(2 * Math.PI * (frequency * (normalizedX + normalizedY) + phase))
        );
      case 'harmonic':
        return Math.abs(
          Math.sin(2 * Math.PI * frequency * normalizedX + phase) *
          Math.cos(2 * Math.PI * frequency * normalizedY)
        );
      case 'interference':
        return Math.abs(
          Math.sin(2 * Math.PI * frequency * normalizedX + phase) +
          Math.sin(2 * Math.PI * frequency * normalizedY + phase)
        ) / 2;
    }
  }

  private updateSectionResonances() {
    this.sections.forEach(section => {
      const patterns = Array.from(this.patterns.values());
      const sectionPatterns = patterns.filter(pattern =>
        this.patternAffectsSection(pattern, section)
      );

      section.activePatterns = sectionPatterns.map(p => p.id);
      section.resonanceScore = this.calculateSectionResonance(section, sectionPatterns);
      section.dominantPattern = this.findDominantPattern(sectionPatterns);
    });
  }

  private patternAffectsSection(pattern: ResonancePattern, section: FieldSection): boolean {
    return pattern.nodes.some(node =>
      node.x >= section.bounds.x1 &&
      node.x <= section.bounds.x2 &&
      node.y >= section.bounds.y1 &&
      node.y <= section.bounds.y2
    );
  }

  private calculateSectionResonance(
    section: FieldSection,
    patterns: ResonancePattern[]
  ): number {
    if (patterns.length === 0) return 0;

    return patterns.reduce((total, pattern) => {
      const patternNodes = pattern.nodes.filter(node =>
        node.x >= section.bounds.x1 &&
        node.x <= section.bounds.x2 &&
        node.y >= section.bounds.y1 &&
        node.y <= section.bounds.y2
      );

      const patternResonance = patternNodes.reduce((sum, node) =>
        sum + node.resonance * node.intensity, 0
      ) / patternNodes.length;

      return total + patternResonance;
    }, 0) / patterns.length;
  }

  private findDominantPattern(patterns: ResonancePattern[]): string | null {
    if (patterns.length === 0) return null;

    let maxAmplitude = 0;
    let dominantId = null;

    patterns.forEach(pattern => {
      if (pattern.amplitude > maxAmplitude) {
        maxAmplitude = pattern.amplitude;
        dominantId = pattern.id;
      }
    });

    return dominantId;
  }

  public analyzeResonance(): ResonanceAnalysis {
    const patterns = Array.from(this.patterns.values());
    const sections = Array.from(this.sections.values());

    const overallResonance = sections.reduce(
      (sum, section) => sum + section.resonanceScore,
      0
    ) / sections.length;

    const patternDensity = patterns.length / (this.fieldDimensions.width * this.fieldDimensions.height);
    
    const harmonicStability = this.calculateHarmonicStability(patterns);
    const phaseCoherence = this.calculatePhaseCoherence(patterns);
    const dominantFrequencies = this.findDominantFrequencies(patterns);

    return {
      overallResonance,
      patternDensity,
      harmonicStability,
      phaseCoherence,
      dominantFrequencies,
      recommendations: this.generateRecommendations(
        overallResonance,
        harmonicStability,
        phaseCoherence
      )
    };
  }

  private calculateHarmonicStability(patterns: ResonancePattern[]): number {
    if (patterns.length < 2) return 1;

    const frequencies = patterns.map(p => p.frequency).sort((a, b) => a - b);
    let harmonicCount = 0;

    for (let i = 1; i < frequencies.length; i++) {
      const ratio = frequencies[i] / frequencies[i - 1];
      const nearestHarmonic = Math.round(ratio);
      if (Math.abs(ratio - nearestHarmonic) < 0.1) {
        harmonicCount++;
      }
    }

    return harmonicCount / (frequencies.length - 1);
  }

  private calculatePhaseCoherence(patterns: ResonancePattern[]): number {
    if (patterns.length < 2) return 1;

    const phases = patterns.map(p => p.phase);
    let coherence = 0;

    for (let i = 0; i < phases.length; i++) {
      for (let j = i + 1; j < phases.length; j++) {
        const phaseDiff = Math.abs(phases[i] - phases[j]) % (2 * Math.PI);
        coherence += Math.cos(phaseDiff);
      }
    }

    const maxCoherence = (patterns.length * (patterns.length - 1)) / 2;
    return (coherence + maxCoherence) / (2 * maxCoherence); // Normalize to 0-1
  }

  private findDominantFrequencies(patterns: ResonancePattern[]): number[] {
    return patterns
      .sort((a, b) => b.amplitude - a.amplitude)
      .slice(0, 3)
      .map(p => p.frequency);
  }

  private generateRecommendations(
    resonance: number,
    stability: number,
    coherence: number
  ): string[] {
    const recommendations: string[] = [];

    if (resonance < 0.3) {
      recommendations.push('Increase overall field resonance through harmonic pattern reinforcement');
    }
    if (stability < 0.5) {
      recommendations.push('Stabilize harmonic relationships between active patterns');
    }
    if (coherence < 0.6) {
      recommendations.push('Improve phase coherence through pattern alignment');
    }

    return recommendations;
  }

  public getPatterns(): Map<string, ResonancePattern> {
    return new Map(this.patterns);
  }

  public getSections(): Map<string, FieldSection> {
    return new Map(this.sections);
  }
}