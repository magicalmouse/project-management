#!/bin/bash

# Database Backup Script for Project Management System
set -e

# Configuration
BACKUP_DIR="/app/backups"
DB_NAME="project_management"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/project_management_backup_$DATE.sql"
RETENTION_DAYS=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

print_status "Starting database backup..."

# Perform the backup
if docker-compose exec -T database mysqldump \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    --add-drop-database \
    --databases "$DB_NAME" > "$BACKUP_FILE"; then
    
    print_success "Database backup created: $BACKUP_FILE"
    
    # Compress the backup
    gzip "$BACKUP_FILE"
    print_success "Backup compressed: ${BACKUP_FILE}.gz"
    
    # Clean up old backups
    print_status "Cleaning up old backups (older than $RETENTION_DAYS days)..."
    find "$BACKUP_DIR" -name "project_management_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    
    # Show backup size
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
    print_success "Backup completed successfully! Size: $BACKUP_SIZE"
    
else
    print_error "Database backup failed!"
    exit 1
fi

# List recent backups
print_status "Recent backups:"
ls -lh "$BACKUP_DIR"/project_management_backup_*.sql.gz | tail -5