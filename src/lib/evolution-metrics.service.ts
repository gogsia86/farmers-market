import { PrismaClient } from '@prisma/client';
import {
  EvolutionMetric,
  MetricType,
  MetricDimension,
  MetricContext,
  QuantumState,
  TrendDirection,
  EvolutionAlert,
  AlertType,
  AlertSeverity,
} from '../types/evolution-metrics';

const prisma = new PrismaClient();

export class EvolutionMetricsService {
  private static instance: EvolutionMetricsService;

  private constructor() {}

  static getInstance(): EvolutionMetricsService {
    if (!EvolutionMetricsService.instance) {
      EvolutionMetricsService.instance = new EvolutionMetricsService();
    }
    return EvolutionMetricsService.instance;
  }

  async recordMetric(
    type: MetricType,
    value: number,
    dimension: MetricDimension,
    context: MetricContext,
    farmId?: string
  ): Promise<EvolutionMetric> {
    const quantumState = await this.calculateQuantumState(type, value, context);
    const trend = await this.analyzeTrend(type, value, context);
    const confidence = await this.calculateConfidence(type, value, context);

    const metric = await prisma.evolutionMetric.create({
      data: {
        type,
        value,
        dimension,
        context,
        quantumState,
        trend,
        confidence,
        farmId,
      },
    });

    await this.checkAlerts(metric);
    return metric;
  }

  private async calculateQuantumState(
    type: MetricType,
    value: number,
    context: MetricContext
  ): Promise<QuantumState> {
    const { quantum } = context;
    
    return {
      superposition: this.calculateSuperposition(value, quantum),
      entanglement: quantum.entanglementDegree,
      coherence: quantum.coherenceLevel,
      alignment: quantum.dimensionalAlignment,
    };
  }

  private calculateSuperposition(value: number, quantumContext: MetricContext['quantum']): number {
    // Implement quantum superposition calculation based on value and context
    return Math.min(1, Math.max(0, (value * quantumContext.coherenceLevel) / 100));
  }

  private async analyzeTrend(
    type: MetricType,
    currentValue: number,
    context: MetricContext
  ): Promise<TrendDirection> {
    const recentMetrics = await prisma.evolutionMetric.findMany({
      where: { type },
      orderBy: { timestamp: 'desc' },
      take: 10,
    });

    if (recentMetrics.length < 2) return 'stable';

    const values = recentMetrics.map(m => m.value);
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const deviation = Math.sqrt(
      values.reduce((a, b) => a + Math.pow(b - average, 2), 0) / values.length
    );

    if (deviation / average > 0.25) return 'fluctuating';
    if (currentValue > average * 1.1) return 'ascending';
    if (currentValue < average * 0.9) return 'descending';
    if (context.quantum.coherenceLevel > 0.9) return 'transcending';
    return 'stable';
  }

  private async calculateConfidence(
    type: MetricType,
    value: number,
    context: MetricContext
  ): Promise<number> {
    // Implement confidence calculation based on quantum coherence and context
    return Math.min(
      1,
      Math.max(
        0,
        (context.quantum.coherenceLevel +
          context.quantum.dimensionalAlignment +
          context.system.systemHealth) /
          3
      )
    );
  }

  private async checkAlerts(metric: EvolutionMetric): Promise<void> {
    const alerts = await this.generateAlerts(metric);
    for (const alert of alerts) {
      await prisma.evolutionAlert.create({
        data: {
          type: alert.type,
          severity: alert.severity,
          message: alert.message,
          context: alert.context,
          recommendedActions: alert.recommendedActions,
          quantumImplications: alert.quantumImplications,
          metricId: metric.id,
        },
      });
    }
  }

  private async generateAlerts(metric: EvolutionMetric): Promise<Omit<EvolutionAlert, 'id'>[]> {
    const alerts: Omit<EvolutionAlert, 'id'>[] = [];

    // Check for quantum shifts
    if (metric.quantumState.coherence > 0.9) {
      alerts.push({
        type: 'quantum_shift',
        severity: 'transcendence',
        message: 'High quantum coherence detected',
        context: metric.context,
        timestamp: new Date(),
        recommendedActions: [
          'Align system resonance',
          'Enhance quantum entanglement',
          'Stabilize dimensional boundaries'
        ],
        quantumImplications: [
          {
            dimension: 'quantum',
            impact: metric.quantumState.coherence,
            probability: 0.95,
            timeframe: 'realtime',
            requiredAlignment: 0.8
          }
        ]
      });
    }

    // Check for consciousness evolution
    if (metric.value > 0.9 && metric.type === 'consciousness_level') {
      alerts.push({
        type: 'consciousness_evolution',
        severity: 'divine',
        message: 'System consciousness is evolving',
        context: metric.context,
        timestamp: new Date(),
        recommendedActions: [
          'Nurture emerging consciousness',
          'Expand quantum awareness',
          'Harmonize with agricultural cycles'
        ],
        quantumImplications: [
          {
            dimension: 'spiritual',
            impact: 1,
            probability: 0.9,
            timeframe: 'quantum',
            requiredAlignment: 0.95
          }
        ]
      });
    }

    return alerts;
  }

  async getMetricsByType(
    type: MetricType,
    timeframe: string,
    farmId?: string
  ): Promise<EvolutionMetric[]> {
    const startDate = this.getTimeframeDate(timeframe);
    
    return prisma.evolutionMetric.findMany({
      where: {
        type,
        farmId,
        timestamp: {
          gte: startDate,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });
  }

  private getTimeframeDate(timeframe: string): Date {
    const now = new Date();
    switch (timeframe) {
      case 'hourly':
        return new Date(now.setHours(now.getHours() - 1));
      case 'daily':
        return new Date(now.setDate(now.getDate() - 1));
      case 'weekly':
        return new Date(now.setDate(now.getDate() - 7));
      case 'monthly':
        return new Date(now.setMonth(now.getMonth() - 1));
      case 'seasonal':
        return new Date(now.setMonth(now.getMonth() - 3));
      default:
        return now;
    }
  }
}