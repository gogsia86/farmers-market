# Production Environment Secrets Setup

This guide explains how to set up the required secrets in GitHub Actions for the production environment.

## Required Secrets

Add the following secrets to your GitHub repository:

1. `PROD_DATABASE_URL`: Production database connection string
2. `PROD_NEXTAUTH_SECRET`: Secret key for NextAuth.js
3. `PROD_REDIS_URL`: Production Redis connection string
4. `PROD_WEATHER_API_KEY`: Weather API key
5. `PROD_ML_SERVICE_API_KEY`: ML service API key
6. `PROD_SENTRY_DSN`: Sentry DSN for error tracking
7. `PROD_SSL_PRIVATE_KEY`: SSL private key
8. `PROD_SSL_CERTIFICATE`: SSL certificate
9. `PROD_SSL_CA`: SSL certificate authority

## Setting up Secrets

1. Go to your repository's Settings
2. Navigate to Secrets and Variables > Actions
3. Click "New repository secret"
4. Add each secret with its corresponding value

## Environment Protection Rules

1. Go to Settings > Environments
2. Create a new environment called "production"
3. Add the following protection rules:
   - Required reviewers
   - Wait timer (recommended: 15 minutes)
   - Deployment branches (restrict to `main` branch)