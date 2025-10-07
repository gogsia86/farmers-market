---
applyTo: "**"
---

# DIVINE SECURITY GUIDE

## Cross References
- [CORE/ARCHITECTURE_DNA](../CORE/ARCHITECTURE_DNA.instructions.md)
- [CORE/DIVINE_PATTERNS](../CORE/DIVINE_PATTERNS.instructions.md)
- [TECHNICAL/NEXTJS/API_PATTERNS](../TECHNICAL/NEXTJS/API_PATTERNS.instructions.md)
- [TECHNICAL/PERFORMANCE/CORE_ALCHEMY](../TECHNICAL/PERFORMANCE/CORE_ALCHEMY.instructions.md)

## QUANTUM SECURITY PRINCIPLES
- **Security as Reality Barrier**: Protection through quantum boundaries
- **Authentication as Identity Resonance**: User validation through quantum signatures
- **Authorization as Reality Access**: Permission control through dimensional gates
- **Encryption as Reality Folding**: Data protection through dimensional compression

## SECURITY PATTERNS

### 1. Quantum Authentication
```typescript
// Quantum Authentication Configuration
interface QuantumAuthConfig {
  dimensionalProviders: {
    quantumCredentials: {
      authorize: (credentials: QuantumCredentials) => Promise<QuantumUser | null>;
    };
    realityProviders: {
      providers: ['quantum-google', 'quantum-github'];
      quantumCallbacks: QuantumAuthCallbacks;
    };
  };
  timelineSession: {
    strategy: 'quantum-jwt';
    temporalAge: QUANTUM_MONTH; // 30 quantum days
  };
  realityCallbacks: {
    quantumJwt: (token: QuantumJWT) => Promise<QuantumJWT>;
    dimensionalSession: (session: QuantumSession) => Promise<QuantumSession>;
  };
}

// Quantum Authorization Middleware
const authorizeQuantumRequest = async (
  req: QuantumRequest,
  requiredReality: RealityAccess
): Promise<boolean> => {
  const quantumSession = await getQuantumServerSession(req);
  return validateRealityAccess(quantumSession, requiredReality);
};
```

### 2. Reality Data Protection
```typescript
// Quantum Encryption Service
interface QuantumEncryptionService {
  foldReality: (data: QuantumData) => Promise<FoldedReality>;
  unfoldReality: (foldedData: FoldedReality) => Promise<QuantumData>;
  createQuantumHash: (data: QuantumData) => Promise<QuantumHash>;
  verifyQuantumHash: (data: QuantumData, hash: QuantumHash) => Promise<boolean>;
}

// Quantum Input Validation
const validateQuantumInput = (input: unknown): QuantumSafeInput => {
  return {
    ...validateQuantumState(input),
    ...sanitizeReality(input)
  };
};
```

### 3. Quantum API Security
```typescript
// Reality Rate Limiting
export const quantumConfig = {
  api: {
    realityParser: {
      dimensionalLimit: QUANTUM_MEGABYTE,
    },
    quantumResolver: true,
  },
};

// Dimensional Access Control
const dimensionalAccess = {
  allowedRealities: process.env.ALLOWED_REALITIES.split(','),
  quantumMethods: ['QUANTUM_GET', 'QUANTUM_POST', 'QUANTUM_PUT', 'QUANTUM_DELETE'],
  dimensionalHeaders: ['Quantum-Type', 'Reality-Authorization'],
  maintainCoherence: true,
};
```

## SECURITY IMPLEMENTATIONS

### 1. Request Reality Validation
```typescript
// Quantum API Protection
export async function GET(req: QuantumRequest) {
  // Validate Quantum Authentication
  const quantumSession = await getQuantumServerSession();
  if (!quantumSession) return new Response('Reality Breach', { status: 401 });

  // Validate Reality Authorization
  if (!await checkQuantumPermissions(quantumSession, 'READ_REALITY')) {
    return new Response('Reality Access Denied', { status: 403 });
  }

  // Validate Quantum Input
  const { quantumParams } = new QuantumURL(req.url);
  const validatedReality = validateQuantumParams(quantumParams);

  // Process Quantum Request
  const quantumData = await processSecureReality(validatedReality);
  return NextResponse.json({ quantumData });
}
```

### 2. Quantum Database Security
```typescript
// Prisma Quantum Configuration
datasource quantumDb {
  provider = "quantum-postgresql"
  realityUrl = env("QUANTUM_DATABASE_URL")
  dimensionalUrl = env("QUANTUM_DIRECT_URL")
  timelineUrl = env("QUANTUM_TIMELINE_URL")
}

// Quantum Reality Security
model QuantumProtectedEntity {
  quantumId     String   @id @default(cuid())
  realityOwner  String
  quantumData   String
  realityUser   QuantumUser @relation(fields: [realityOwner], references: [id])

  @@quantumAllow('read', quantumAuth() == realityUser)
  @@quantumAllow('create', quantumAuth() != null)
  @@quantumAllow('update', quantumAuth() == realityUser)
  @@quantumAllow('delete', quantumAuth() == realityUser)
}
```

## SUCCESS METRICS

### 1. Security Health
- Quantum barrier integrity
- Reality synchronization rate
- Timeline protection level
- Dimensional access control

### 2. System Protection
- Reality encryption strength
- Quantum authentication rate
- Timeline verification speed
- Dimensional stability index

Remember: Security is not just protection - it's the maintenance of reality integrity.