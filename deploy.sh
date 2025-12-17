#!/bin/bash
# =============================================================================
# Deployment Script for Vibe Code + Trigger.dev + e2b
# =============================================================================

set -e  # Exit on error

echo " Vibe Code Deployment Script"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check prerequisites
print_step "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi
print_success "Node.js installed: $(node --version)"

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_success "npm installed: $(npm --version)"

if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not installed. Installing..."
    npm install -g vercel
fi
print_success "Vercel CLI installed: $(vercel --version)"

if ! command -v git &> /dev/null; then
    print_error "Git is not installed"
    exit 1
fi
print_success "Git installed: $(git --version)"

echo ""
print_step "Checking environment variables..."

if [ ! -f ".env.local" ]; then
    print_warning ".env.local not found. Please create it from env.example"
    echo ""
    echo "Run: cp env.example .env.local"
    echo "Then edit .env.local with your actual API keys"
    exit 1
fi
print_success ".env.local found"

# Check for required environment variables
source .env.local

if [ -z "$TRIGGER_API_KEY" ]; then
    print_error "TRIGGER_API_KEY not set in .env.local"
    exit 1
fi
print_success "TRIGGER_API_KEY is set"

if [ -z "$E2B_API_KEY" ]; then
    print_error "E2B_API_KEY not set in .env.local"
    exit 1
fi
print_success "E2B_API_KEY is set"

echo ""
print_step "Installing dependencies..."
npm install
print_success "Dependencies installed"

echo ""
print_step "Building project..."
npm run build
print_success "Build completed"

echo ""
print_step "Deploying Trigger.dev tasks..."
cd apps/api
npx trigger.dev@latest deploy
cd ../..
print_success "Trigger.dev tasks deployed"

echo ""
print_step "Deploying API to Vercel..."
cd apps/api
vercel --prod --yes
API_URL=$(vercel --prod 2>&1 | grep -o 'https://[^ ]*' | tail -1)
cd ../..
print_success "API deployed to: $API_URL"

echo ""
print_step "Deploying Web to Vercel..."
cd apps/web
# Set the API URL as environment variable
vercel env add NEXT_PUBLIC_API_URL production <<< "$API_URL"
vercel --prod --yes
WEB_URL=$(vercel --prod 2>&1 | grep -o 'https://[^ ]*' | tail -1)
cd ../..
print_success "Web deployed to: $WEB_URL"

echo ""
echo "================================"
print_success "Deployment Complete! "
echo "================================"
echo ""
echo "📱 Your URLs:"
echo "   Frontend: $WEB_URL"
echo "   API: $API_URL"
echo ""
echo "🔍 Next Steps:"
echo "   1. Open $WEB_URL in your browser"
echo "   2. Test code execution"
echo "   3. Monitor logs in Vercel and Trigger.dev dashboards"
echo ""
print_warning "Don't forget to:"
echo "   - Set CORS_ORIGIN in Vercel to allow your frontend URL"
echo "   - Update environment variables in Vercel dashboard if needed"
echo "   - Set up monitoring and alerts"
echo ""

