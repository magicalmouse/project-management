# 🐳 Manual Docker Deployment Guide

## 🚨 **Current Issue**
Docker Desktop is experiencing API version compatibility issues. This is common with fresh installations.

## 🔧 **Quick Fix Steps**

### 1. **Restart Docker Desktop Properly**
```powershell
# Stop Docker Desktop completely
Stop-Process -Name "Docker Desktop" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "com.docker.backend" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "com.docker.proxy" -Force -ErrorAction SilentlyContinue

# Wait 10 seconds
Start-Sleep -Seconds 10

# Start Docker Desktop
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

### 2. **Wait for Docker to be Ready**
- **Open Docker Desktop** from Start Menu
- **Wait** for the whale icon in system tray to show "Docker Desktop is running"
- **Green status** should appear (may take 2-3 minutes)

### 3. **Test Docker**
```powershell
# Test basic Docker functionality
docker --version
docker ps
```

## 🚀 **Deploy Your Application**

Once Docker is working, run these commands:

### **Step 1: Pull Required Images**
```powershell
docker pull mysql:8.0
docker pull node:20-alpine  
docker pull nginx:alpine
```

### **Step 2: Start Services**
```powershell
# Stop any existing containers
docker-compose down --remove-orphans

# Build and start all services
docker-compose up --build -d
```

### **Step 3: Check Status**
```powershell
# View running containers
docker-compose ps

# View logs if needed
docker-compose logs -f
```

## 🌐 **Access Your Application**

Once deployed successfully:

- **Frontend**: http://localhost
- **Backend API**: http://localhost:4000  
- **Database**: localhost:3306

**Default Login:**
- Username: `admin`
- Password: `admin123`

## 🛠️ **Management Commands**

```powershell
# View service status
docker-compose ps

# View logs
docker-compose logs -f [service_name]

# Restart services  
docker-compose restart

# Stop services
docker-compose down

# Update and restart
docker-compose up --build -d
```

## 🔍 **Troubleshooting**

### **If Docker commands fail:**
1. **Check Docker Desktop status** in system tray
2. **Restart Docker Desktop** completely
3. **Try factory reset**: Docker Desktop → Settings → Troubleshoot → Reset to factory defaults

### **If containers won't start:**
```powershell
# Clean up and try again
docker system prune -a -f
docker-compose down -v
docker-compose up --build -d
```

### **If ports are in use:**
```powershell
# Check what's using port 80
netstat -ano | findstr :80

# Kill the process (replace PID with actual process ID)
taskkill /PID [PID] /F
```

## 📊 **What You'll Get**

Your **Project Management System** includes:

- 👥 **User Management** - Admin, Manager, User roles
- 📊 **Dashboard** - Real-time analytics  
- 📋 **Project Tracking** - Create and manage projects
- ✅ **Task Management** - Assign tasks, track progress
- 💼 **Job Applications** - Track applications and interviews
- 📄 **Resume Management** - Upload, edit, generate PDFs
- 📊 **Proposals** - Create project proposals
- 🔒 **Security** - JWT authentication, encrypted passwords
- 📱 **Responsive Design** - Works on all devices

## 🎉 **Success Indicators**

You'll know it's working when:
- ✅ `docker-compose ps` shows all services as "Up"
- ✅ http://localhost loads the login page
- ✅ You can login with admin/admin123
- ✅ Dashboard shows project management interface

---

**Need help?** Let me know if Docker Desktop is running properly and I'll help you complete the deployment!