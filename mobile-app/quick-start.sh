#!/bin/bash

# 🌾 Farmers Market Mobile App - Quick Start Script
# Automated setup and launch for divine agricultural development

set -e  # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌾 Farmers Market Mobile App - Quick Start"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}➜${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if we're in the mobile-app directory
if [ ! -f "package.json" ]; then
    print_error "Error: package.json not found!"
    print_warning "Please run this script from the mobile-app directory"
    exit 1
fi

print_success "Found mobile-app directory"
echo ""

# Step 1: Check Node.js
print_step "Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js $NODE_VERSION installed"
else
    print_error "Node.js not found!"
    print_warning "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi
echo ""

# Step 2: Install dependencies
print_step "Installing dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
    print_success "Dependencies installed"
else
    print_success "Dependencies already installed"
fi
echo ""

# Step 3: Create .env file
print_step "Setting up environment configuration..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success "Created .env file from template"
        print_warning "Please edit .env and set your API_BASE_URL"
        print_warning "For iOS Simulator: http://localhost:3001/api"
        print_warning "For Android Emulator: http://10.0.2.2:3001/api"
        print_warning "For Physical Device: http://YOUR_LOCAL_IP:3001/api"
        echo ""
        read -p "Press Enter to continue after editing .env..."
    else
        print_error ".env.example not found!"
        exit 1
    fi
else
    print_success ".env file already exists"
fi
echo ""

# Step 4: Check if backend is running
print_step "Checking backend API..."
API_URL="http://localhost:3001/api/health"
if curl -s --max-time 2 "$API_URL" > /dev/null 2>&1; then
    print_success "Backend API is running on http://localhost:3001"
else
    print_warning "Backend API not detected on http://localhost:3001"
    print_warning "Make sure to start the backend server in another terminal:"
    echo ""
    echo "  cd \"../\""
    echo "  npm run dev"
    echo ""
    read -p "Press Enter to continue anyway..."
fi
echo ""

# Step 5: Clear cache (optional)
print_step "Cleaning build cache..."
if [ -d ".expo" ]; then
    rm -rf .expo
    print_success "Cleared Expo cache"
fi

if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
    print_success "Cleared module cache"
fi
echo ""

# Step 6: Show next steps
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Setup Complete! Ready to start development"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 To start the mobile app:"
echo "   npm start"
echo ""
echo "   Then press:"
echo "   - 'i' for iOS Simulator"
echo "   - 'a' for Android Emulator"
echo "   - Scan QR code with Expo Go app"
echo ""
echo "🔧 Other useful commands:"
echo "   npm test          - Run tests"
echo "   npm run lint      - Check code quality"
echo "   npm run format    - Format code"
echo ""
echo "📚 Documentation:"
echo "   - START_DEVELOPMENT.md    - Immediate action plan"
echo "   - GETTING_STARTED.md      - Detailed setup guide"
echo "   - IMPLEMENTATION_STATUS.md - Current progress"
echo ""
echo "🌾 Happy coding! Build something divine!"
echo ""

# Ask if user wants to start the app now
read -p "Start the development server now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_success "Starting Expo development server..."
    echo ""
    npm start
fi
