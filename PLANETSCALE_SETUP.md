# 🌟 PlanetScale Free Database Setup

## Step 1: Create PlanetScale Account

1. **Go to**: https://planetscale.com
2. **Sign up** with GitHub account (free)
3. **Verify email** if required

## Step 2: Create Database

1. **Click "Create database"**
2. **Name**: `project-management`
3. **Region**: Choose closest to your users
4. **Plan**: Hobby (Free)
5. **Click "Create database"**

## Step 3: Get Connection Details

1. **Go to database dashboard**
2. **Click "Connect"**
3. **Select "General"**
4. **Copy the connection string**

Example connection string:
```
mysql://username:password@aws.connect.psdb.cloud/project-management?ssl={"rejectUnauthorized":true}
```

## Step 4: Add to Vercel Environment Variables

In Vercel dashboard, add:

```
DATABASE_URL = mysql://username:password@aws.connect.psdb.cloud/project-management?ssl={"rejectUnauthorized":true}

# Or individual variables:
DB_HOST = aws.connect.psdb.cloud
DB_USER = your_username
DB_PASSWORD = your_password  
DB_NAME = project-management
DB_PORT = 3306
DB_SSL = true
```

## Step 5: Update Database Code

Your existing code should work! PlanetScale is MySQL compatible.

## Benefits of PlanetScale

✅ **Free tier**: 5GB storage, 1 billion row reads/month
✅ **Automatic backups**
✅ **Global edge network**
✅ **Branching** (like Git for databases)
✅ **No server management**
✅ **Built-in security**
✅ **MySQL compatible**

## Free Tier Limits

- **Storage**: 5GB
- **Row reads**: 1 billion/month  
- **Row writes**: 10 million/month
- **Connections**: 1,000 concurrent
- **Branches**: 1 production + 1 development

**Perfect for your project management system!**