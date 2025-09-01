#!/bin/bash

# Production Server Setup Script
# Run this script on your production server to prepare the environment

set -e

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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

print_status "Setting up production environment..."

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
print_status "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    print_success "Docker installed successfully"
else
    print_success "Docker is already installed"
fi

# Install Docker Compose
print_status "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installed successfully"
else
    print_success "Docker Compose is already installed"
fi

# Install Node.js (for development/maintenance tasks)
print_status "Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    print_success "Node.js installed successfully"
else
    print_success "Node.js is already installed"
fi

# Install pnpm
print_status "Installing pnpm..."
if ! command -v pnpm &> /dev/null; then
    sudo npm install -g pnpm
    print_success "pnpm installed successfully"
else
    print_success "pnpm is already installed"
fi

# Install useful tools
print_status "Installing additional tools..."
sudo apt install -y curl wget git htop nano vim ufw fail2ban

# Configure firewall
print_status "Configuring firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
print_success "Firewall configured"

# Configure fail2ban
print_status "Configuring fail2ban..."
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
print_success "fail2ban configured"

# Create application directory
APP_DIR="/opt/project-management"
print_status "Creating application directory: $APP_DIR"
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Create backup directory
BACKUP_DIR="/opt/backups"
print_status "Creating backup directory: $BACKUP_DIR"
sudo mkdir -p $BACKUP_DIR
sudo chown $USER:$USER $BACKUP_DIR

# Setup log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/project-management > /dev/null <<EOF
/opt/project-management/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        docker-compose -f /opt/project-management/docker-compose.yml restart > /dev/null 2>&1 || true
    endscript
}
EOF

# Setup cron job for backups
print_status "Setting up automated backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * cd $APP_DIR && ./database/backup.sh >> /var/log/backup.log 2>&1") | crontab -

# Create systemd service for auto-start
print_status "Creating systemd service..."
sudo tee /etc/systemd/system/project-management.service > /dev/null <<EOF
[Unit]
Description=Project Management System
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0
User=$USER
Group=$USER

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable project-management.service

print_success "Production environment setup completed!"
print_warning "Please reboot the system to ensure all changes take effect"
print_warning "After reboot, clone your project to $APP_DIR and run the deployment script"

echo ""
echo "Next steps:"
echo "1. Reboot the server: sudo reboot"
echo "2. Clone your project: git clone <your-repo> $APP_DIR"
echo "3. Configure environment: cp $APP_DIR/env.production.example $APP_DIR/.env"
echo "4. Edit the .env file with your production values"
echo "5. Run deployment: cd $APP_DIR && ./deploy.sh"