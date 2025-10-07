import type { NavigationFlow, NavigationNode } from './types';

interface VerificationResult {
  overallAlignment: number;
  quantumResonance: number;
  dimensionalStability: number;
  issues: Array<{
    severity: 'low' | 'medium' | 'high';
    message: string;
    nodeId?: string;
  }>;
}

interface QuantumMetrics {
  resonance: number;
  harmony: number;
  alignment: number;
}

export function verifyNavigationStructure(flow: NavigationFlow): VerificationResult {
  const issues: VerificationResult['issues'] = [];
  const metrics = calculateQuantumMetrics(flow);

  // Check overall quantum alignment
  if (metrics.alignment < 0.7) {
    issues.push({
      severity: 'high',
      message: `Low quantum alignment detected (${metrics.alignment.toFixed(2)}). Navigation structure may be unstable.`
    });
  }

  // Verify dimensional stability
  const stability = calculateDimensionalStability(flow);
  if (stability < 0.8) {
    issues.push({
      severity: 'medium',
      message: `Dimensional stability is below threshold (${stability.toFixed(2)}). Consider rebalancing navigation paths.`
    });
  }

  // Check individual node resonance
  flow.nodes.forEach((node, id) => {
    if (node.quantumState.resonance < 0.5) {
      issues.push({
        severity: 'medium',
        message: `Low resonance detected in node "${node.label}"`,
        nodeId: id
      });
    }
  });

  // Validate path coherence
  const pathCoherence = validatePathCoherence(flow);
  if (!pathCoherence.valid) {
    issues.push({
      severity: 'high',
      message: pathCoherence.message
    });
  }

  return {
    overallAlignment: metrics.alignment,
    quantumResonance: metrics.resonance,
    dimensionalStability: stability,
    issues
  };
}

function calculateQuantumMetrics(flow: NavigationFlow): QuantumMetrics {
  const nodeCount = flow.nodes.size;
  if (nodeCount === 0) {
    return { resonance: 0, harmony: 0, alignment: 0 };
  }

  let totalResonance = 0;
  let totalHarmony = 0;

  flow.nodes.forEach((node) => {
    totalResonance += node.quantumState.resonance;
    totalHarmony += node.quantumState.harmony;
  });

  const resonance = totalResonance / nodeCount;
  const harmony = totalHarmony / nodeCount;
  const alignment = (resonance + harmony) / 2;

  return {
    resonance,
    harmony,
    alignment
  };
}

function calculateDimensionalStability(flow: NavigationFlow): number {
  const metrics = calculateQuantumMetrics(flow);
  const pathStability = flow.currentPath.length > 0 ? 1 : 0.5;
  
  return (metrics.alignment + pathStability) / 2;
}

function validatePathCoherence(flow: NavigationFlow): { valid: boolean; message: string } {
  if (flow.currentPath.length === 0) {
    return { valid: true, message: 'No active navigation path' };
  }

  // Verify all path nodes exist
  const invalidNodes = flow.currentPath.filter(id => !flow.nodes.has(id));
  if (invalidNodes.length > 0) {
    return {
      valid: false,
      message: `Invalid navigation path: contains non-existent nodes [${invalidNodes.join(', ')}]`
    };
  }

  // Check quantum resonance along the path
  let previousResonance = -1;
  for (const nodeId of flow.currentPath) {
    const node = flow.nodes.get(nodeId)!;
    const currentResonance = node.quantumState.resonance;

    if (previousResonance !== -1 && Math.abs(currentResonance - previousResonance) > 0.3) {
      return {
        valid: false,
        message: `Quantum resonance discontinuity detected in path at node "${node.label}"`
      };
    }

    previousResonance = currentResonance;
  }

  return { valid: true, message: 'Path coherence verified' };
}