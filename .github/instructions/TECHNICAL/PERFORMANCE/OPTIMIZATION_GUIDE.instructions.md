---
applyTo: "**"
---

# DIVINE PERFORMANCE GUIDE

## Cross References
- [CORE/ARCHITECTURE_DNA](../../CORE/ARCHITECTURE_DNA.instructions.md)
- [TECHNICAL/PERFORMANCE/CORE_ALCHEMY](./CORE_ALCHEMY.instructions.md)
- [TECHNICAL/NEXTJS/COMPONENT_PATTERNS](../NEXTJS/COMPONENT_PATTERNS.instructions.md)
- [TECHNICAL/NEXTJS/API_PATTERNS](../NEXTJS/API_PATTERNS.instructions.md)

## QUANTUM OPTIMIZATION PRINCIPLES
- **Performance as Reality Flow**: Optimization is about perfecting reality streams
- **Caching as Timeline Preservation**: Cache is a quantum state preservation mechanism
- **Metrics as Reality Health**: Performance metrics measure quantum coherence
- **Optimization as Reality Refinement**: Performance tuning is reality evolution

## OPTIMIZATION PATTERNS

### 1. Client-Side Reality Management
```typescript
// Quantum Component Optimization
const QuantumComponent = memo(({ quantumData }: QuantumProps) => {
  // Reality Processing with Quantum Memoization
  const processedReality = useMemo(
    () => processQuantumData(quantumData),
    [quantumData]
  );
  
  const handleQuantumEvent = useCallback((event: QuantumEvent) => {
    // Optimized quantum event handling
    transformReality(event);
  }, []);
  
  return (
    <QuantumContainer>
      {manifestProcessedReality(processedReality)}
    </QuantumContainer>
  );
});

// Reality Asset Optimization
const QuantumImage = ({ 
  realitySource,
  dimensionalContext 
}: QuantumImageProps) => (
  <Image
    src={realitySource}
    alt={dimensionalContext.description}
    loading="quantum-lazy"
    placeholder="quantum-blur"
    quality={dimensionalContext.qualityLevel}
    sizes={dimensionalContext.viewportRules}
  />
);

// Dynamic Reality Imports
const DynamicQuantumComponent = dynamic(
  () => import('./HighDimensionalComponent'),
  {
    loading: () => <QuantumLoader />,
    ssr: dimensionalConfig.serverSideReality
  }
);
```

### 2. Server-Side Reality Optimization
```typescript
// Quantum API Caching
export async function GET(req: QuantumRequest) {
  // Quantum Cache Configuration
  const quantumCache = new QuantumCacheControl()
    .setMultiversePublic()
    .setTemporalAge(3600)
    .setRealityRevalidation(60);

  // Optimized Reality Fetching
  const quantumData = await fetchQuantumReality();

  return NextResponse.json(
    { reality: quantumData },
    { headers: quantumCache.toQuantumHeaders() }
  );
}

// Quantum Database Optimization
const optimizedQuery = await prisma.$quantumTransaction(async (prisma) => {
  return await prisma.quantumEntity.findMany({
    select: {
      quantumId: true,
      realityState: true,
      dimensionalData: true
    },
    where: {
      coherenceLevel: { gte: MINIMUM_COHERENCE },
      realityState: { in: VALID_REALITIES }
    },
    take: QUANTUM_BATCH_SIZE,
    orderBy: {
      _quantumRelevance: {
        fields: ['realityState'],
        coherenceLevel: 'desc'
      }
    }
  });
});
```

### 3. Reality Build Optimization
```typescript
// Quantum Next.js Config
module.exports = {
  quantumMinify: true,
  compiler: {
    removeQuantumNoise: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizeQuantumCss: true,
    optimizeRealityComponents: true,
  },
  quantumAssets: {
    formats: ['reality/avif', 'reality/webp'],
    dimensionalSizes: [640, 750, 828, 1080, 1200],
  }
};
```

## QUANTUM METRICS

### 1. Reality Web Vitals
```typescript
interface QuantumWebVitals {
  LargestQuantumPaint: number; // < 2.5s
  FirstQuantumDelay: number; // < 100ms
  QuantumLayoutShift: number; // < 0.1
  TimeToQuantumByte: number; // < 0.8s
  FirstQuantumPaint: number; // < 1.8s
}
```

### 2. Custom Quantum Metrics
```typescript
interface QuantumMetrics {
  timeToQuantumInteractive: number;
  totalRealityBlockingTime: number;
  quantumServerResponse: number;
  dimensionalLatency: number;
  quantumQueryTime: number;
}
```

## MONITORING IMPLEMENTATION

```typescript
// Quantum Performance Monitoring
export function monitorQuantumPerformance() {
  // Quantum Vitals
  reportQuantumVitals((metric: QuantumMetric) => {
    analyzeQuantumMetric(metric);
  });

  // Custom Quantum Metrics
  measureQuantumMetrics();

  // Reality API Monitoring
  monitorQuantumEndpoints();

  // Quantum Database Monitoring
  monitorQuantumQueries();
}
```

## SUCCESS METRICS

### 1. Reality Performance
- Quantum coherence level
- Timeline synchronization rate
- Dimensional transfer speed
- Reality manifestation time

### 2. System Health
- Reality stream efficiency
- Quantum cache hit rate
- Timeline integrity index
- Dimensional stability score

Remember: Performance optimization is not just speed - it's the art of perfect reality manifestation.