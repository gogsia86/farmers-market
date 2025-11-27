#!/bin/bash

# 🔧 Update DATABASE_URL for Host Access
# This script updates DATABASE_URL to use 127.0.0.1 for host-based scripts

ENV_FILE=".env"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🔧 Updating DATABASE_URL for Host Access                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: .env file not found!"
    exit 1
fi

# Backup .env
BACKUP_FILE=".env.backup.$(date +%Y%m%d_%H%M%S)"
cp "$ENV_FILE" "$BACKUP_FILE"
echo "📦 Backup created: $BACKUP_FILE"
echo ""

# Current DATABASE_URL
CURRENT_URL=$(grep "^DATABASE_URL=" "$ENV_FILE" | cut -d'=' -f2- | tr -d '"')
echo "📊 Current DATABASE_URL:"
echo "   $CURRENT_URL"
echo ""

# New DATABASE_URL for host access
NEW_URL="postgresql://postgres:postgres@127.0.0.1:5432/farmersmarket"

# Update DATABASE_URL
if grep -q "^DATABASE_URL=" "$ENV_FILE"; then
    # Use different delimiter for sed to avoid conflicts with URL slashes
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"$NEW_URL\"|" "$ENV_FILE"
    echo "✅ DATABASE_URL updated successfully!"
else
    # Add if doesn't exist
    echo "" >> "$ENV_FILE"
    echo "# Database Connection (Host Access)" >> "$ENV_FILE"
    echo "DATABASE_URL=\"$NEW_URL\"" >> "$ENV_FILE"
    echo "✅ DATABASE_URL added successfully!"
fi

echo ""
echo "📊 New DATABASE_URL:"
echo "   $NEW_URL"
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✅ DATABASE_URL Updated Successfully                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "💡 Note: Use '127.0.0.1' for host scripts, 'db' for Docker containers"
echo ""
echo "🚀 You can now run: npm run monitor:daemon"
echo ""
