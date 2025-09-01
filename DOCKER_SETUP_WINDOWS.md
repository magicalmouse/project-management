# 🐳 Docker Setup Guide for Windows

This guide will help you set up and deploy the Project Management System using Docker containers on Windows.

## 📋 **Prerequisites**

### System Requirements:
- **Windows 10/11** (64-bit)
- **4GB RAM** minimum (8GB recommended)
- **20GB free disk space**
- **Virtualization enabled** in BIOS

## 🔧 **Step 1: Install Docker Desktop**

### Download and Install:
1. **Go to**: https://docker.com/products/docker-desktop
2. **Download** Docker Desktop for Windows
3. **Run the installer** as Administrator
4. **Follow the installation wizard**
5. **Restart your computer** when prompted

### First-Time Setup:
1. **Launch Docker Desktop** from Start Menu
2. **Accept the license agreement**
3. **Wait for Docker to start** (may take a few minutes)
4. **Verify installation** by seeing the Docker icon in system tray

## ✅ **Step 2: Verify Docker Installation**

Open PowerShell as Administrator and run:

```powershell
# Check Docker version
docker --version

# Check Docker Compose version
docker-compose --version

# Test Docker with hello-world
docker run hello-world
```

You should see version information and a "Hello from Docker!" message.

## 🚀 **Step 3: Deploy Your Application**

### Quick Deployment:

```powershell
# Navigate to your project directory
cd C:\Data\project-management

# Run the Windows deployment script
.\deploy-windows.ps1 -Build
```

### Manual Deployment Steps:

```powershell
# 1. Create environment file (if not exists)
Copy-Item "env.production.example" ".env"

# 2. Edit environment file (optional)
notepad .env

# 3. Build and start containers
docker-compose up --build -d

# 4. Check status
docker-compose ps
```

## 📊 **Step 4: Verify Deployment**

### Check Services:
```powershell
# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# Check resource usage
docker stats
```

### Access Your Application:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:4000
- **Database**: localhost:3306

### Default Login:
- **Username**: `admin`
- **Password**: `admin123`
- **⚠️ Change this immediately after first login!**

## 🛠️ **Management Commands**

### Using the PowerShell Script:

```powershell
# Show help
.\deploy-windows.ps1 -Help

# Build and start (first time)
.\deploy-windows.ps1 -Build

# Start services
.\deploy-windows.ps1 -Start

# Stop services
.\deploy-windows.ps1 -Stop

# Restart services
.\deploy-windows.ps1 -Restart

# View logs
.\deploy-windows.ps1 -Logs

# Check status
.\deploy-windows.ps1 -Status

# Clean up (removes all containers)
.\deploy-windows.ps1 -Clean
```

### Using Docker Compose Directly:

```powershell
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service_name]

# Restart specific service
docker-compose restart [service_name]

# Rebuild and restart
docker-compose up --build -d

# Scale services (if needed)
docker-compose up --scale backend=2 -d
```

## 🔍 **Troubleshooting**

### Common Issues:

#### 1. **Docker Desktop won't start**
```powershell
# Check if virtualization is enabled
Get-ComputerInfo | Select-Object -Property "HyperV*"

# Restart Docker Desktop
Stop-Process -Name "Docker Desktop" -Force
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

#### 2. **Port conflicts**
```powershell
# Check what's using port 80
netstat -ano | findstr :80

# Kill process using port (replace PID)
taskkill /PID [PID] /F
```

#### 3. **Container build failures**
```powershell
# Clean Docker cache
docker system prune -a -f

# Rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

#### 4. **Database connection issues**
```powershell
# Check database logs
docker-compose logs database

# Connect to database container
docker-compose exec database mysql -u root -p

# Reset database
docker-compose down -v
docker-compose up -d
```

#### 5. **Memory issues**
```powershell
# Check Docker resource usage
docker stats

# Increase Docker memory limit:
# Docker Desktop → Settings → Resources → Advanced → Memory
```

## 📈 **Performance Optimization**

### Docker Desktop Settings:
1. **Open Docker Desktop**
2. **Go to Settings → Resources**
3. **Adjust allocations:**
   - **CPUs**: 2-4 cores
   - **Memory**: 4-8 GB
   - **Swap**: 1-2 GB
   - **Disk image size**: 60+ GB

### Windows Performance:
```powershell
# Disable Windows Defender real-time scanning for project folder
Add-MpPreference -ExclusionPath "C:\Data\project-management"

# Enable Windows containers (if needed)
Enable-WindowsOptionalFeature -Online -FeatureName containers -All
```

## 🔒 **Security Considerations**

### Firewall Configuration:
```powershell
# Allow Docker through Windows Firewall
New-NetFirewallRule -DisplayName "Docker Desktop" -Direction Inbound -Protocol TCP -LocalPort 80,443,4000,3306 -Action Allow
```

### Environment Security:
- **Never commit `.env` files** to version control
- **Use strong passwords** in production
- **Regularly update** Docker images
- **Monitor container logs** for security issues

## 📚 **Useful Docker Commands**

### Container Management:
```powershell
# List all containers
docker ps -a

# Remove stopped containers
docker container prune

# View container details
docker inspect [container_name]

# Execute commands in container
docker-compose exec [service_name] bash
```

### Image Management:
```powershell
# List images
docker images

# Remove unused images
docker image prune -a

# Pull latest images
docker-compose pull
```

### Volume Management:
```powershell
# List volumes
docker volume ls

# Remove unused volumes
docker volume prune

# Backup database volume
docker run --rm -v project-management_mysql_data:/data -v ${PWD}:/backup alpine tar czf /backup/db-backup.tar.gz /data
```

## 🆘 **Getting Help**

### Log Locations:
- **Application logs**: `docker-compose logs`
- **Docker Desktop logs**: `%APPDATA%\Docker\log`
- **Windows Event Viewer**: Applications and Services → Docker Desktop

### Support Resources:
- **Docker Documentation**: https://docs.docker.com
- **Docker Desktop Issues**: https://github.com/docker/for-win/issues
- **Project Issues**: Check your GitHub repository issues

---

## 🎉 **Success!**

Your Project Management System is now running in Docker containers! 

**Next Steps:**
1. **Access the application** at http://localhost
2. **Login with admin credentials** and change password
3. **Create user accounts** for your team
4. **Start managing projects** and tasks
5. **Upload resumes** and track job applications

**For production deployment**, consider moving to a cloud server using the deployment guides provided.

Enjoy your containerized Project Management System! 🚀