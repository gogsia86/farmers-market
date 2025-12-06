#!/bin/sh
# ╔════════════════════════════════════════════════════════════════════╗
# ║ 🌾 FARMERS MARKET PLATFORM - WAIT FOR DATABASE SCRIPT             ║
# ║ Divine Agricultural E-Commerce System                              ║
# ║ Database connection verification and readiness check               ║
# ╚════════════════════════════════════════════════════════════════════╝

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
DB_HOST=${DB_HOST:-postgres}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-farmers_user}
DB_NAME=${DB_NAME:-farmers_market}
TIMEOUT=${TIMEOUT:-60}
RETRY_INTERVAL=${RETRY_INTERVAL:-2}

# Calculate max attempts
MAX_ATTEMPTS=$((TIMEOUT / RETRY_INTERVAL))
ATTEMPT=0

echo ""
echo "${CYAN}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo "${CYAN}║ 🔍 WAITING FOR DATABASE CONNECTION                                ║${NC}"
echo "${CYAN}╚════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "${CYAN}[INFO]${NC} Database Host: ${DB_HOST}"
echo "${CYAN}[INFO]${NC} Database Port: ${DB_PORT}"
echo "${CYAN}[INFO]${NC} Database Name: ${DB_NAME}"
echo "${CYAN}[INFO]${NC} Timeout: ${TIMEOUT}s"
echo ""

# Function to check if netcat is available
check_nc() {
    if command -v nc >/dev/null 2>&1; then
        return 0
    elif command -v netcat >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to check TCP connection
check_tcp_connection() {
    if check_nc; then
        nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null
    else
        # Fallback using /dev/tcp if nc is not available
        timeout 1 bash -c "cat < /dev/null > /dev/tcp/$DB_HOST/$DB_PORT" 2>/dev/null
    fi
}

# Wait for TCP connection
echo "${YELLOW}[WAIT]${NC} Waiting for database TCP connection..."
while ! check_tcp_connection; do
    ATTEMPT=$((ATTEMPT + 1))

    if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
        echo ""
        echo "${RED}[ERROR]${NC} Database connection timeout after ${TIMEOUT}s"
        echo "${RED}[ERROR]${NC} Could not connect to ${DB_HOST}:${DB_PORT}"
        echo ""
        echo "${YELLOW}[DEBUG]${NC} Troubleshooting tips:"
        echo "  1. Check if PostgreSQL container is running: docker ps"
        echo "  2. Check PostgreSQL logs: docker logs <postgres-container>"
        echo "  3. Verify DATABASE_URL environment variable"
        echo "  4. Check network connectivity between containers"
        echo ""
        exit 1
    fi

    printf "${YELLOW}[WAIT]${NC} Attempt %d/%d - Database not ready yet...\r" "$ATTEMPT" "$MAX_ATTEMPTS"
    sleep $RETRY_INTERVAL
done

echo ""
echo "${GREEN}[SUCCESS]${NC} Database TCP connection established!"
echo ""

# Additional check: Verify PostgreSQL is accepting connections
if command -v psql >/dev/null 2>&1; then
    echo "${YELLOW}[WAIT]${NC} Verifying PostgreSQL is accepting connections..."

    PSQL_ATTEMPT=0
    PSQL_MAX_ATTEMPTS=10

    while [ $PSQL_ATTEMPT -lt $PSQL_MAX_ATTEMPTS ]; do
        if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" >/dev/null 2>&1; then
            echo "${GREEN}[SUCCESS]${NC} PostgreSQL is accepting connections!"
            break
        fi

        PSQL_ATTEMPT=$((PSQL_ATTEMPT + 1))

        if [ $PSQL_ATTEMPT -ge $PSQL_MAX_ATTEMPTS ]; then
            echo "${YELLOW}[WARNING]${NC} PostgreSQL not fully ready, but continuing..."
            break
        fi

        printf "${YELLOW}[WAIT]${NC} PostgreSQL not ready (attempt %d/%d)...\r" "$PSQL_ATTEMPT" "$PSQL_MAX_ATTEMPTS"
        sleep 1
    done
    echo ""
fi

# Prisma-specific check if Prisma CLI is available
if command -v npx >/dev/null 2>&1 && [ -f "prisma/schema.prisma" ]; then
    echo "${YELLOW}[WAIT]${NC} Verifying Prisma can connect to database..."

    # Try to execute a simple query through Prisma
    if npx prisma db execute --stdin <<EOF 2>/dev/null
SELECT 1 as test;
EOF
    then
        echo "${GREEN}[SUCCESS]${NC} Prisma can connect to database!"
    else
        echo "${YELLOW}[WARNING]${NC} Prisma connection check failed, but continuing..."
        echo "${YELLOW}[INFO]${NC} This is normal if database migrations haven't run yet"
    fi
    echo ""
fi

# Final success message
echo "${GREEN}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo "${GREEN}║ ✅ DATABASE IS READY                                               ║${NC}"
echo "${GREEN}╚════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Execute command if provided as arguments
if [ $# -gt 0 ]; then
    echo "${CYAN}[INFO]${NC} Executing command: $@"
    echo ""
    exec "$@"
fi

exit 0
