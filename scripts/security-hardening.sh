#!/bin/bash

# Security Hardening Script for Production Server
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

print_status "Starting security hardening process..."

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Configure SSH security
print_status "Hardening SSH configuration..."
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# SSH hardening settings
sudo tee -a /etc/ssh/sshd_config.d/99-security.conf > /dev/null <<EOF
# Security hardening
Protocol 2
PermitRootLogin no
PasswordAuthentication no
PermitEmptyPasswords no
X11Forwarding no
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
UseDNS no
AllowUsers $USER
EOF

# Restart SSH service
sudo systemctl restart sshd
print_success "SSH hardened"

# Configure fail2ban
print_status "Configuring fail2ban..."
sudo tee /etc/fail2ban/jail.local > /dev/null <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
backend = systemd

[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 3

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 600
EOF

sudo systemctl restart fail2ban
print_success "fail2ban configured"

# Configure automatic security updates
print_status "Setting up automatic security updates..."
sudo apt install -y unattended-upgrades apt-listchanges

sudo tee /etc/apt/apt.conf.d/50unattended-upgrades > /dev/null <<EOF
Unattended-Upgrade::Allowed-Origins {
    "\${distro_id}:\${distro_codename}";
    "\${distro_id}:\${distro_codename}-security";
    "\${distro_id}ESMApps:\${distro_codename}-apps-security";
    "\${distro_id}ESM:\${distro_codename}-infra-security";
};

Unattended-Upgrade::Package-Blacklist {
};

Unattended-Upgrade::DevRelease "false";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::SyslogEnable "true";
EOF

sudo systemctl enable unattended-upgrades
print_success "Automatic security updates enabled"

# Install and configure ClamAV antivirus
print_status "Installing ClamAV antivirus..."
sudo apt install -y clamav clamav-daemon
sudo freshclam
sudo systemctl enable clamav-daemon
sudo systemctl start clamav-daemon

# Setup daily virus scan
(crontab -l 2>/dev/null; echo "0 3 * * * /usr/bin/clamscan -r /opt/project-management --quiet --infected --remove >> /var/log/clamav-scan.log 2>&1") | crontab -
print_success "ClamAV antivirus installed and configured"

# Configure system limits
print_status "Configuring system security limits..."
sudo tee -a /etc/security/limits.conf > /dev/null <<EOF
# Security limits
* soft nofile 65536
* hard nofile 65536
* soft nproc 32768
* hard nproc 32768
EOF

# Configure kernel parameters
print_status "Hardening kernel parameters..."
sudo tee -a /etc/sysctl.d/99-security.conf > /dev/null <<EOF
# Network security
net.ipv4.ip_forward = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.icmp_ignore_bogus_error_responses = 1
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 2048
net.ipv4.tcp_synack_retries = 2
net.ipv4.tcp_syn_retries = 5

# Memory protection
kernel.dmesg_restrict = 1
kernel.kptr_restrict = 2
kernel.yama.ptrace_scope = 1

# File system security
fs.suid_dumpable = 0
fs.protected_hardlinks = 1
fs.protected_symlinks = 1
EOF

sudo sysctl -p /etc/sysctl.d/99-security.conf
print_success "Kernel parameters hardened"

# Install and configure AIDE (file integrity monitoring)
print_status "Installing AIDE for file integrity monitoring..."
sudo apt install -y aide
sudo aideinit
sudo mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db

# Setup daily AIDE check
(crontab -l 2>/dev/null; echo "0 4 * * * /usr/bin/aide --check >> /var/log/aide.log 2>&1") | crontab -
print_success "AIDE file integrity monitoring configured"

# Configure log monitoring
print_status "Setting up log monitoring..."
sudo apt install -y logwatch

# Configure logwatch
sudo tee /etc/logwatch/conf/logwatch.conf > /dev/null <<EOF
LogDir = /var/log
TmpDir = /var/cache/logwatch
MailTo = root
MailFrom = Logwatch
Print = Yes
Save = /var/cache/logwatch
Range = yesterday
Detail = Med
Service = All
mailer = "/usr/sbin/sendmail -t"
EOF

# Setup daily log reports
(crontab -l 2>/dev/null; echo "0 5 * * * /usr/sbin/logwatch --output mail --mailto root --detail high") | crontab -
print_success "Log monitoring configured"

# Create security monitoring script
print_status "Creating security monitoring script..."
sudo tee /usr/local/bin/security-check.sh > /dev/null <<'EOF'
#!/bin/bash

# Security monitoring script
LOG_FILE="/var/log/security-check.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] Starting security check..." >> $LOG_FILE

# Check for failed login attempts
FAILED_LOGINS=$(grep "Failed password" /var/log/auth.log | wc -l)
if [ $FAILED_LOGINS -gt 10 ]; then
    echo "[$DATE] WARNING: $FAILED_LOGINS failed login attempts detected" >> $LOG_FILE
fi

# Check for unusual network connections
CONNECTIONS=$(netstat -tuln | grep LISTEN | wc -l)
if [ $CONNECTIONS -gt 20 ]; then
    echo "[$DATE] WARNING: $CONNECTIONS listening ports detected" >> $LOG_FILE
fi

# Check disk usage
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
    echo "[$DATE] WARNING: Disk usage is ${DISK_USAGE}%" >> $LOG_FILE
fi

# Check for rootkits with rkhunter
if command -v rkhunter &> /dev/null; then
    rkhunter --check --skip-keypress --quiet >> $LOG_FILE 2>&1
fi

echo "[$DATE] Security check completed" >> $LOG_FILE
EOF

sudo chmod +x /usr/local/bin/security-check.sh

# Setup hourly security checks
(crontab -l 2>/dev/null; echo "0 * * * * /usr/local/bin/security-check.sh") | crontab -
print_success "Security monitoring script created"

# Install rkhunter for rootkit detection
print_status "Installing rkhunter for rootkit detection..."
sudo apt install -y rkhunter
sudo rkhunter --update
sudo rkhunter --propupd

# Setup weekly rootkit scan
(crontab -l 2>/dev/null; echo "0 6 * * 0 /usr/bin/rkhunter --check --skip-keypress --quiet >> /var/log/rkhunter.log 2>&1") | crontab -
print_success "Rootkit detection configured"

# Configure Docker security
print_status "Hardening Docker configuration..."
sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
    "live-restore": true,
    "userland-proxy": false,
    "no-new-privileges": true,
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    },
    "storage-driver": "overlay2"
}
EOF

sudo systemctl restart docker
print_success "Docker security hardened"

# Create security summary
print_status "Creating security summary..."
cat > /tmp/security-summary.txt <<EOF
Security Hardening Summary
==========================

✅ SSH hardened (root login disabled, key-only auth)
✅ Fail2ban configured for intrusion prevention
✅ Automatic security updates enabled
✅ ClamAV antivirus installed and scheduled
✅ System limits and kernel parameters hardened
✅ AIDE file integrity monitoring configured
✅ Log monitoring with logwatch enabled
✅ Security monitoring script created
✅ Rkhunter rootkit detection installed
✅ Docker security configuration applied

Scheduled Tasks:
- Daily virus scan at 3:00 AM
- Daily AIDE integrity check at 4:00 AM
- Daily log reports at 5:00 AM
- Weekly rootkit scan on Sundays at 6:00 AM
- Hourly security monitoring

Log Files:
- Security checks: /var/log/security-check.log
- AIDE reports: /var/log/aide.log
- ClamAV scans: /var/log/clamav-scan.log
- Rkhunter scans: /var/log/rkhunter.log

Next Steps:
1. Review and customize fail2ban rules if needed
2. Configure email notifications for security alerts
3. Set up centralized logging if managing multiple servers
4. Consider implementing intrusion detection system (IDS)
5. Regular security audits and penetration testing
EOF

cat /tmp/security-summary.txt
print_success "Security hardening completed!"

print_warning "Please reboot the system to ensure all changes take effect"
print_warning "Review the security summary above and customize settings as needed"