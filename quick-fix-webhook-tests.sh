#!/bin/bash
# Quick fix for webhook test database issues

echo "🔧 Starting test database..."

# Start PostgreSQL container
docker run -d \
  --name farmers-market-test-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=test_password_123 \
  -e POSTGRES_DB=farmersmarket_test \
  -p 5433:5432 \
  postgres:16-alpine 2>/dev/null || docker start farmers-market-test-db

echo "⏳ Waiting for database to be ready..."
sleep 5

echo "🔄 Running migrations..."
DATABASE_URL="postgresql://postgres:test_password_123@localhost:5433/farmersmarket_test" npx prisma migrate deploy

echo "✅ Test database ready!"
echo ""
echo "Run webhook tests with:"
echo "  npm test -- webhook.integration.test.ts"
