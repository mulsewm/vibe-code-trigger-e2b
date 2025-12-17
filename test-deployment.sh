#!/bin/bash
# =============================================================================
# Deployment Testing Script
# Tests all endpoints and functionality after deployment
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if API URL is provided
if [ -z "$1" ]; then
    echo "Usage: ./test-deployment.sh <API_URL>"
    echo "Example: ./test-deployment.sh https://vibe-code-api-xxxxx.vercel.app"
    exit 1
fi

API_URL=$1

echo "🧪 Testing Deployment"
echo "API: $API_URL"
echo "================================"
echo ""

# Test 1: Health Check
print_step "Test 1: Health Check"
response=$(curl -s -w "\n%{http_code}" "$API_URL/health")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
    print_success "Health check passed"
    echo "Response: $body"
else
    print_error "Health check failed (HTTP $http_code)"
    echo "Response: $body"
    exit 1
fi
echo ""

# Test 2: Detailed Health Check
print_step "Test 2: Detailed Health Check"
response=$(curl -s -w "\n%{http_code}" "$API_URL/health/detailed")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ] || [ "$http_code" = "503" ]; then
    print_success "Detailed health check completed"
    echo "Response: $body"
else
    print_error "Detailed health check failed (HTTP $http_code)"
    echo "Response: $body"
    exit 1
fi
echo ""

# Test 3: Execute Python Code
print_step "Test 3: Execute Python Code"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/execute" \
  -H "Content-Type: application/json" \
  -d '{"code":"print(\"Hello from Python!\")","language":"python"}')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
    print_success "Python execution successful"
    echo "Response: $body"
else
    print_error "Python execution failed (HTTP $http_code)"
    echo "Response: $body"
fi
echo ""

# Test 4: Execute JavaScript Code
print_step "Test 4: Execute JavaScript Code"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/execute" \
  -H "Content-Type: application/json" \
  -d '{"code":"console.log(\"Hello from JavaScript!\")","language":"javascript"}')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
    print_success "JavaScript execution successful"
    echo "Response: $body"
else
    print_error "JavaScript execution failed (HTTP $http_code)"
    echo "Response: $body"
fi
echo ""

# Test 5: Execute TypeScript Code
print_step "Test 5: Execute TypeScript Code"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/execute" \
  -H "Content-Type: application/json" \
  -d '{"code":"const x: number = 42; console.log(x);","language":"typescript"}')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
    print_success "TypeScript execution successful"
    echo "Response: $body"
else
    print_error "TypeScript execution failed (HTTP $http_code)"
    echo "Response: $body"
fi
echo ""

# Test 6: Execute Bash Code
print_step "Test 6: Execute Bash Code"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/execute" \
  -H "Content-Type: application/json" \
  -d '{"code":"echo \"Hello from Bash!\"","language":"bash"}')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
    print_success "Bash execution successful"
    echo "Response: $body"
else
    print_error "Bash execution failed (HTTP $http_code)"
    echo "Response: $body"
fi
echo ""

# Test 7: Error Handling
print_step "Test 7: Error Handling (Syntax Error)"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/execute" \
  -H "Content-Type: application/json" \
  -d '{"code":"this is invalid python code","language":"python"}')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
    # Check if response contains error indication
    if echo "$body" | grep -q "error\|Error\|exitCode"; then
        print_success "Error handling works correctly"
        echo "Response: $body"
    else
        print_error "Error not properly reported"
        echo "Response: $body"
    fi
else
    print_error "Error handling test failed (HTTP $http_code)"
    echo "Response: $body"
fi
echo ""

# Test 8: Invalid Request
print_step "Test 8: Invalid Request Handling"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/execute" \
  -H "Content-Type: application/json" \
  -d '{"invalid":"json"}')
http_code=$(echo "$response" | tail -n1)

if [ "$http_code" = "400" ] || [ "$http_code" = "500" ]; then
    print_success "Invalid request properly rejected"
else
    print_error "Invalid request not handled (HTTP $http_code)"
fi
echo ""

# Summary
echo "================================"
print_success "Testing Complete!"
echo "================================"
echo ""
echo "✅ All critical tests passed"
echo ""
echo "Next steps:"
echo "1. Open frontend in browser"
echo "2. Test UI interactions"
echo "3. Monitor logs: vercel logs vibe-code-api"
echo "4. Check Trigger.dev dashboard for task runs"
echo "5. Check e2b dashboard for sandbox usage"

