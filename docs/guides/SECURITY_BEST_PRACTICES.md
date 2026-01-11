# 🔒 Security Best Practices

> **Comprehensive security standards and guidelines for the Farmers Market Platform**  
> **Version:** 1.0.0  
> **Last Updated:** January 2025  
> **Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Security Principles](#security-principles)
3. [OWASP Top 10 Mitigation](#owasp-top-10-mitigation)
4. [Authentication & Authorization](#authentication--authorization)
5. [Input Validation & Sanitization](#input-validation--sanitization)
6. [Data Protection](#data-protection)
7. [API Security](#api-security)
8. [Database Security](#database-security)
9. [Secrets Management](#secrets-management)
10. [Security Headers](#security-headers)
11. [Rate Limiting & DDoS Protection](#rate-limiting--ddos-protection)
12. [File Upload Security](#file-upload-security)
13. [Dependency Security](#dependency-security)
14. [Logging & Monitoring](#logging--monitoring)
15. [Incident Response](#incident-response)
16. [Security Checklist](#security-checklist)
17. [Quick Reference](#quick-reference)

---

## 🎯 Overview

### Purpose

This document establishes comprehensive security standards for the Farmers Market Platform, ensuring:

- **Data Protection**: Safeguarding user data and privacy
- **Access Control**: Proper authentication and authorization
- **Attack Prevention**: Protection against common vulnerabilities
- **Compliance**: Meeting security standards and regulations
- **Incident Response**: Rapid detection and response to security events

### Security Stack

```yaml
authentication: NextAuth v5 (JWT + Session)
authorization: RBAC (Role-Based Access Control)
validation: Zod schemas
sanitization: DOMPurify + xss-filters
encryption: bcrypt (passwords), AES-256-GCM (data)
secrets: Vercel Environment Variables + Vault
headers: helmet.js + custom CSP
rate_limiting: Redis + upstash/ratelimit
monitoring: Sentry + Custom security events
ssl_tls: Vercel automatic HTTPS
dependency_scanning: npm audit + Snyk
```

### Security Standards

- **OWASP Top 10 Compliance**
- **GDPR & CCPA Ready**
- **PCI DSS Level 1** (for payment processing)
- **SOC 2 Type II** (infrastructure)
- **Zero Trust Architecture**

---

## 🛡️ Security Principles

### Defense in Depth

Implement multiple layers of security:

```
┌─────────────────────────────────┐
│   User Interface (CSP, XSS)     │  Layer 7: Client-side protection
├─────────────────────────────────┤
│   API Gateway (Rate Limiting)   │  Layer 6: Request throttling
├─────────────────────────────────┤
│   Authentication (NextAuth)     │  Layer 5: Identity verification
├─────────────────────────────────┤
│   Authorization (RBAC)          │  Layer 4: Access control
├─────────────────────────────────┤
│   Input Validation (Zod)        │  Layer 3: Data validation
├─────────────────────────────────┤
│   Business Logic (Services)     │  Layer 2: Secure operations
├─────────────────────────────────┤
│   Data Layer (Encrypted DB)     │  Layer 1: Data at rest
└─────────────────────────────────┘
```

### Principle of Least Privilege

```typescript
// ✅ GOOD: Minimal permissions
const user = await database.user.findUnique({
  where: { id },
  select: {
    id: true,
    name: true,
    email: true
    // Don't expose password, tokens, etc.
  }
});

// ❌ BAD: Over-exposure
const user = await database.user.findUnique({
  where: { id },
  include: { 
    sessions: true,  // Exposes session tokens
    apiKeys: true,   // Exposes API keys
    password: true   // Exposes password hash
  }
});
```

### Fail Securely

```typescript
// ✅ GOOD: Fail closed
export async function requireAuth(request: NextRequest) {
  try {
    const session = await getSession(request);
    
    if (!session || !session.user) {
      throw new UnauthorizedError();
    }
    
    return session;
  } catch (error) {
    // Log error but don't expose details
    logger.error('Authentication failed', { error });
    throw new UnauthorizedError('Authentication required');
  }
}

// ❌ BAD: Fail open
export async function requireAuth(request: NextRequest) {
  try {
    const session = await getSession(request);
    return session;
  } catch (error) {
    // Dangerous: allows access on error
    return { user: { role: 'guest' } };
  }
}
```

### Security by Default

```typescript
// lib/config/security.ts
export const SECURITY_DEFAULTS = {
  // Passwords
  MIN_PASSWORD_LENGTH: 12,
  PASSWORD_REQUIRE_SPECIAL: true,
  PASSWORD_REQUIRE_NUMBER: true,
  PASSWORD_REQUIRE_UPPERCASE: true,
  
  // Sessions
  SESSION_DURATION: 60 * 60 * 24 * 7, // 7 days
  SESSION_ROTATION_ENABLED: true,
  
  // Rate limiting
  RATE_LIMIT_REQUESTS: 100,
  RATE_LIMIT_WINDOW: 60 * 15, // 15 minutes
  
  // API
  API_CORS_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || [],
  API_MAX_PAYLOAD_SIZE: 1024 * 1024 * 10, // 10MB
  
  // File uploads
  MAX_FILE_SIZE: 1024 * 1024 * 5, // 5MB
  ALLOWED_FILE_TYPES: ['.jpg', '.jpeg', '.png', '.pdf'],
  
  // Headers
  HSTS_MAX_AGE: 31536000, // 1 year
  CSP_ENABLED: true
} as const;
```

---

## 🚨 OWASP Top 10 Mitigation

### A01:2021 – Broken Access Control

**Risk**: Users accessing resources they shouldn't have access to.

#### Mitigation Strategy

```typescript
// middleware/auth.middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * Authentication middleware
 * Verifies user is logged in
 */
export async function requireAuth(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  return session;
}

/**
 * Authorization middleware
 * Verifies user has required role
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: string[]
) {
  const session = await requireAuth(request);
  
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }
  
  return session;
}

/**
 * Resource ownership middleware
 * Verifies user owns the resource
 */
export async function requireOwnership(
  userId: string,
  resourceId: string,
  resourceType: 'farm' | 'product' | 'order'
) {
  const isOwner = await checkOwnership(userId, resourceId, resourceType);
  
  if (!isOwner) {
    throw new ForbiddenError('You do not own this resource');
  }
}
```

#### Implementation Example

```typescript
// app/api/v1/farms/[id]/route.ts
import { requireAuth, requireOwnership } from '@/middleware/auth.middleware';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. Verify authentication
  const session = await requireAuth(request);
  
  // 2. Verify ownership
  await requireOwnership(session.user.id, params.id, 'farm');
  
  // 3. Proceed with update
  const data = await request.json();
  const farm = await farmService.updateFarm(params.id, data);
  
  return NextResponse.json({ success: true, data: farm });
}
```

---

### A02:2021 – Cryptographic Failures

**Risk**: Sensitive data exposed due to weak or missing encryption.

#### Password Security

```typescript
// lib/auth/password.ts
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Password validation schema
export const PasswordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[0-9]/, 'Password must contain number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain special character');

/**
 * Hash password with bcrypt (cost factor: 12)
 */
export async function hashPassword(password: string): Promise<string> {
  // Validate password strength
  PasswordSchema.parse(password);
  
  // Hash with salt rounds = 12 (recommended)
  return await bcrypt.hash(password, 12);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Check if password has been compromised (HIBP API)
 */
export async function checkPasswordBreach(
  password: string
): Promise<boolean> {
  const sha1 = crypto
    .createHash('sha1')
    .update(password)
    .digest('hex')
    .toUpperCase();
  
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);
  
  const response = await fetch(
    `https://api.pwnedpasswords.com/range/${prefix}`
  );
  
  const hashes = await response.text();
  return hashes.includes(suffix);
}
```

#### Data Encryption

```typescript
// lib/crypto/encryption.ts
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'); // 32 bytes
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypt sensitive data
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encryptedData: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Usage example
const encryptedSSN = encrypt(user.ssn);
await database.user.update({
  where: { id: user.id },
  data: { ssn: encryptedSSN }
});
```

---

### A03:2021 – Injection

**Risk**: SQL, NoSQL, or command injection attacks.

#### SQL Injection Prevention

```typescript
// ✅ GOOD: Parameterized queries (Prisma)
const users = await database.user.findMany({
  where: {
    email: { contains: userInput } // Automatically escaped
  }
});

// ✅ GOOD: Raw queries with parameters
const users = await database.$queryRaw`
  SELECT * FROM "User"
  WHERE email LIKE ${`%${userInput}%`}
`;

// ❌ DANGEROUS: String concatenation
const users = await database.$queryRawUnsafe(
  `SELECT * FROM "User" WHERE email = '${userInput}'`
);
// Vulnerable to: ' OR '1'='1
```

#### NoSQL Injection Prevention

```typescript
// ✅ GOOD: Type validation
import { z } from 'zod';

const QuerySchema = z.object({
  email: z.string().email(),
  age: z.number().int().positive()
});

export async function searchUsers(query: unknown) {
  // Validate and sanitize input
  const validated = QuerySchema.parse(query);
  
  return await database.user.findMany({
    where: validated
  });
}

// ❌ DANGEROUS: Direct object usage
export async function searchUsers(query: any) {
  return await database.user.findMany({
    where: query // Could be: { $where: "this.password.length > 0" }
  });
}
```

#### Command Injection Prevention

```typescript
// ✅ GOOD: Avoid shell commands, use native Node.js
import { promises as fs } from 'fs';
import path from 'path';

export async function readUserFile(filename: string) {
  // Validate filename
  if (!/^[a-zA-Z0-9_-]+\.txt$/.test(filename)) {
    throw new Error('Invalid filename');
  }
  
  // Use path.join to prevent directory traversal
  const safePath = path.join(UPLOAD_DIR, filename);
  
  // Verify path is within upload directory
  if (!safePath.startsWith(UPLOAD_DIR)) {
    throw new Error('Path traversal detected');
  }
  
  return await fs.readFile(safePath, 'utf-8');
}

// ❌ DANGEROUS: Shell command with user input
import { exec } from 'child_process';

export async function readUserFile(filename: string) {
  return new Promise((resolve, reject) => {
    exec(`cat ${filename}`, (error, stdout) => {
      // Vulnerable to: file.txt; rm -rf /
      if (error) reject(error);
      else resolve(stdout);
    });
  });
}
```

---

### A04:2021 – Insecure Design

**Risk**: Missing or ineffective security controls by design.

#### Secure Architecture Patterns

```typescript
// lib/patterns/secure-service.pattern.ts

/**
 * Secure service base class
 * Enforces security by design
 */
export abstract class SecureService {
  protected abstract readonly resourceName: string;
  
  constructor(
    protected readonly logger: Logger,
    protected readonly auditLog: AuditLog
  ) {}
  
  /**
   * Validate input before processing
   */
  protected abstract validateInput(data: unknown): unknown;
  
  /**
   * Check authorization before action
   */
  protected abstract checkAuthorization(
    userId: string,
    action: string,
    resourceId?: string
  ): Promise<boolean>;
  
  /**
   * Execute action with security checks
   */
  protected async secureExecute<T>(
    userId: string,
    action: string,
    resourceId: string | undefined,
    operation: () => Promise<T>
  ): Promise<T> {
    // 1. Audit log
    const auditId = await this.auditLog.start({
      userId,
      action,
      resource: this.resourceName,
      resourceId
    });
    
    try {
      // 2. Authorization check
      const authorized = await this.checkAuthorization(
        userId,
        action,
        resourceId
      );
      
      if (!authorized) {
        throw new ForbiddenError('Unauthorized action');
      }
      
      // 3. Execute operation
      const result = await operation();
      
      // 4. Log success
      await this.auditLog.success(auditId, { result });
      
      return result;
      
    } catch (error) {
      // 5. Log failure
      await this.auditLog.failure(auditId, { error });
      throw error;
    }
  }
}

// Implementation example
export class FarmService extends SecureService {
  protected readonly resourceName = 'farm';
  
  protected validateInput(data: unknown) {
    return CreateFarmSchema.parse(data);
  }
  
  protected async checkAuthorization(
    userId: string,
    action: string,
    farmId?: string
  ): Promise<boolean> {
    if (action === 'create') {
      // Anyone with FARMER role can create
      const user = await database.user.findUnique({ where: { id: userId } });
      return user?.role === 'FARMER';
    }
    
    if (action === 'update' && farmId) {
      // Only farm owner can update
      const farm = await database.farm.findUnique({ where: { id: farmId } });
      return farm?.ownerId === userId;
    }
    
    return false;
  }
  
  async createFarm(userId: string, data: unknown) {
    return this.secureExecute(
      userId,
      'create',
      undefined,
      async () => {
        const validated = this.validateInput(data);
        return await database.farm.create({ data: validated });
      }
    );
  }
}
```

---

### A05:2021 – Security Misconfiguration

**Risk**: Insecure default configurations, incomplete setups.

#### Secure Configuration Management

```typescript
// lib/config/security-headers.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function applySecurityHeaders(response: NextResponse) {
  // Strict Transport Security (HSTS)
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.stripe.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  );
  
  // X-Frame-Options
  response.headers.set('X-Frame-Options', 'DENY');
  
  // X-Content-Type-Options
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // X-XSS-Protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer-Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions-Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
  
  return response;
}

// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  return applySecurityHeaders(response);
}
```

#### Environment Variable Validation

```typescript
// lib/config/env.ts
import { z } from 'zod';

const EnvSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Authentication
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  
  // Encryption
  ENCRYPTION_KEY: z.string().length(64), // 32 bytes in hex
  
  // API Keys (never commit!)
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  SENDGRID_API_KEY: z.string().startsWith('SG.'),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']),
  
  // Security
  ALLOWED_ORIGINS: z.string(),
  RATE_LIMIT_ENABLED: z.string().transform(val => val === 'true')
});

/**
 * Validate environment variables at startup
 */
export function validateEnvironment() {
  try {
    return EnvSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment configuration:');
    console.error(error);
    process.exit(1);
  }
}

// Validate at startup
export const env = validateEnvironment();
```

---

### A06:2021 – Vulnerable and Outdated Components

**Risk**: Using components with known vulnerabilities.

#### Dependency Management

```json
// package.json
{
  "scripts": {
    "audit": "npm audit --audit-level=moderate",
    "audit:fix": "npm audit fix",
    "audit:prod": "npm audit --production",
    "deps:check": "npx npm-check-updates",
    "deps:update": "npx npm-check-updates -u"
  },
  "devDependencies": {
    "@snyk/cli": "^1.1200.0"
  }
}
```

#### Automated Security Scanning

```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  push:
    branches: [main, develop]
  pull_request:
  schedule:
    - cron: '0 0 * * 0' # Weekly

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run npm audit
        run: npm audit --audit-level=moderate
      
      - name: Run Snyk scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
      
      - name: OWASP Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'farmers-market-platform'
          path: '.'
          format: 'HTML'
      
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: security-reports
          path: dependency-check-report.html
```

---

### A07:2021 – Identification and Authentication Failures

**Risk**: Broken authentication allowing unauthorized access.

#### Secure Authentication Implementation

```typescript
// lib/auth/index.ts
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { database } from '@/lib/database';
import { verifyPassword } from '@/lib/auth/password';
import { rateLimit } from '@/lib/rate-limit';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(database),
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60    // Update every 24 hours
  },
  pages: {
    signIn: '/login',
    error: '/auth/error'
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }
        
        // Rate limiting by IP
        const ip = req.headers?.['x-forwarded-for'] || 'unknown';
        const rateLimitResult = await rateLimit({
          key: `login:${ip}`,
          limit: 5,
          window: 15 * 60 * 1000 // 15 minutes
        });
        
        if (!rateLimitResult.success) {
          throw new Error('Too many login attempts. Try again later.');
        }
        
        // Fetch user
        const user = await database.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          include: { roles: true }
        });
        
        if (!user || !user.password) {
          // Don't reveal if user exists
          throw new Error('Invalid credentials');
        }
        
        // Check if account is locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error('Account is temporarily locked');
        }
        
        // Verify password
        const isValid = await verifyPassword(
          credentials.password,
          user.password
        );
        
        if (!isValid) {
          // Increment failed attempts
          await database.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: { increment: 1 },
              lastFailedLogin: new Date(),
              // Lock account after 5 failed attempts
              lockedUntil: user.failedLoginAttempts >= 4
                ? new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
                : undefined
            }
          });
          
          throw new Error('Invalid credentials');
        }
        
        // Reset failed attempts on successful login
        await database.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lastFailedLogin: null,
            lockedUntil: null,
            lastLogin: new Date()
          }
        });
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.roles[0]?.name ?? 'CUSTOMER'
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      
      // Token rotation
      if (account) {
        token.accessToken = account.access_token;
      }
      
      return token;
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      
      return session;
    }
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      // Log successful login
      await database.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN',
          resource: 'session',
          status: 'SUCCESS'
        }
      });
    },
    
    async signOut({ token }) {
      // Log logout
      await database.auditLog.create({
        data: {
          userId: token.id as string,
          action: 'LOGOUT',
          resource: 'session',
          status: 'SUCCESS'
        }
      });
    }
  }
};

export const auth = () => NextAuth(authOptions);
```

#### Multi-Factor Authentication (MFA)

```typescript
// lib/auth/mfa.ts
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

/**
 * Generate MFA secret for user
 */
export async function generateMFASecret(user: User) {
  const secret = speakeasy.generateSecret({
    name: `Farmers Market (${user.email})`,
    issuer: 'Farmers Market Platform'
  });
  
  // Generate QR code
  const qrCode = await QRCode.toDataURL(secret.otpauth_url!);
  
  // Store secret (encrypted)
  await database.user.update({
    where: { id: user.id },
    data: {
      mfaSecret: encrypt(secret.base32),
      mfaEnabled: false // User must verify first
    }
  });
  
  return {
    secret: secret.base32,
    qrCode
  };
}

/**
 * Verify MFA token
 */
export async function verifyMFAToken(
  user: User,
  token: string
): Promise<boolean> {
  if (!user.mfaSecret) {
    return false;
  }
  
  const decryptedSecret = decrypt(user.mfaSecret);
  
  return speakeasy.totp.verify({
    secret: decryptedSecret,
    encoding: 'base32',
    token,
    window: 2 // Allow 2 time steps (60s) of variance
  });
}

/**
 * Enable MFA for user
 */
export async function enableMFA(userId: string, token: string) {
  const user = await database.user.findUnique({ where: { id: userId } });
  
  if (!user || !user.mfaSecret) {
    throw new Error('MFA not initialized');
  }
  
  const isValid = await verifyMFAToken(user, token);
  
  if (!isValid) {
    throw new Error('Invalid MFA token');
  }
  
  // Enable MFA
  await database.user.update({
    where: { id: userId },
    data: { mfaEnabled: true }
  });
  
  // Generate backup codes
  const backupCodes = Array.from({ length: 10 }, () =>
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );
  
  await database.mfaBackupCode.createMany({
    data: backupCodes.map(code => ({
      userId,
      code: hashPassword(code), // Hash backup codes
      used: false
    }))
  });
  
  return backupCodes;
}
```

---

### A08:2021 – Software and Data Integrity Failures

**Risk**: Insecure CI/CD, auto-updates, untrusted sources.

#### Code Signing & Verification

```typescript
// lib/integrity/verify.ts
import crypto from 'crypto';

/**
 * Verify integrity of downloaded files
 */
export async function verifyFileIntegrity(
  filePath: string,
  expectedHash: string,
  algorithm: 'sha256' | 'sha512' = 'sha256'
): Promise<boolean> {
  const fileBuffer = await fs.readFile(filePath);
  const hash = crypto
    .createHash(algorithm)
    .update(fileBuffer)
    .digest('hex');
  
  return hash === expectedHash;
}

/**
 * Verify package integrity before installation
 */
export async function verifyPackageIntegrity(
  packageName: string,
  version: string
): Promise<boolean> {
  const response = await fetch(
    `https://registry.npmjs.org/${packageName}/${version}`
  );
  
  const data = await response.json();
  
  // Check for known vulnerabilities
  const auditResponse = await fetch(
    'https://registry.npmjs.org/-/npm/v1/security/audits',
    {
      method: 'POST',
      body: JSON.stringify({
        [packageName]: version
      })
    }
  );
  
  const audit = await auditResponse.json();
  
  return audit.metadata.vulnerabilities.total === 0;
}
```

#### Subresource Integrity (SRI)

```tsx
// components/ExternalScript.tsx
export function ExternalScript({ src, integrity }: Props) {
  return (
    <script
      src={src}
      integrity={integrity}
      crossOrigin="anonymous"
    />
  );
}

// Usage
<ExternalScript
  src="https://cdn.example.com/library.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/ux..."
/>
```

---

### A09:2021 – Security Logging and Monitoring Failures

**Risk**: Insufficient logging, monitoring, or alerting.

#### Comprehensive Audit Logging

```typescript
// lib/audit/logger.ts
import { database } from '@/lib/database';
import { Sentry } from '@/lib/monitoring';

export interface AuditLogEntry {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  status: 'SUCCESS' | 'FAILURE';
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

export class AuditLogger {
  /**
   * Log security-relevant events
   */
  async log(entry: AuditLogEntry): Promise<void> {
    // Store in database
    await database.auditLog.create({
      data: {
        ...entry,
        timestamp: new Date(),
        metadata: entry.metadata ? JSON.stringify(entry.metadata) : undefined
      }
    });
    
    // Log to Sentry for alerting
    if (entry.status === 'FAILURE') {
      Sentry.captureMessage(`Security event: ${entry.action} failed`, {
        level: 'warning',
        extra: entry
      });
    }
    
    // Alert on critical events
    if (this.isCriticalEvent(entry)) {
      await this.sendSecurityAlert(entry);
    }
  }
  
  /**
   * Identify critical security events
   */
  private isCriticalEvent(entry: AuditLogEntry): boolean {
    const criticalActions = [
      'UNAUTHORIZED_ACCESS_ATTEMPT',
      'PRIVILEGE_ESCALATION',
      'DATA_EXPORT',
      'ADMIN_ACTION',
      'PASSWORD_RESET',
      'MFA_DISABLED'
    ];
    
    return criticalActions.includes(entry.action);
  }
  
  /**
   * Send real-time security alerts
   */
  private async sendSecurityAlert(entry: AuditLogEntry): Promise<void> {
    // Send to security team via multiple channels
    await Promise.all([
      this.sendSlackAlert(entry),
      this.sendEmailAlert(entry),
      this.sendPagerDutyAlert(entry)
    ]);
  }
}

export const auditLogger = new AuditLogger();

// Usage examples
await auditLogger.log({
  userId: user.id,
  action: 'LOGIN',
  resource: 'session',
  status: 'SUCCESS',
  ip: request.ip,
  userAgent: request.headers['user-agent']
});

await auditLogger.log({
  userId: user.id,
  action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
  resource: 'farm',
  resourceId: farmId,
  status: 'FAILURE',
  metadata: { reason: 'Insufficient permissions' }
});
```

#### Security Event Monitoring

```typescript
// lib/monitoring/security-monitor.ts
export class SecurityMonitor {
  /**
   * Detect suspicious patterns
   */
  async detectAnomalies(userId: string): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = [];
    
    // Check for rapid failed login attempts
    const failedLogins = await database.auditLog.count({
      where: {
        userId,
        action: 'LOGIN',
        status: 'FAILURE',
        timestamp: { gte: new Date(Date.now() - 15 * 60 * 1000) }
      }
    });
    
    if (failedLogins >= 5) {
      alerts.push({
        type: 'BRUTE_FORCE_ATTEMPT',
        severity: 'HIGH',
        userId,
        message: `${failedLogins} failed login attempts in 15 minutes`
      });
    }
    
    // Check for unusual access patterns
    const recentActions = await database.auditLog.findMany({
      where: {
        userId,
        timestamp: { gte: new Date(Date.now() - 60 * 60 * 1000) }
      }
    });
    
    const uniqueIPs = new Set(recentActions.map(a => a.ip)).size;
    
    if (uniqueIPs >= 5) {
      alerts.push({
        type: 'MULTIPLE_LOCATIONS',
        severity: 'MEDIUM',
        userId,
        message: `Access from ${uniqueIPs} different IPs in 1 hour`
      });
    }
    
    // Check for privilege escalation attempts
    const escalationAttempts = recentActions.filter(
      a => a.action === 'UNAUTHORIZED_ACCESS_ATTEMPT'
    );
    
    if (escalationAttempts.length >= 3) {
      alerts.push({
        type: 'PRIVILEGE_ESCALATION',
        severity: 'CRITICAL',
        userId,
        message: 'Multiple unauthorized access attempts detected'
      });
    }
    
    return alerts;
  }
  
  /**
   * Generate security report
   */
  async generateSecurityReport(
    startDate: Date,
    endDate: Date
  ): Promise<SecurityReport> {
    const logs = await database.auditLog.findMany({
      where: {
        timestamp: { gte: startDate, lte: endDate }
      }
    });
    
    return {
      totalEvents: logs.length,
      failedAttempts: logs.filter(l => l.status === 'FAILURE').length,
      uniqueUsers: new Set(logs.map(l => l.userId)).size,
      topActions: this.getTopActions(logs),
      securityIncidents: logs.filter(l => this.isCriticalEvent(l)).length,
      recommendations: await this.generateRecommendations(logs)
    };
  }
}
```

---

### A10:2021 – Server-Side Request Forgery (SSRF)

**Risk**: Server making malicious requests to internal resources.

#### SSRF Prevention

```typescript
// lib/security/ssrf-protection.ts
import { URL } from 'url';

const ALLOWED_PROTOCOLS = ['http:', 'https:'];
const BLOCKED_HOSTS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '169.254.169.254', // AWS metadata endpoint
  '::1'
];

const PRIVATE_IP_RANGES = [
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^fc00:/,
  /^fd00:/
];

/**
 * Validate URL for SSRF attacks
 */
export function validateURL(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    
    // Check protocol
    if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
      return false;
    }
    
    // Check for blocked hosts
    if (BLOCKED_HOSTS.includes(url.hostname)) {
      return false;
    }
    
    // Check for private IP ranges
    if (PRIVATE_IP_RANGES.some(range => range.test(url.hostname))) {
      return false;
    }
    
    // Check for IP address format
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(url.hostname)) {
      // Verify it's not a private IP
      const parts = url.hostname.split('.').map(Number);
      
      if (
        parts[0] === 10 ||
        parts[0] === 127 ||
        (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
        (parts[0] === 192 && parts[1] === 168)
      ) {
        return false;
      }
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Safe HTTP request function
 */
export async function safeFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  // Validate URL
  if (!validateURL(url)) {
    throw new Error('Invalid or blocked URL');
  }
  
  // Add timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      // Prevent redirects to internal resources
      redirect: 'manual'
    });
    
    // Check for redirects
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location && !validateURL(location)) {
        throw new Error('Redirect to blocked URL');
      }
    }
    
    return response;
  } finally {
    clearTimeout(timeout);
  }
}
```

---

## 🔐 Authentication & Authorization

### Session Management

```typescript
// lib/auth/session.ts
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SESSION_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET
);

export async function createSession(user: User): Promise<string> {
  const token = await new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .setJti(crypto.randomUUID()) // Unique token ID
    .sign(SESSION_SECRET);
  
  // Store session in database for revocation
  await database.session.create({
    data: {
      userId: user.id,
      token: hashToken(token),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });
  
  return token;
}

export async function verifySession(token: string): Promise<SessionPayload> {
  try {
    // Verify JWT signature and expiration
    const { payload } = await jwtVerify(token, SESSION_SECRET);
    
    // Check if session is revoked
    const session = await database.session.findUnique({
      where: { token: hashToken(token) }
    });
    
    if (!session || session.revokedAt) {
      throw new Error('Session revoked');
    }
    
    return payload as SessionPayload;
  } catch (error) {
    throw new UnauthorizedError('Invalid session');
  }
}

export async function revokeSession(token: string): Promise<void> {
  await database.session.update({
    where: { token: hashToken(token) },
    data: { revokedAt: new Date() }
  });
}

export async function revokeAllUserSessions(userId: string): Promise<void> {
  await database.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() }
  });
}
```

### Role-Based Access Control (RBAC)

```typescript
// lib/auth/rbac.ts
export enum Permission {
  // Farm permissions
  FARM_CREATE = 'farm:create',
  FARM_READ = 'farm:read',
  FARM_UPDATE = 'farm:update',
  FARM_DELETE = 'farm:delete',
  
  // Product permissions
  PRODUCT_CREATE = 'product:create',
  PRODUCT_READ = 'product:read',
  PRODUCT_UPDATE = 'product:update',
  PRODUCT_DELETE = 'product:delete',
  
  // Order permissions
  ORDER_CREATE = 'order:create',
  ORDER_READ = 'order:read',
  ORDER_UPDATE = 'order:update',
  ORDER_CANCEL = 'order:cancel',
  
  // Admin permissions
  USER_MANAGE = 'user:manage',
  FARM_APPROVE = 'farm:approve',
  ANALYTICS_VIEW = 'analytics:view'
}

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  CUSTOMER: [
    Permission.PRODUCT_READ,
    Permission.FARM_READ,
    Permission.ORDER_CREATE,
    Permission.ORDER_READ
  ],
  
  FARMER: [
    Permission.FARM_CREATE,
    Permission.FARM_READ,
    Permission.FARM_UPDATE,
    Permission.PRODUCT_CREATE,
    Permission.PRODUCT_READ,
    Permission.PRODUCT_UPDATE,
    Permission.PRODUCT_DELETE,
    Permission.ORDER_READ,
    Permission.ORDER_UPDATE
  ],
  
  ADMIN: Object.values(Permission) // All permissions
};

export function hasPermission(
  userRole: string,
  permission: Permission
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
}

export function requirePermission(
  userRole: string,
  permission: Permission
): void {
  if (!hasPermission(userRole, permission)) {
    throw new ForbiddenError(
      `Missing permission: ${permission}`
    );
  }
}

// Middleware usage
export async function requirePermissionMiddleware(
  request: NextRequest,
  permission: Permission
) {
  const session = await auth();
  
  if (!session?.user) {
    throw new UnauthorizedError();
  }
  
  requirePermission(session.user.role, permission);
  
  return session;
}
```

---

## 🛡️ Input Validation & Sanitization

### Comprehensive Validation

```typescript
// lib/validators/comprehensive.validator.ts
import { z } from 'zod';
import { isValidPhoneNumber } from 'libphonenumber-js';

// Custom validators
const phoneNumberValidator = z.string().refine(
  (value) => isValidPhoneNumber(value, 'US'),
  { message: 'Invalid phone number' }
);

const slugValidator = z.string()
  .min(3)
  .max(100)
  .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only');

const urlValidator = z.string()
  .url()
  .refine((url) => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }, 'Invalid URL protocol');

// Sanitization helpers
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a'],
    ALLOWED_ATTR: ['href', 'target']
  });
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

// Comprehensive user input schema
export const UserInputSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),
  
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .transform(email => email.trim()),
  
  phone: phoneNumberValidator.optional(),
  
  website: urlValidator.optional(),
  
  bio: z.string()
    .max(500, 'Bio must not exceed 500 characters')
    .transform(sanitizeHTML)
    .optional(),
  
  avatar: z.string()
    .url()
    .refine((url) => {
      const ext = url.split('.').pop()?.toLowerCase();
      return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
    }, 'Invalid image format')
    .optional()
});
```

---

## 🔒 Data Protection

### Data Classification

```typescript
// lib/data/classification.ts
export enum DataClassification {
  PUBLIC = 'PUBLIC',           // Public information
  INTERNAL = 'INTERNAL',       // Internal use only
  CONFIDENTIAL = 'CONFIDENTIAL', // Sensitive business data
  RESTRICTED = 'RESTRICTED'    // PII, payment data, credentials
}

export interface ClassifiedField {
  field: string;
  classification: DataClassification;
  encryption: boolean;
  masking: boolean;
  auditLog: boolean;
}

export const DATA_CLASSIFICATION: Record<string, ClassifiedField> = {
  // PUBLIC
  'farm.name': {
    field: 'farm.name',
    classification: DataClassification.PUBLIC,
    encryption: false,
    masking: false,
    auditLog: false
  },
  
  // INTERNAL
  'farm.analytics': {
    field: 'farm.analytics',
    classification: DataClassification.INTERNAL,
    encryption: false,
    masking: false,
    auditLog: true
  },
  
  // CONFIDENTIAL
  'user.email': {
    field: 'user.email',
    classification: DataClassification.CONFIDENTIAL,
    encryption: false,
    masking: true, // Show as j***@example.com
    auditLog: true
  },
  
  // RESTRICTED
  'user.password': {
    field: 'user.password',
    classification: DataClassification.RESTRICTED,
    encryption: true,
    masking: true,
    auditLog: true
  },
  
  'payment.cardNumber': {
    field: 'payment.cardNumber',
    classification: DataClassification.RESTRICTED,
    encryption: true,
    masking: true, // Show as **** **** **** 1234
    auditLog: true
  }
};
```

### Data Masking

```typescript
// lib/data/masking.ts
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  
  return `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length === 10) {
    return `(***) ***-${digits.slice(-4)}`;
  }
  
  return `***.***.***.${digits.slice(-4)}`;
}

export function maskCreditCard(cardNumber: string): string {
  const digits = cardNumber.replace(/\s/g, '');
  return `**** **** **** ${digits.slice(-4)}`;
}

export function maskSSN(ssn: string): string {
  const digits = ssn.replace(/\D/g, '');
  return `***-**-${digits.slice(-4)}`;
}

// Auto-mask based on classification
export function autoMask<T extends Record<string, any>>(
  data: T,
  classifications: Record<string, ClassifiedField>
): T {
  const masked = { ...data };
  
  for (const [key, value] of Object.entries(data)) {
    const classification = classifications[key];
    
    if (classification?.masking && typeof value === 'string') {
      if (key.includes('email')) {
        masked[key] = maskEmail(value);
      } else if (key.includes('phone')) {
        masked[key] = maskPhone(value);
      } else if (key.includes('card')) {
        masked[key] = maskCreditCard(value);
      } else if (key.includes('ssn')) {
        masked[key] = maskSSN(value);
      } else {
        // Generic masking
        masked[key] = value.slice(0, 2) + '*'.repeat(value.length - 4) + value.slice(-2);
      }
    }
  }
  
  return masked;
}
```

---

## 🚦 Rate Limiting & DDoS Protection

### Redis-Based Rate Limiting

```typescript
// lib/rate-limit/index.ts
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export interface RateLimitConfig {
  key: string;
  limit: number;
  window: number; // milliseconds
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export async function rateLimit(
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { key, limit, window } = config;
  const now = Date.now();
  const windowStart = now - window;
  
  // Use Redis sorted set for sliding window
  const pipeline = redis.pipeline();
  
  // Remove old entries
  pipeline.zremrangebyscore(key, 0, windowStart);
  
  // Add current request
  pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` });
  
  // Count requests in window
  pipeline.zcard(key);
  
  // Set expiration
  pipeline.expire(key, Math.ceil(window / 1000));
  
  const results = await pipeline.exec();
  const count = results[2] as number;
  
  const success = count <= limit;
  const reset = windowStart + window;
  
  return {
    success,
    limit,
    remaining: Math.max(0, limit - count),
    reset
  };
}

// Middleware
export async function rateLimitMiddleware(
  request: NextRequest,
  config: Omit<RateLimitConfig, 'key'>
) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const path = request.nextUrl.pathname;
  
  const result = await rateLimit({
    key: `ratelimit:${ip}:${path}`,
    ...config
  });
  
  if (!result.success) {
    return new NextResponse(
      JSON.stringify({
        error: 'Too many requests',
        retryAfter: Math.ceil((result.reset - Date.now()) / 1000)
      }),
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.reset.toString(),
          'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString()
        }
      }
    );
  }
  
  return null; // Allow request
}
```

### API Route Protection

```typescript
// app/api/v1/farms/route.ts
import { rateLimitMiddleware } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // Apply rate limit: 100 requests per 15 minutes
  const rateLimitResponse = await rateLimitMiddleware(request, {
    limit: 100,
    window: 15 * 60 * 1000
  });
  
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  
  // Continue with request
  const farms = await farmService.getAllFarms();
  return NextResponse.json({ success: true, data: farms });
}
```

---

## ✅ Security Checklist

### Development Phase

- [ ] All user inputs validated with Zod schemas
- [ ] Passwords hashed with bcrypt (cost factor ≥ 12)
- [ ] Sensitive data encrypted at rest
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (input sanitization, CSP)
- [ ] CSRF protection implemented
- [ ] Authentication with rate limiting
- [ ] Authorization checks on all routes
- [ ] Security headers configured
- [ ] Secrets stored in environment variables (never committed)
- [ ] Dependencies scanned for vulnerabilities
- [ ] Error messages don't leak sensitive info
- [ ] Audit logging for security events

### Pre-Deployment

- [ ] Security audit completed
- [ ] Penetration testing performed
- [ ] HTTPS/TLS enabled
- [ ] Security headers verified
- [ ] Rate limiting tested
- [ ] DDoS protection configured
- [ ] Backup and recovery tested
- [ ] Incident response plan documented
- [ ] Security monitoring enabled
- [ ] Dependency audit passed (npm audit)
- [ ] OWASP ZAP scan completed
- [ ] Code review with security focus

### Production

- [ ] Monitor security logs daily
- [ ] Review audit logs weekly
- [ ] Update dependencies monthly
- [ ] Security training for team quarterly
- [ ] Penetration testing annually
- [ ] Incident response drills semi-annually
- [ ] Review and update security policies annually

---

## 📚 Quick Reference

### Security Commands

```bash
# Dependency auditing
npm audit
npm audit fix
npm audit --production

# Snyk scanning
npx snyk test
npx snyk monitor

# OWASP Dependency Check
npm run security:check

# Generate security report
npm run security:report
```

### Common Vulnerabilities & Fixes

```typescript
// ❌ SQL Injection
const users = await db.$queryRawUnsafe(`SELECT * FROM User WHERE email = '${email}'`);

// ✅ Fix: Use parameterized queries
const users = await db.$queryRaw`SELECT * FROM User WHERE email = ${email}`;

// ❌ XSS
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Fix: Sanitize input
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />

// ❌ Weak password
if (password.length >= 6) { /* Valid */ }

// ✅ Fix: Strong password requirements
const PasswordSchema = z.string().min(12).regex(/[A-Z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/);

// ❌ Exposed secrets
const apiKey = 'sk_live_abc123';

// ✅ Fix: Environment variables
const apiKey = process.env.STRIPE_API_KEY;
```

---

## 📞 Support & Resources

### Internal Resources

- [Security Incident Response Plan](/docs/security/incident-response.md)
- [Security Training Materials](/docs/security/training/)
- [Vulnerability Disclosure Policy](/docs/security/disclosure.md)

### External Resources

- [OWASP Top 10](https://owasp.org/Top10/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

### Security Team

- **Security Officer**: security@farmersmarket.com
- **Incident Response**: incidents@farmersmarket.com
- **Bug Bounty**: bugbounty@farmersmarket.com

---

**Version History:**
- 1.0.0 (2025-01-10): Initial comprehensive security best practices

**Status:** ✅ Production Ready