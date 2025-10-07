export type BehaviorType = 'CLICK' | 'HOVER' | 'SCROLL' | 'GESTURE' | 'FOCUS';

export type UseBehaviorTrackingOptions = BehaviorType[];

export interface BehaviorPattern {
  type: BehaviorType;
  frequency: number;
  intensity: number;
  quantumState: 'elevated' | 'neutral' | 'diminished';
}