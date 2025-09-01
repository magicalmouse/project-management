# 🚀 Production Deployment Guide

This guide will help you deploy the Project Management System to production with Docker containers, SSL certificates, and comprehensive security hardening.

## 📋 Prerequisites

- **Server**: Ubuntu 20.04+ or similar Linux distribution
- **Domain**: A registered domain name pointing to your server
- **Resources**: Minimum 2GB RAM, 2 CPU cores, 20GB storage
- **Access**: SSH access with sudo privileges

## 🏗️ Quick Deployment (Recommended)

### 1. Server Setup

```bash
# Run this on your production server
curl -fsSL https://raw.githubusercontent.com/your-repo/project-management/main/scripts/production-setup.sh | bash
```

### 2. Clone and Configure

```bash
# Clone the repository
git clone https://github.com/your-repo/project-management.git /opt/project-management
cd /opt/project-management

# Copy and edit environment file
cp env.production.example .env
nano .env  # Edit with your production values
```

### 3. Deploy Application

```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### 4. Setup SSL (Optional but Recommended)

```bash
# Setup SSL certificate with Let's Encrypt
chmod +x scripts/ssl-setup.sh
./scripts/ssl-setup.sh yourdomain.com admin@yourdomain.com
```

### 5. Security Hardening (Recommended)

```bash
# Run security hardening script
chmod +x scripts/security-hardening.sh
./scripts/security-hardening.sh
```

## 🔧 Manual Deployment Steps

### Step 1: Prepare the Server

1. **Update system packages:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Docker and Docker Compose:**
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Configure firewall:**
   ```bash
   sudo ufw allow ssh
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw --force enable
   ```

### Step 2: Application Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-repo/project-management.git
   cd project-management
   ```

2. **Configure environment:**
   ```bash
   cp env.production.example .env
   ```

3. **Edit `.env` file with your production values:**
   ```bash
   # Database Configuration
   DB_HOST=database
   DB_USER=project_mgmt_user
   DB_PASSWORD=your_secure_password_here
   DB_NAME=project_management
   DB_ROOT_PASSWORD=your_root_password_here
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_minimum_32_characters_long
   
   # Frontend Configuration
   FRONTEND_URL=https://yourdomain.com
   VITE_API_URL=https://yourdomain.com/api
   CORS_ORIGIN=https://yourdomain.com
   ```

### Step 3: Deploy Services

1. **Build and start containers:**
   ```bash
   docker-compose up --build -d
   ```

2. **Wait for services to be ready:**
   ```bash
   # Check service status
   docker-compose ps
   
   # View logs if needed
   docker-compose logs -f
   ```

3. **Initialize database:**
   ```bash
   # The database will be automatically initialized with the init script
   # Check if it's working
   curl http://localhost:4000/api/health
   ```

### Step 4: SSL Certificate Setup

1. **Install Certbot:**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   ```

2. **Obtain SSL certificate:**
   ```bash
   # Stop frontend temporarily
   docker-compose stop frontend
   
   # Get certificate
   sudo certbot certonly --standalone -d yourdomain.com
   
   # Copy certificates
   mkdir -p nginx/ssl
   sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
   sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem
   sudo chown $USER:$USER nginx/ssl/*.pem
   ```

3. **Update nginx configuration for HTTPS and restart:**
   ```bash
   # The SSL setup script will update nginx.conf automatically
   docker-compose up --build -d
   ```

## 🔒 Security Configuration

### Essential Security Measures

1. **SSH Hardening:**
   - Disable root login
   - Use key-based authentication only
   - Change default SSH port (optional)

2. **Firewall Configuration:**
   ```bash
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   sudo ufw allow ssh
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

3. **Fail2ban Setup:**
   ```bash
   sudo apt install -y fail2ban
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ```

4. **Automatic Updates:**
   ```bash
   sudo apt install -y unattended-upgrades
   sudo dpkg-reconfigure -plow unattended-upgrades
   ```

### Database Security

1. **Strong passwords** for database users
2. **Regular backups** (automated with the backup script)
3. **Network isolation** (database only accessible from backend container)

### Application Security

1. **Environment variables** for sensitive data
2. **JWT tokens** with appropriate expiration
3. **CORS configuration** for allowed origins
4. **Rate limiting** configured in nginx
5. **Security headers** in nginx configuration

## 📊 Monitoring and Maintenance

### Health Checks

- **Frontend**: `curl https://yourdomain.com/health`
- **Backend**: `curl https://yourdomain.com/api/health`
- **Database**: `docker-compose exec database mysqladmin ping`

### Log Monitoring

```bash
# View application logs
docker-compose logs -f [service_name]

# View nginx access logs
docker-compose exec frontend tail -f /var/log/nginx/access.log

# View nginx error logs
docker-compose exec frontend tail -f /var/log/nginx/error.log
```

### Backup Management

```bash
# Manual backup
./database/backup.sh

# Restore from backup
docker-compose exec -T database mysql -u root -p project_management < backup_file.sql
```

### Updates and Maintenance

```bash
# Update application
git pull origin main
docker-compose up --build -d

# Update system packages
sudo apt update && sudo apt upgrade -y

# Renew SSL certificates (automatic via cron)
sudo certbot renew --dry-run
```

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check what's using ports
   sudo netstat -tulpn | grep :80
   sudo netstat -tulpn | grep :443
   ```

2. **Database connection issues:**
   ```bash
   # Check database logs
   docker-compose logs database
   
   # Test database connection
   docker-compose exec database mysql -u root -p
   ```

3. **SSL certificate issues:**
   ```bash
   # Check certificate validity
   sudo certbot certificates
   
   # Test SSL configuration
   curl -I https://yourdomain.com
   ```

4. **Memory issues:**
   ```bash
   # Check system resources
   free -h
   df -h
   docker system df
   
   # Clean up Docker resources
   docker system prune -a
   ```

### Performance Optimization

1. **Enable gzip compression** (already configured in nginx)
2. **Set up CDN** for static assets
3. **Database optimization:**
   ```sql
   -- Check slow queries
   SHOW PROCESSLIST;
   
   -- Optimize tables
   OPTIMIZE TABLE users, projects, tasks;
   ```

4. **Monitor resource usage:**
   ```bash
   # Install monitoring tools
   sudo apt install -y htop iotop nethogs
   
   # Monitor Docker containers
   docker stats
   ```

## 📞 Support

### Log Files Locations

- **Application logs**: `docker-compose logs`
- **Nginx logs**: `/var/log/nginx/` (inside frontend container)
- **System logs**: `/var/log/syslog`
- **Security logs**: `/var/log/auth.log`

### Useful Commands

```bash
# Restart all services
docker-compose restart

# Rebuild and restart specific service
docker-compose up --build -d [service_name]

# Scale services (if needed)
docker-compose up --scale backend=2 -d

# Execute commands in containers
docker-compose exec backend bash
docker-compose exec database mysql -u root -p

# View container resource usage
docker stats --no-stream
```

### Getting Help

1. Check the logs first: `docker-compose logs -f`
2. Verify environment configuration: `cat .env`
3. Test individual components: health check endpoints
4. Check system resources: `htop`, `df -h`
5. Review security logs: `/var/log/auth.log`

---

## 🎉 Congratulations!

Your Project Management System is now deployed and ready for production use! 

**Access your application at**: `https://yourdomain.com`

**Default admin credentials**:
- Username: `admin`
- Password: `admin123` (⚠️ **Change this immediately after first login!**)

Remember to:
- [ ] Change default admin password
- [ ] Configure email notifications
- [ ] Set up monitoring alerts
- [ ] Schedule regular backups
- [ ] Review security settings
- [ ] Test all functionality

For additional support or feature requests, please refer to the project documentation or create an issue in the repository.