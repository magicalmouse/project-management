#!/bin/bash

# Project Management System - MySQL Setup Script
echo "🚀 Setting up Project Management System with MySQL..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo "Please create a .env file with your MySQL configuration:"
    echo ""
    echo "VITE_DB_HOST=172.86.88.195"
    echo "VITE_DB_USER=your_mysql_username"
    echo "VITE_DB_PASSWORD=your_mysql_password"
    echo "VITE_DB_NAME=project_management"
    echo "VITE_DB_PORT=3306"
    echo "VITE_JWT_SECRET=your-super-secret-jwt-key-change-this-in-production"
    echo "VITE_RESET_PASSWORD_URL=http://localhost:5173/reset-password"
    echo ""
    exit 1
fi

echo "✅ .env file found"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check if MySQL schema exists
echo "🗄️  Checking database setup..."
echo "Please make sure you have run the database schema:"
echo "mysql -h 172.86.88.195 -u your_username -p"
echo "source src/api/database/schema.sql;"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the development server:"
echo "pnpm dev"
echo ""
echo "Then visit: http://localhost:5173"
echo "Default login: admin@example.com / admin123"
echo ""
echo "⚠️  Remember to change the default password in production!"