# 🔐 Vercel Environment Variables Setup

## Step 1: Add Environment Variables to Vercel

### 1.1 Go to Vercel Dashboard
1. Open your project in Vercel dashboard
2. Go to **Settings** tab
3. Click **Environment Variables** in sidebar

### 1.2 Add These Variables

**Database Configuration:**
```
DB_HOST = 172.86.88.195
DB_USER = vercel_user
DB_PASSWORD = your_secure_password_here
DB_NAME = project_management
DB_PORT = 3306
```

**Security Configuration:**
```
JWT_SECRET = your_jwt_secret_minimum_32_characters_long_and_very_secure
JWT_EXPIRES_IN = 1h
JWT_REFRESH_EXPIRES_IN = 7d
NODE_ENV = production
```

**CORS Configuration:**
```
CORS_ORIGIN = https://your-project-name.vercel.app
```

### 1.3 Environment Settings
- **Environment**: Production, Preview, Development (select all)
- **Git Branch**: main (or your default branch)

## Step 2: Update Database Connection Code

Your backend code should read these environment variables:

```javascript
// In your backend/db.js or similar
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Optional SSL configuration
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false
});
```

## Step 3: Test Connection

After adding environment variables:
1. **Redeploy** your Vercel project
2. **Check logs** in Vercel dashboard
3. **Test API endpoints** that use database

## Step 4: Security Best Practices

### 4.1 Strong Passwords
- Use complex passwords (letters, numbers, symbols)
- Minimum 16 characters
- Different from other passwords

### 4.2 Database Security
```sql
-- Create dedicated user with limited privileges
CREATE USER 'vercel_user'@'%' IDENTIFIED BY 'strong_password_here';
GRANT SELECT, INSERT, UPDATE, DELETE ON project_management.* TO 'vercel_user'@'%';
FLUSH PRIVILEGES;
```

### 4.3 Network Security
```bash
# On your VPS - restrict MySQL access
sudo ufw allow from 0.0.0.0/0 to any port 3306

# Or restrict to Vercel IPs (more secure but complex)
# Vercel uses dynamic IPs, so this is challenging
```

## Step 5: Connection Testing

### 5.1 Test from Vercel Function
Create a test API endpoint:

```javascript
// api/test-db.js
export default async function handler(req, res) {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
    
    const [rows] = await connection.execute('SELECT 1 as test');
    await connection.end();
    
    res.status(200).json({ 
      success: true, 
      message: 'Database connection successful',
      test: rows[0]
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
```

### 5.2 Access Test Endpoint
Visit: `https://your-project.vercel.app/api/test-db`

## Troubleshooting

### Common Issues:

1. **Connection Refused**
   - Check VPS firewall (port 3306)
   - Verify MySQL bind-address setting
   - Ensure MySQL service is running

2. **Access Denied**
   - Verify user credentials
   - Check user permissions
   - Ensure user can connect from any host (%)

3. **Timeout Errors**
   - Check network connectivity
   - Verify VPS is accessible
   - Check MySQL configuration

### Debug Commands:

```bash
# On VPS - Check MySQL status
sudo systemctl status mysql

# Check MySQL processes
sudo netstat -tlnp | grep :3306

# Check MySQL logs
sudo tail -f /var/log/mysql/error.log

# Test local connection
mysql -u vercel_user -p project_management
```