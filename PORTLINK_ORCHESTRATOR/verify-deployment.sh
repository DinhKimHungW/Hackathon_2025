#!/bin/bash

# ============================================================================
# PortLink Orchestrator - Deployment Verification Script
# ============================================================================
# This script verifies that the deployment is working correctly
# Usage: ./verify-deployment.sh [backend_url] [frontend_url]
# Example: ./verify-deployment.sh http://localhost:3000 http://localhost:8080

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default URLs
BACKEND_URL="${1:-http://localhost:3000}"
FRONTEND_URL="${2:-http://localhost:8080}"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   PortLink Orchestrator - Deployment Verification              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Backend URL:  ${BACKEND_URL}"
echo "Frontend URL: ${FRONTEND_URL}"
echo ""

# Function to check endpoint
check_endpoint() {
    local url=$1
    local name=$2
    local expected_status=${3:-200}
    
    echo -n "Checking ${name}... "
    
    if command -v curl &> /dev/null; then
        status=$(curl -s -o /dev/null -w "%{http_code}" "${url}" || echo "000")
    elif command -v wget &> /dev/null; then
        status=$(wget --spider -S "${url}" 2>&1 | grep "HTTP/" | awk '{print $2}' | head -1 || echo "000")
    else
        echo -e "${RED}SKIP${NC} (curl/wget not found)"
        return
    fi
    
    if [ "$status" = "$expected_status" ] || [ "$status" = "200" ]; then
        echo -e "${GREEN}✓ OK${NC} (HTTP ${status})"
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP ${status})"
    fi
}

# Function to check JSON response
check_json_endpoint() {
    local url=$1
    local name=$2
    local expected_field=$3
    
    echo -n "Checking ${name}... "
    
    if command -v curl &> /dev/null; then
        response=$(curl -s "${url}" || echo "{}")
        
        if echo "${response}" | grep -q "${expected_field}"; then
            echo -e "${GREEN}✓ OK${NC}"
        else
            echo -e "${RED}✗ FAIL${NC} (field '${expected_field}' not found)"
        fi
    else
        echo -e "${YELLOW}SKIP${NC} (curl not found)"
    fi
}

echo "════════════════════════════════════════════════════════════════"
echo "Frontend Checks"
echo "════════════════════════════════════════════════════════════════"
check_endpoint "${FRONTEND_URL}" "Frontend Homepage"
check_endpoint "${FRONTEND_URL}/assets" "Static Assets" "301"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "Backend API Checks"
echo "════════════════════════════════════════════════════════════════"
check_endpoint "${BACKEND_URL}/api/v1/auth/verify" "Auth Endpoint" "401"
check_endpoint "${BACKEND_URL}/health" "Health Endpoint"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "Service Status"
echo "════════════════════════════════════════════════════════════════"

if command -v docker &> /dev/null; then
    echo "Docker containers:"
    if docker compose ps 2>/dev/null | grep -q "Up"; then
        docker compose ps | grep "Up" | while read line; do
            echo -e "${GREEN}✓${NC} ${line}"
        done
    else
        echo -e "${YELLOW}No running containers found (using 'docker compose ps')${NC}"
    fi
else
    echo -e "${YELLOW}Docker not available - skipping container checks${NC}"
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "Next Steps"
echo "════════════════════════════════════════════════════════════════"
echo "1. Access Frontend: ${FRONTEND_URL}"
echo "2. Access Backend API: ${BACKEND_URL}/api/v1"
echo "3. Login with:"
echo "   - Email: admin@portlink.com"
echo "   - Password: Admin@123"
echo ""
echo "4. View logs:"
echo "   docker compose logs -f"
echo ""
echo "5. Stop services:"
echo "   docker compose down"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo -e "${GREEN}Verification Complete!${NC}"
echo "════════════════════════════════════════════════════════════════"
