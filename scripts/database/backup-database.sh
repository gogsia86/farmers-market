#!/bin/bash
# ========================================
# FARMERS MARKET PLATFORM - DATABASE BACKUP
# Automated Database Backup Script
# ========================================
#
# Features:
# - Full PostgreSQL database backup
# - Gzip compression
# - Retention management (30 days)
# - S3 upload support
# - Backup verification
# - Slack/email notifications
#
# Usage:
#   ./scripts/backup-database.sh
#
# Cron Schedule (daily at 2 AM):
#   0 2 * * * /path/to/scripts/backup-database.sh >> /var/log/farmersmarket-backup.log 2>&1
# ========================================

set -e
set -o pipefail

# ============ CONFIGURATION ============

# Backup directory
BACKUP_DIR="${BACKUP_DIR:-/backups/farmersmarket}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE_SHORT=$(date +%Y%m%d)

# Database configuration
DB_NAME="${DB_NAME:-farmersmarket}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-farmersmarket}"

# Export password for pg_dump
export PGPASSWORD="${DB_PASSWORD}"

# AWS S3 configuration (optional)
S3_BACKUP_BUCKET="${AWS_S3_BACKUP_BUCKET:-}"
S3_REGION="${AWS_REGION:-us-east-1}"

# Notification configuration
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
EMAIL_RECIPIENT="${BACKUP_EMAIL_RECIPIENT:-}"

# ============ COLORS ============

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============ FUNCTIONS ============

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

send_slack_notification() {
    local message="$1"
    local status="$2"

    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        local color="good"
        if [ "$status" = "error" ]; then
            color="danger"
        elif [ "$status" = "warning" ]; then
            color="warning"
        fi

        curl -X POST -H 'Content-type: application/json' \
            --data "{\"attachments\":[{\"color\":\"$color\",\"text\":\"$message\"}]}" \
            "$SLACK_WEBHOOK_URL" 2>/dev/null || true
    fi
}

send_email_notification() {
    local subject="$1"
    local body="$2"

    if [ -n "$EMAIL_RECIPIENT" ]; then
        echo "$body" | mail -s "$subject" "$EMAIL_RECIPIENT" 2>/dev/null || true
    fi
}

check_prerequisites() {
    log "Checking prerequisites..."

    # Check if pg_dump is installed
    if ! command -v pg_dump &> /dev/null; then
        error "pg_dump not found. Please install PostgreSQL client tools."
        exit 1
    fi

    # Check if gzip is installed
    if ! command -v gzip &> /dev/null; then
        error "gzip not found. Please install gzip."
        exit 1
    fi

    # Check database connectivity
    if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" &> /dev/null; then
        error "Cannot connect to database at $DB_HOST:$DB_PORT"
        exit 1
    fi

    success "Prerequisites check passed"
}

create_backup_directory() {
    log "Creating backup directory: $BACKUP_DIR"

    mkdir -p "$BACKUP_DIR"

    if [ ! -d "$BACKUP_DIR" ]; then
        error "Failed to create backup directory"
        exit 1
    fi

    success "Backup directory ready"
}

perform_backup() {
    local backup_file="$BACKUP_DIR/farmersmarket_${TIMESTAMP}.sql"
    local compressed_file="${backup_file}.gz"

    log "Starting database backup..."
    log "Database: $DB_NAME"
    log "Host: $DB_HOST:$DB_PORT"
    log "User: $DB_USER"
    log "Output: $compressed_file"

    # Perform backup with pg_dump
    if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --no-owner --no-acl --format=plain \
        --verbose 2>&1 | gzip > "$compressed_file"; then

        # Verify backup file was created
        if [ ! -f "$compressed_file" ]; then
            error "Backup file was not created"
            return 1
        fi

        # Get file size
        local file_size=$(du -h "$compressed_file" | cut -f1)
        success "Backup created successfully: $compressed_file ($file_size)"

        echo "$compressed_file"
        return 0
    else
        error "Backup failed"
        return 1
    fi
}

verify_backup() {
    local backup_file="$1"

    log "Verifying backup integrity..."

    # Check if file exists
    if [ ! -f "$backup_file" ]; then
        error "Backup file not found: $backup_file"
        return 1
    fi

    # Check file size (should be > 1KB)
    local size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null)
    if [ "$size" -lt 1024 ]; then
        error "Backup file is too small (${size} bytes)"
        return 1
    fi

    # Test gzip integrity
    if ! gzip -t "$backup_file" 2>/dev/null; then
        error "Backup file is corrupted (gzip test failed)"
        return 1
    fi

    success "Backup verification passed"
    return 0
}

upload_to_s3() {
    local backup_file="$1"

    if [ -z "$S3_BACKUP_BUCKET" ]; then
        warning "S3 backup bucket not configured, skipping upload"
        return 0
    fi

    log "Uploading backup to S3..."

    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        warning "AWS CLI not found, skipping S3 upload"
        return 0
    fi

    local s3_path="s3://$S3_BACKUP_BUCKET/database-backups/$(basename "$backup_file")"

    if aws s3 cp "$backup_file" "$s3_path" --region "$S3_REGION" --storage-class STANDARD_IA; then
        success "Uploaded to S3: $s3_path"
        return 0
    else
        error "Failed to upload to S3"
        return 1
    fi
}

cleanup_old_backups() {
    log "Cleaning up backups older than $RETENTION_DAYS days..."

    local deleted_count=0

    # Find and delete old backups
    while IFS= read -r -d '' file; do
        log "Deleting old backup: $(basename "$file")"
        rm -f "$file"
        ((deleted_count++))
    done < <(find "$BACKUP_DIR" -name "farmersmarket_*.sql.gz" -type f -mtime +$RETENTION_DAYS -print0 2>/dev/null)

    if [ $deleted_count -gt 0 ]; then
        success "Deleted $deleted_count old backup(s)"
    else
        log "No old backups to delete"
    fi
}

generate_backup_report() {
    local backup_file="$1"
    local status="$2"

    log "Generating backup report..."

    local report_file="$BACKUP_DIR/backup_report_${DATE_SHORT}.txt"

    {
        echo "========================================="
        echo "FARMERS MARKET PLATFORM - BACKUP REPORT"
        echo "========================================="
        echo ""
        echo "Date: $(date)"
        echo "Status: $status"
        echo ""
        echo "Database Information:"
        echo "  Name: $DB_NAME"
        echo "  Host: $DB_HOST:$DB_PORT"
        echo "  User: $DB_USER"
        echo ""

        if [ "$status" = "SUCCESS" ] && [ -f "$backup_file" ]; then
            echo "Backup File:"
            echo "  Path: $backup_file"
            echo "  Size: $(du -h "$backup_file" | cut -f1)"
            echo "  Created: $(date -r "$backup_file" 2>/dev/null || stat -c %y "$backup_file" 2>/dev/null)"
            echo ""

            # List all current backups
            echo "Available Backups:"
            find "$BACKUP_DIR" -name "farmersmarket_*.sql.gz" -type f -exec ls -lh {} \; | \
                awk '{print "  " $9 " - " $5 " - " $6 " " $7 " " $8}'
        else
            echo "Backup Failed!"
            echo "  Check logs for details"
        fi

        echo ""
        echo "========================================="
    } > "$report_file"

    success "Report saved: $report_file"
}

# ============ MAIN EXECUTION ============

main() {
    local start_time=$(date +%s)

    log "========================================="
    log "🗄️  FARMERS MARKET PLATFORM - DATABASE BACKUP"
    log "========================================="
    log ""

    # Check prerequisites
    check_prerequisites

    # Create backup directory
    create_backup_directory

    # Perform backup
    local backup_file
    if backup_file=$(perform_backup); then

        # Verify backup
        if verify_backup "$backup_file"; then

            # Upload to S3 (if configured)
            upload_to_s3 "$backup_file"

            # Cleanup old backups
            cleanup_old_backups

            # Calculate duration
            local end_time=$(date +%s)
            local duration=$((end_time - start_time))

            # Generate report
            generate_backup_report "$backup_file" "SUCCESS"

            # Success notification
            local message="Database backup completed successfully in ${duration}s\nFile: $(basename "$backup_file")\nSize: $(du -h "$backup_file" | cut -f1)"
            success "Backup completed in ${duration}s"

            send_slack_notification "✅ $message" "success"
            send_email_notification "Backup Success - Farmers Market Platform" "$message"

            log ""
            log "========================================="
            log "✅ BACKUP COMPLETED SUCCESSFULLY"
            log "========================================="

            exit 0
        else
            error "Backup verification failed"

            generate_backup_report "$backup_file" "VERIFICATION_FAILED"

            local message="Database backup verification failed"
            send_slack_notification "⚠️ $message" "warning"
            send_email_notification "Backup Warning - Farmers Market Platform" "$message"

            exit 1
        fi
    else
        error "Backup creation failed"

        generate_backup_report "" "FAILED"

        local message="Database backup failed"
        send_slack_notification "❌ $message" "error"
        send_email_notification "Backup Failed - Farmers Market Platform" "$message"

        log ""
        log "========================================="
        log "❌ BACKUP FAILED"
        log "========================================="

        exit 1
    fi
}

# Run main function
main
