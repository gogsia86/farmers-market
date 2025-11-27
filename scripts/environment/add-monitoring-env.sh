#!/bin/bash

# 🔧 Add Monitoring Environment Variables
# This script adds necessary environment variables for monitoring to .env file

ENV_FILE=".env"
BACKUP_FILE=".env.backup.$(date +%Y%m%d_%H%M%S)"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🔧 Adding Monitoring Environment Variables               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Create backup
if [ -f "$ENV_FILE" ]; then
    echo "📦 Creating backup: $BACKUP_FILE"
    cp "$ENV_FILE" "$BACKUP_FILE"
    echo "   ✅ Backup created"
    echo ""
else
    echo "⚠️  No .env file found, creating new one"
    touch "$ENV_FILE"
    echo ""
fi

# Environment variables to add
SLACK_WEBHOOK="https://hooks.slack.com/services/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"
SLACK_CHANNEL="#monitoring"
BASE_URL="http://localhost:3000"

echo "📝 Adding monitoring configuration..."

# Check and add SLACK_WEBHOOK_URL
if grep -q "^SLACK_WEBHOOK_URL=" "$ENV_FILE"; then
    echo "   ⚠️  SLACK_WEBHOOK_URL already exists, skipping"
else
    echo "" >> "$ENV_FILE"
    echo "# Monitoring & Notifications (Added $(date +%Y-%m-%d))" >> "$ENV_FILE"
    echo "SLACK_WEBHOOK_URL=\"$SLACK_WEBHOOK\"" >> "$ENV_FILE"
    echo "   ✅ Added SLACK_WEBHOOK_URL"
fi

# Check and add SLACK_CHANNEL
if grep -q "^SLACK_CHANNEL=" "$ENV_FILE"; then
    echo "   ⚠️  SLACK_CHANNEL already exists, skipping"
else
    echo "SLACK_CHANNEL=\"$SLACK_CHANNEL\"" >> "$ENV_FILE"
    echo "   ✅ Added SLACK_CHANNEL"
fi

# Check and add DISCORD_WEBHOOK_URL (empty)
if grep -q "^DISCORD_WEBHOOK_URL=" "$ENV_FILE"; then
    echo "   ⚠️  DISCORD_WEBHOOK_URL already exists, skipping"
else
    echo "DISCORD_WEBHOOK_URL=\"\"" >> "$ENV_FILE"
    echo "   ✅ Added DISCORD_WEBHOOK_URL (empty)"
fi

# Check and add BASE_URL if not exists
if grep -q "^BASE_URL=" "$ENV_FILE"; then
    echo "   ℹ️  BASE_URL already exists, keeping existing value"
else
    echo "" >> "$ENV_FILE"
    echo "# Application Base URL" >> "$ENV_FILE"
    echo "BASE_URL=\"$BASE_URL\"" >> "$ENV_FILE"
    echo "   ✅ Added BASE_URL"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✅ Environment Variables Added Successfully              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Summary:"
echo "   ✅ SLACK_WEBHOOK_URL configured"
echo "   ✅ SLACK_CHANNEL set to #monitoring"
echo "   ✅ DISCORD_WEBHOOK_URL placeholder added"
echo "   ✅ BASE_URL configured"
echo ""
echo "💾 Backup saved to: $BACKUP_FILE"
echo ""
echo "🚀 Next steps:"
echo "   1. Verify .env file: cat .env | grep -E 'SLACK|BASE_URL'"
echo "   2. Start daemon: npm run monitor:daemon"
echo ""
