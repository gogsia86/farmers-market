import { useCallback, useEffect, useState } from 'react';
import { FieldResonanceTracker, ResonanceAnalysis, ResonancePattern, FieldSection } from '../lib/fieldResonanceTracker';
import { useQuantumState } from './useQuantumState';

export interface FieldResonanceHookResult {
  patterns: Map<string, ResonancePattern>;
  sections: Map<string, FieldSection>;
  analysis: ResonanceAnalysis | null;
  resonanceScore: number;
  updatePatterns: () => void;
}

export function useFieldResonance(
  fieldDimensions: { width: number; height: number },
  resolution: number = 1
): FieldResonanceHookResult {
  const [tracker] = useState(() => new FieldResonanceTracker(fieldDimensions, resolution));
  const [patterns, setPatterns] = useState<Map<string, ResonancePattern>>(new Map());
  const [sections, setSections] = useState<Map<string, FieldSection>>(new Map());
  const [analysis, setAnalysis] = useState<ResonanceAnalysis | null>(null);
  const [resonanceScore, setResonanceScore] = useState(0);

  const { quantumState } = useQuantumState();

  const updatePatterns = useCallback(() => {
    if (!quantumState) return;

    tracker.detectPatterns(quantumState);
    setPatterns(tracker.getPatterns());
    setSections(tracker.getSections());
    
    const newAnalysis = tracker.analyzeResonance();
    setAnalysis(newAnalysis);
    setResonanceScore(newAnalysis.overallResonance);
  }, [tracker, quantumState]);

  useEffect(() => {
    updatePatterns();

    // Update patterns periodically to maintain quantum coherence
    const interval = setInterval(updatePatterns, 5000);
    return () => clearInterval(interval);
  }, [updatePatterns]);

  return {
    patterns,
    sections,
    analysis,
    resonanceScore,
    updatePatterns
  };
}