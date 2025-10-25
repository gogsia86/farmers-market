---
applyTo: "**/*"
description: "FR-022: Security & Compliance - Authentication (JWT 24-hr), authorization (RBAC), encryption (AES-256/TLS 1.3), PCI DSS (Stripe), GDPR, rate limiting, SQL injection/XSS prevention, quarterly security audits"
---

# FR-022: SECURITY & COMPLIANCE

**Fortress-Level Platform Protection**

---

## 📋 FEATURE METADATA

```yaml
Feature ID: FR-022
Priority: P0 - Critical
Effort: 34 story points (≈ 1.5 weeks)
Value: 100/100 (HIGHEST - non-negotiable)
Dependencies: FR-019 (Architecture)
```

---

## 🎯 KEY REQUIREMENTS

### Authentication

```yaml
JWT (JSON Web Tokens):
  - Expiry: 24 hours
  - Refresh tokens: 30 days (rotate on use)
  - Storage: httpOnly secure cookies (not localStorage)
  - Signing: RS256 (asymmetric) with private key rotation

Login Flow:
  1. User enters credentials
  2. Server validates (bcrypt password hash cost 12)
  3. Generate JWT: { userId, email, role, exp }
  4. Return: accessToken (24 hr), refreshToken (30 days)
  5. Client: Stores in httpOnly cookie

Token Refresh:
  - Before expiry: Client requests new token with refreshToken
  - Rotate: Issue new refreshToken, invalidate old one
  - Revocation: Store revoked tokens in Redis (blacklist)
```

### Authorization (RBAC)

```yaml
Roles:
  - CONSUMER: Browse farms, place orders, leave reviews
  - FARMER: Manage own farm, products, orders
  - ADMIN: Platform management, dispute resolution

Permission Enforcement:
  // Middleware
  function requireRole(allowedRoles) {
    return (req, res, next) => {
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      next();
    };
  }

  // Route protection
  app.put('/api/farms/:id',
    authenticate,
    requireRole(['FARMER', 'ADMIN']),
    checkFarmOwnership, // Farmers can only edit own farm
    updateFarm
  );
```

### Encryption

```yaml
At Rest (AES-256):
  - Database: PostgreSQL encryption enabled
  - Sensitive fields: Additional encryption (SSN, bank accounts)
  - Encryption key: AWS KMS (Key Management Service)

In Transit (TLS 1.3):
  - HTTPS only: Redirect HTTP → HTTPS
  - Certificate: Let's Encrypt auto-renewal
  - HSTS header: Strict-Transport-Security max-age=31536000
  - TLS 1.3: Latest protocol, disable TLS 1.0/1.1
```

### PCI DSS Compliance

```yaml
Level 1 Compliance (via Stripe):
  - Never store: Credit card numbers, CVV, expiry dates
  - Stripe Elements: Iframe for card input (PCI scope reduction)
  - Tokenization: Stripe returns token, store token only
  - SAQ-A: Self-assessment questionnaire (simplest)

Implementation:
  // Client
  const stripe = Stripe('pk_live_...');
  const cardElement = stripe.elements().create('card');

  const { token } = await stripe.createToken(cardElement);
  // Send token to server, not raw card data

  // Server
  await stripe.charges.create({
    amount: 5000,
    currency: 'usd',
    source: token, // Stripe token, not card number
  });
```

### GDPR Compliance

```yaml
Data Rights:
  - Right to access: Export all user data (JSON)
  - Right to deletion: Permanently delete account + data
  - Right to rectification: Edit personal information
  - Right to portability: Download data in machine-readable format

Consent Management:
  - Cookie consent: Banner with "Accept" or "Manage"
  - Marketing emails: Opt-in only, unsubscribe link
  - Data processing: Clear privacy policy

Data Retention:
  - Active accounts: Indefinite
  - Deleted accounts: 30-day grace period, then permanent deletion
  - Logs: 90 days retention, then auto-delete
```

### Rate Limiting

```yaml
Strategy:
  - Per IP: 100 requests/15 min (global)
  - Per user: 1000 requests/hour (authenticated)
  - Authentication: 5 login attempts/hour
  - API endpoints: Vary by endpoint (e.g., search 60/min)

Implementation (Redis):
  const rateLimit = require('express-rate-limit');

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests
    store: new RedisStore({ client: redisClient }),
    message: 'Too many requests, try again later.'
  });

  app.use('/api/', limiter);
```

### SQL Injection Prevention

```yaml
Parameterized Queries (Prisma ORM):
  // ✅ SAFE
  const user = await prisma.user.findUnique({
    where: { email: userInput }  // Prisma sanitizes
  });

  // ❌ DANGEROUS (never do this)
  const query = `SELECT * FROM users WHERE email = '${userInput}'`;

Input Validation:
  - Zod schemas: Validate all inputs
  - Type checking: Ensure string/number/email
  - Length limits: Prevent buffer overflow
```

### XSS Prevention

```yaml
Content Security Policy (CSP):
  Content-Security-Policy:
    default-src 'self';
    script-src 'self' 'unsafe-inline' <https://js.stripe.com;>
    img-src 'self' <https://cdn.farmersmarket.com;>
    style-src 'self' 'unsafe-inline';

Input Sanitization:
  import DOMPurify from 'dompurify';

  // User-generated content (reviews, farm descriptions)
  const sanitized = DOMPurify.sanitize(userInput);

Output Encoding:
  // React auto-escapes by default
  <div>{userInput}</div>  // Safe

  // Dangerous
  <div dangerouslySetInnerHTML={{ __html: userInput }} />  // Avoid
```

### Security Audits

```yaml
Frequency:
  - Quarterly: Automated vulnerability scans
  - Annually: Penetration testing by external firm
  - Continuous: Dependency scanning (Snyk, Dependabot)

Scope:
  - Network: Port scanning, firewall testing
  - Application: OWASP Top 10 vulnerabilities
  - Infrastructure: AWS security best practices
  - Code: Static analysis (ESLint, SonarQube)

Remediation:
  - Critical: Patch within 24 hours
  - High: Patch within 7 days
  - Medium: Patch within 30 days
  - Low: Address in next sprint
```

---

## 📊 SUCCESS METRICS

| Metric                    | Target                         |
| ------------------------- | ------------------------------ |
| Security incidents        | 0 major breaches               |
| Vulnerability remediation | <7 days avg (high severity)    |
| PCI DSS compliance        | 100% (annual audit)            |
| GDPR compliance           | 100% (data requests < 30 days) |

---

**Version**: v1.0.0
**Status**: ✅ Ready for Development
