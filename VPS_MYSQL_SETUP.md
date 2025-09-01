# 🗄️ VPS MySQL Configuration for Vercel

## Step 1: Configure MySQL for Remote Access

### 1.1 Edit MySQL Configuration
```bash
# SSH into your VPS (172.86.88.195)
ssh root@172.86.88.195

# Edit MySQL configuration
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Find and change this line:
# FROM: bind-address = 127.0.0.1
# TO:   bind-address = 0.0.0.0

# Save and exit (Ctrl+X, Y, Enter)
```

### 1.2 Create Database and User
```sql
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE project_management;

# Create user for remote access
CREATE USER 'vercel_user'@'%' IDENTIFIED BY 'your_secure_password_here';

# Grant privileges
GRANT ALL PRIVILEGES ON project_management.* TO 'vercel_user'@'%';

# Flush privileges
FLUSH PRIVILEGES;

# Exit MySQL
EXIT;
```

### 1.3 Restart MySQL Service
```bash
sudo systemctl restart mysql
```

### 1.4 Configure Firewall
```bash
# Allow MySQL port (3306)
sudo ufw allow 3306

# Check firewall status
sudo ufw status
```

## Step 2: Test Connection
```bash
# Test from another machine
mysql -h 172.86.88.195 -u vercel_user -p project_management
```

## Step 3: Security Considerations
- Use strong passwords
- Consider using SSL connections
- Restrict access to specific IPs if possible
- Regular backups

## Connection String Format
```
mysql://vercel_user:your_password@172.86.88.195:3306/project_management
```