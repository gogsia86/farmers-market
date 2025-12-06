#!/bin/bash
# 🔧 Quick Fix Script for Environment Variable Issues
# Farmers Market Platform - Fix NEXT_PUBLIC_APP_URL

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║           🔧 ENVIRONMENT VARIABLE FIX SCRIPT                       ║"
echo "║           Farmers Market Platform                                  ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << 'EOF'
# Application URLs
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3001

# Database Connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmersmarket"

# NextAuth Configuration
NEXTAUTH_SECRET="your-secret-key-change-this-to-a-secure-random-string-min-32-chars"

# Logging
LOG_LEVEL=info

# Optional: OpenAI API Key (for AI features)
# OPENAI_API_KEY=your-key-here

# Optional: Stripe Keys (for payments)
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
# STRIPE_SECRET_KEY=sk_test_...

# Optional: Cloudinary (for image uploads)
# CLOUDINARY_CLOUD_NAME=your-cloud-name
# CLOUDINARY_API_KEY=your-api-key
# CLOUDINARY_API_SECRET=your-api-secret
EOF
    echo "✅ Created .env.local with correct settings"
else
    echo "📝 .env.local exists, checking NEXT_PUBLIC_APP_URL..."

    # Check if NEXT_PUBLIC_APP_URL exists in .env.local
    if grep -q "NEXT_PUBLIC_APP_URL" .env.local; then
        # Get current value
        current_url=$(grep "NEXT_PUBLIC_APP_URL" .env.local | cut -d '=' -f2 | tr -d '"' | tr -d "'")
        echo "   Current value: $current_url"

        # Check if it's set to port 3001
        if [[ $current_url == *"3001"* ]]; then
            echo "✅ NEXT_PUBLIC_APP_URL is already set to port 3001"
        else
            echo "⚠️  NEXT_PUBLIC_APP_URL is set to: $current_url"
            echo "   Updating to: http://localhost:3001"

            # Backup original
            cp .env.local .env.local.backup
            echo "   📦 Backup created: .env.local.backup"

            # Update the URL
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                sed -i '' 's|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=http://localhost:3001|' .env.local
            else
                # Linux/Windows Git Bash
                sed -i 's|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=http://localhost:3001|' .env.local
            fi

            echo "✅ Updated NEXT_PUBLIC_APP_URL to http://localhost:3001"
        fi
    else
        echo "⚠️  NEXT_PUBLIC_APP_URL not found in .env.local"
        echo "   Adding it now..."

        # Backup original
        cp .env.local .env.local.backup
        echo "   📦 Backup created: .env.local.backup"

        # Add the variable
        echo "" >> .env.local
        echo "# Application URL (added by fix script)" >> .env.local
        echo "NEXT_PUBLIC_APP_URL=http://localhost:3001" >> .env.local

        echo "✅ Added NEXT_PUBLIC_APP_URL=http://localhost:3001"
    fi
fi

# Also check NEXTAUTH_URL
echo ""
echo "📝 Checking NEXTAUTH_URL..."
if grep -q "NEXTAUTH_URL" .env.local; then
    current_auth_url=$(grep "NEXTAUTH_URL" .env.local | cut -d '=' -f2 | tr -d '"' | tr -d "'")
    echo "   Current value: $current_auth_url"

    if [[ $current_auth_url == *"3001"* ]]; then
        echo "✅ NEXTAUTH_URL is already set to port 3001"
    else
        echo "⚠️  Updating NEXTAUTH_URL to port 3001"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' 's|NEXTAUTH_URL=.*|NEXTAUTH_URL=http://localhost:3001|' .env.local
        else
            sed -i 's|NEXTAUTH_URL=.*|NEXTAUTH_URL=http://localhost:3001|' .env.local
        fi
        echo "✅ Updated NEXTAUTH_URL"
    fi
else
    echo "   Adding NEXTAUTH_URL..."
    echo "NEXTAUTH_URL=http://localhost:3001" >> .env.local
    echo "✅ Added NEXTAUTH_URL"
fi

# Display current configuration
echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║           📋 CURRENT CONFIGURATION                                 ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
grep -E "^(NEXT_PUBLIC_APP_URL|NEXTAUTH_URL|DATABASE_URL|NODE_ENV)" .env.local 2>/dev/null || echo "⚠️  Could not read configuration"

echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║           ✅ NEXT STEPS                                            ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo "1. Start the development server:"
echo "   npm run dev"
echo ""
echo "2. Or for HP OMEN optimization:"
echo "   npm run dev:omen"
echo ""
echo "3. Verify the API is working:"
echo "   curl http://localhost:3001/api/health"
echo ""
echo "4. Re-run diagnostics:"
echo "   npm run diagnose:api"
echo ""
echo "✅ Environment variables fixed!"
echo ""
