export interface NavigationQuantumState {
  resonance: number;
  harmony: number;
  consciousness: number;
}

export interface NavigationNode {
  type: 'link' | 'button' | 'dropdown';
  label: string;
  path: string;
  season?: string;
  children?: string[];
  quantumState: NavigationQuantumState;
}

export interface NavigationFlow {
  nodes: Map<string, NavigationNode>;
  currentPath: string[];
  quantumState: NavigationQuantumState;
}

export interface OrganicPattern {
  nodes: Map<string, Omit<NavigationNode, 'quantumState'>>;
  initialPath?: string[];
}