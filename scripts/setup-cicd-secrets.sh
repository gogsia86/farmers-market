#!/bin/bash

# CI/CD Secrets Setup Script
# This script helps you configure GitHub Secrets for CI/CD workflows

echo "🚀 Farmers Market Platform - CI/CD Setup"
echo "=========================================="
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo "📥 Install it from: https://cli.github.com/"
    exit 1
fi

echo "✅ GitHub CLI detected"
echo ""

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "🔑 Please authenticate with GitHub..."
    gh auth login
fi

echo ""
echo "📋 Setting up GitHub Secrets..."
echo ""

# Function to set secret
set_secret() {
    local secret_name=$1
    local secret_description=$2
    local is_optional=$3

    echo "🔐 $secret_name"
    echo "   $secret_description"

    if [ "$is_optional" = "true" ]; then
        read -p "   Do you want to set this secret? (y/n): " answer
        if [ "$answer" != "y" ]; then
            echo "   ⏭️  Skipped"
            echo ""
            return
        fi
    fi

    read -sp "   Enter value (input hidden): " secret_value
    echo ""

    if [ -n "$secret_value" ]; then
        gh secret set "$secret_name" -b"$secret_value"
        echo "   ✅ Set successfully"
    else
        echo "   ⚠️  No value provided, skipped"
    fi
    echo ""
}

# Required secrets
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Required Secrets"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

set_secret "DOCKER_USERNAME" "Docker Hub username" false
set_secret "DOCKER_PASSWORD" "Docker Hub access token (not password!)" false
set_secret "PRODUCTION_HOST" "Production server IP address" false
set_secret "PRODUCTION_USER" "SSH username for production server" false
set_secret "PRODUCTION_SSH_KEY" "Private SSH key for production access" false

# Optional secrets
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Optional Secrets (Staging & Notifications)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

set_secret "STAGING_HOST" "Staging server IP address" true
set_secret "STAGING_USER" "SSH username for staging server" true
set_secret "STAGING_SSH_KEY" "Private SSH key for staging access" true
set_secret "SLACK_WEBHOOK" "Slack webhook URL for notifications" true
set_secret "SNYK_TOKEN" "Snyk API token for security scanning" true

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Verify secrets in GitHub:"
echo "   https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/settings/secrets/actions"
echo ""
echo "2. Push code to trigger CI/CD:"
echo "   git push origin main"
echo ""
echo "3. Monitor workflows:"
echo "   https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions"
echo ""
echo "4. View documentation:"
echo "   cat docs/CI_CD_SETUP.md"
echo ""
echo "🎉 Happy deploying!"
