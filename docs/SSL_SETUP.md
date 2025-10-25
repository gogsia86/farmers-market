# SSL/TLS Configuration Guide

This guide explains how to set up SSL/TLS certificates for the production environment.

## Certificate Options

1. **Let's Encrypt (Recommended)**
   - Free, automated, and trusted certificates
   - Auto-renewal every 90 days
   - Perfect for most deployments

2. **Manual SSL Certificate**
   - For custom certificate authorities
   - Requires manual renewal
   - Use when specific security requirements exist

## Let's Encrypt Setup

1. Install Certbot:

```bash
sudo apt-get update
sudo apt-get install certbot
```

2. Generate certificate:

```bash
sudo certbot certonly --standalone -d your-domain.com
```

3. Certificate locations:

- Private key: `/etc/letsencrypt/live/your-domain.com/privkey.pem`
- Full chain: `/etc/letsencrypt/live/your-domain.com/fullchain.pem`

4. Auto-renewal:

```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## Next.js Configuration

Update `next.config.ts`:

```typescript
const nextConfig = {
  server: {
    https: {
      key: process.env.SSL_PRIVATE_KEY_PATH,
      cert: process.env.SSL_CERTIFICATE_PATH,
    },
  },
};

export default nextConfig;
```

## Security Headers

```typescript
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
];
```
