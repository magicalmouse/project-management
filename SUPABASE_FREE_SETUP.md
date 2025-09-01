# 🆓 Supabase Free Database Setup (100% Free Forever)

## Why Supabase?
- ✅ **100% FREE** forever (no credit card required)
- ✅ **500MB database** storage
- ✅ **2GB bandwidth** per month
- ✅ **PostgreSQL** (more powerful than MySQL)
- ✅ **Built-in authentication**
- ✅ **Real-time subscriptions**
- ✅ **Automatic backups**

## Step 1: Create Supabase Account

1. **Go to**: https://supabase.com
2. **Click "Start your project"**
3. **Sign up with GitHub** (free)
4. **No credit card required!**

## Step 2: Create Database Project

1. **Click "New project"**
2. **Organization**: Your GitHub username
3. **Name**: `project-management`
4. **Database Password**: Create a strong password
5. **Region**: Choose closest to your users
6. **Pricing Plan**: **Free** (selected by default)
7. **Click "Create new project"**

## Step 3: Get Connection Details

1. **Go to Settings** → **Database**
2. **Copy the connection string**

Example:
```
postgresql://postgres:your_password@db.your_project_id.supabase.co:5432/postgres
```

## Step 4: Update Your Code for PostgreSQL

Since Supabase uses PostgreSQL instead of MySQL, we need to update your database code:

### Install PostgreSQL Driver
```bash
npm install pg
```

### Update Database Connection
```javascript
// backend/db.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } finally {
    client.release();
  }
}

module.exports = { pool, query };
```

## Step 5: Convert MySQL Schema to PostgreSQL

### Key Differences:
- `AUTO_INCREMENT` → `SERIAL`
- `ENUM` → `CHECK` constraints or custom types
- `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` → `TIMESTAMP DEFAULT NOW()`

### PostgreSQL Schema:
```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    profile_picture VARCHAR(255),
    phone VARCHAR(20),
    department VARCHAR(50),
    position VARCHAR(50)
);

-- Projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2),
    spent_budget DECIMAL(15,2) DEFAULT 0,
    progress DECIMAL(5,2) DEFAULT 0,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Continue with other tables...
```

## Step 6: Vercel Environment Variables

Add to Vercel:
```
DATABASE_URL = postgresql://postgres:your_password@db.your_project_id.supabase.co:5432/postgres
NODE_ENV = production
JWT_SECRET = your_secure_jwt_secret
```

## Free Tier Limits (Very Generous!)

- **Database size**: 500MB
- **Bandwidth**: 2GB/month
- **API requests**: 50,000/month
- **Authentication users**: 50,000 MAU
- **Realtime connections**: 200 concurrent
- **Edge functions**: 500,000 invocations/month

**Perfect for your project management system!**