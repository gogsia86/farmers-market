#!/bin/sh
# ╔════════════════════════════════════════════════════════════════════╗
# ║ 🌾 FARMERS MARKET PLATFORM - HEALTH CHECK SCRIPT                  ║
# ║ Divine Agricultural E-Commerce System                              ║
# ║ Container health verification and monitoring                       ║
# ╚════════════════════════════════════════════════════════════════════╝

set -e

# Configuration
HEALTH_ENDPOINT="${HEALTH_ENDPOINT:-http://localhost:${PORT:-3000}/api/health}"
TIMEOUT=${HEALTHCHECK_TIMEOUT:-5}
MAX_RETRIES=${HEALTHCHECK_RETRIES:-3}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if curl is available
check_curl() {
    if command -v curl >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to check if wget is available
check_wget() {
    if command -v wget >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to make HTTP request with curl
check_health_curl() {
    response=$(curl -sf --max-time "$TIMEOUT" "$HEALTH_ENDPOINT" 2>/dev/null)
    status=$?

    if [ $status -eq 0 ]; then
        # Check if response contains success indicator
        if echo "$response" | grep -q '"success":true\|"status":"healthy"\|"ok":true'; then
            return 0
        else
            return 1
        fi
    else
        return 1
    fi
}

# Function to make HTTP request with wget
check_health_wget() {
    response=$(wget -q --timeout="$TIMEOUT" -O - "$HEALTH_ENDPOINT" 2>/dev/null)
    status=$?

    if [ $status -eq 0 ]; then
        if echo "$response" | grep -q '"success":true\|"status":"healthy"\|"ok":true'; then
            return 0
        else
            return 1
        fi
    else
        return 1
    fi
}

# Function to check if port is listening (fallback)
check_port() {
    PORT_TO_CHECK=${PORT:-3000}

    if command -v nc >/dev/null 2>&1; then
        nc -z localhost "$PORT_TO_CHECK" 2>/dev/null
        return $?
    elif command -v netcat >/dev/null 2>&1; then
        netcat -z localhost "$PORT_TO_CHECK" 2>/dev/null
        return $?
    else
        # Last resort: check if port is in use
        if [ -f "/proc/net/tcp" ]; then
            PORT_HEX=$(printf '%04X' "$PORT_TO_CHECK")
            grep -q ":${PORT_HEX} " /proc/net/tcp
            return $?
        fi
    fi

    return 1
}

# Main health check logic
perform_healthcheck() {
    local attempt=1

    while [ $attempt -le $MAX_RETRIES ]; do
        # Try curl first
        if check_curl; then
            if check_health_curl; then
                echo "${GREEN}✅ Application is healthy (curl)${NC}" >&2
                return 0
            fi
        # Try wget if curl fails
        elif check_wget; then
            if check_health_wget; then
                echo "${GREEN}✅ Application is healthy (wget)${NC}" >&2
                return 0
            fi
        # Fallback to port check
        else
            if check_port; then
                echo "${YELLOW}⚠️  Port is listening (limited check)${NC}" >&2
                return 0
            fi
        fi

        if [ $attempt -lt $MAX_RETRIES ]; then
            echo "${YELLOW}⏳ Health check attempt $attempt/$MAX_RETRIES failed, retrying...${NC}" >&2
            sleep 1
        fi

        attempt=$((attempt + 1))
    done

    echo "${RED}❌ Application is unhealthy after $MAX_RETRIES attempts${NC}" >&2
    return 1
}

# Check if we're running in Docker
is_docker() {
    [ -f /.dockerenv ] || grep -q docker /proc/1/cgroup 2>/dev/null
}

# Additional checks for production
if [ "$NODE_ENV" = "production" ]; then
    # Check if critical files exist
    if [ ! -f "package.json" ]; then
        echo "${RED}❌ package.json not found${NC}" >&2
        exit 1
    fi

    # Check if .next directory exists (for Next.js)
    if [ ! -d ".next" ]; then
        echo "${RED}❌ .next build directory not found${NC}" >&2
        exit 1
    fi
fi

# Perform the health check
if perform_healthcheck; then
    exit 0
else
    # Additional debugging info on failure
    if is_docker; then
        echo "" >&2
        echo "${YELLOW}[DEBUG] Health check details:${NC}" >&2
        echo "  Endpoint: $HEALTH_ENDPOINT" >&2
        echo "  Timeout: ${TIMEOUT}s" >&2
        echo "  Max Retries: $MAX_RETRIES" >&2
        echo "  Port: ${PORT:-3000}" >&2
        echo "  Environment: ${NODE_ENV:-production}" >&2
        echo "" >&2

        # Show process list
        if command -v ps >/dev/null 2>&1; then
            echo "${YELLOW}[DEBUG] Running processes:${NC}" >&2
            ps aux 2>/dev/null || ps 2>/dev/null || echo "  Cannot list processes" >&2
            echo "" >&2
        fi

        # Show listening ports
        if command -v netstat >/dev/null 2>&1; then
            echo "${YELLOW}[DEBUG] Listening ports:${NC}" >&2
            netstat -tuln 2>/dev/null | grep LISTEN || echo "  Cannot list ports" >&2
            echo "" >&2
        fi
    fi

    exit 1
fi
