<div align="center"> 
<br> 
<br>
<img src="./src/assets/icons/ic-logo.svg" height="140" />
<h3> Project Management </h3>
  <p>
    <p style="font-size: 14px">
      Project Mangement is a modern admin dashboard template built with React 19, Vite, shadcn/ui, and TypeScript. It is designed to help developers easily manage working systems.
    </p>
    <br />
    <br />
    <br />
    <br />
</div>


## Features

- Built using React 19 hooks.
- Powered by Vite for rapid development and hot module replacement.
- Integrates shadcn/ui, providing a rich set of UI components and design patterns.
- Written in TypeScript, offering type safety and an improved development experience.
- Responsive design, adapting to various screen sizes and devices.
- Flexible routing configuration, supporting nested routes.
- Integrated access control based on user roles.
- Supports internationalization for easy language switching.
- Includes common admin features like user management, role management, and permission management.
- Customizable themes and styles to meet your branding needs.
- Mocking solution based on MSW and Faker.js.
- State management using Zustand.
- Data fetching using React-Query.

## Quick Start

### Prerequisites

Before setting up the project, ensure you have:
- **Node.js** (version 20.x or higher)
- **MySQL Server** running on your VPS (172.86.88.195)
- **pnpm** package manager

### 1. Get the Project Code

```bash
git clone https://github.com/d3george/slash-admin.git
cd slash-admin
```

### 2. Install Dependencies

In the project's root directory, run the following command to install project dependencies:

```bash
pnpm install
```

### 3. Database Setup

#### 3.1 Configure Environment Variables

Create a `.env` file in the root directory with your MySQL configuration:

```bash
# MySQL Database Configuration
VITE_DB_HOST=172.86.88.195
VITE_DB_USER=your_mysql_username
VITE_DB_PASSWORD=your_mysql_password
VITE_DB_NAME=project_management
VITE_DB_PORT=3306

# JWT Secret (IMPORTANT: Change this to a secure random string in production)
VITE_JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Application URLs
VITE_RESET_PASSWORD_URL=http://localhost:5173/reset-password
```

#### 3.2 Create Database Schema

Connect to your MySQL server and create the database:

```bash
# Connect to MySQL on your VPS
mysql -h 172.86.88.195 -u your_username -p

# The schema file will automatically create the database and tables
# Just run the schema file directly:
source src/api/database/schema.sql;

# Verify tables were created
USE project_management;
SHOW TABLES;
```

This will create the following tables:
- **`users`** - User accounts and authentication (stores email, password hash, roles)
- **`profiles`** - User profile information (personal details, job preferences)
- **`proposals`** - Job applications (job applications and submissions)
- **`interviews`** - Interview records (interview scheduling and progress)
- **`user_sessions`** - JWT refresh token management (secure session handling)
- **`password_reset_tokens`** - Password reset functionality (secure password resets)

### 4. Backend Setup (Required for Dashboard Analytics)

#### 4.1 Install Backend Dependencies
```bash
cd backend
npm install
```

#### 4.2 Configure Backend Environment
Create `backend/.env` file with your database configuration:
```env
DB_HOST=172.86.88.195
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=project_management
DB_PORT=3306
PORT=4000
```

#### 4.3 Start Backend Server
```bash
cd backend
npm start
```

The backend API will run on `http://localhost:4000`.

### 5. Start the Frontend Development Server

In a new terminal, run the following command to start the frontend development server:

```bash
pnpm dev
```

Visit [http://localhost:5173](http://localhost:5173) to view your application.

### 6. Admin User Setup

The admin user has been created in your database with the following credentials:

```
Email: admin@example.com  (used as username identifier) 
Password: admin123
```

⚠️ **IMPORTANT**: Change this password immediately after first login in production!

**Note**: If you need to create additional admin users in the future, you can do so through the application's user management interface after logging in as an admin.

### 7. Test Database Connection

To verify your database connection is working:

1. Open the browser console after starting the application
2. Look for "Connected to MySQL database successfully" message
3. If you see connection errors, verify your `.env` configuration

### Troubleshooting

#### Database Connection Issues
- Verify MySQL server is running on your VPS
- Check firewall settings allow connections on port 3306
- Ensure your MySQL user has proper permissions
- Test connection manually: `mysql -h 172.86.88.195 -u your_username -p`

#### Build Issues
- Make sure all dependencies are installed: `pnpm install`
- Clear node_modules and reinstall if needed: `rm -rf node_modules && pnpm install`
- Check that TypeScript compilation passes: `pnpm build`

#### Environment Variables
- Ensure `.env` file is in the root directory
- Verify all required variables are set
- Restart development server after changing `.env`

### Build for Production

Run the following command to build the production version:

```bash
pnpm build
```

## Quick Reference

### Essential Commands
```bash
# Frontend setup
pnpm install                    # Install frontend dependencies
pnpm dev                        # Start frontend development server
pnpm build                      # Build frontend for production

# Backend setup
cd backend                      # Navigate to backend directory
npm install                     # Install backend dependencies
npm start                       # Start backend API server
npm run dev                     # Start backend with nodemon (auto-restart)

# Full stack development (use two terminals)
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend  
pnpm dev

# Production build
pnpm build                      # Build frontend
cd backend && npm start         # Run backend in production
```

### Important Files
- **`.env`** - Frontend environment configuration (create this file)
- **`backend/.env`** - Backend environment configuration (create this file)
- **`src/api/database/schema.sql`** - Database schema
- **`backend/server.js`** - Backend API server
- **`backend/package.json`** - Backend dependencies

### Default Access
- **Frontend URL**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **Admin Username**: admin@example.com
- **Admin Password**: admin123 (⚠️ Change in production!)

### Need Help?
- Check the [Troubleshooting](#troubleshooting) section above
- Verify your MySQL server is accessible from your development machine
- Ensure your `.env` file is properly configured

## Git Contribution submission specification
- `feat` new features
- `fix`  fix the
- `docs` documentation or comments
- `style` code format (changes that do not affect code execution)
- `refactor` refactor
- `perf` performance optimization
- `revert` revert commit
- `test` test related
- `chore` changes in the construction process or auxiliary tools
- `ci` modify CI configuration and scripts
- `types` type definition file changes
- `wip` in development


## Database Information

### Technology Stack
- **Database**: MySQL
- **Authentication**: Custom JWT-based authentication  
- **VPS Location**: 172.86.88.195

### Database Schema
The MySQL database includes the following tables:
- **`users`** - User accounts and authentication data
- **`profiles`** - User profile information  
- **`proposals`** - Job applications and submissions
- **`interviews`** - Interview scheduling and records
- **`user_sessions`** - JWT refresh token management
- **`password_reset_tokens`** - Password reset functionality

### Security Features
- ✅ JWT-based authentication with refresh tokens
- ✅ Password hashing using bcryptjs (12 rounds)
- ✅ SQL injection protection via prepared statements
- ✅ Session management with automatic cleanup
- ✅ Secure password reset functionality

## Backend API Server

This project includes a dedicated **Node.js Express backend** that provides API endpoints for dashboard analytics, test data management, and database operations.

### Backend Technology Stack
- **Node.js** with **Express.js** framework
- **MySQL** database with **mysql2** driver
- **CORS** enabled for frontend communication
- **Environment variable** configuration via dotenv

### Backend Architecture

```
backend/
├── server.js          # Express server and API routes
├── db.js             # MySQL connection pool and query helper
├── dashboard.js      # Dashboard analytics logic
├── seed.js           # Test data seeding and cleanup
├── .env             # Database configuration
└── package.json     # Backend dependencies
```

### API Endpoints

#### Dashboard Analytics
```http
GET /api/dashboard/stats?userId={userId}&userRole={userRole}
```
- **Purpose**: Fetch dashboard statistics based on user role
- **Parameters**:
  - `userId`: User ID for filtering data (regular users see only their data)
  - `userRole`: 0 = Admin (sees all data), 1 = Regular user (sees only own data)
- **Response**: Complete dashboard statistics including applications, interviews, trends, and admin-specific analytics

#### Test Data Management
```http
POST /api/dashboard/seed-test-data
```
- **Purpose**: Populate database with realistic test data
- **Creates**: 3 test users, 5 job applications, 3 interviews
- **Response**: `{ "success": true }` on success

```http
POST /api/dashboard/clear-test-data
```
- **Purpose**: Remove all test data from database
- **Removes**: All users with @example.com emails and their associated data
- **Response**: `{ "success": true }` on success

### Backend Setup

#### 1. Install Backend Dependencies
```bash
cd backend
npm install express mysql2 dotenv cors
```

#### 2. Configure Environment Variables
Create `backend/.env` file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=project_management
DB_PORT=3306
PORT=4000
```

#### 3. Start Backend Server
```bash
cd backend
node server.js
```

The backend will run on `http://localhost:4000` by default.

#### 4. Update Frontend Configuration
The frontend automatically calls the backend API for all dashboard data:
- **Development**: `http://localhost:4000/api/dashboard/*`
- **Production**: Update API URLs to your deployed backend

### Backend Features

#### Role-Based Data Access
- **Admin Users (role = 0)**:
  - Access to all applications and interviews across all users
  - Enhanced analytics: total users, active users, top companies, conversion rates
  - System-wide statistics and trends
  
- **Regular Users (role = 1)**:
  - Access only to their own applications and interviews
  - Personal statistics and progress tracking
  - Individual performance metrics

#### Database Analytics
The backend provides real-time analytics including:
- **Basic Metrics**: Total applications, interviews, success rates
- **Time-Based Data**: Daily, weekly, monthly breakdowns
- **Trend Analysis**: Application and interview trends over time
- **Admin Analytics**: User activity, top companies, conversion metrics
- **Status Tracking**: Application statuses, interview progress

#### Data Validation & Security
- ✅ **SQL Injection Protection**: All queries use prepared statements
- ✅ **Role-Based Access Control**: Users can only access their own data
- ✅ **Error Handling**: Graceful error responses with proper HTTP status codes
- ✅ **CORS Configuration**: Secure cross-origin requests from frontend
- ✅ **Environment Configuration**: Sensitive data stored in environment variables

### Development Workflow

#### Full Stack Development
1. **Start Backend**:
   ```bash
   cd backend
   node server.js
   ```

2. **Start Frontend** (in separate terminal):
   ```bash
   npm run dev
   ```

3. **Test Integration**:
   - Visit `http://localhost:5173` (frontend)
   - Backend API available at `http://localhost:4000`
   - Dashboard data flows from MySQL → Backend API → Frontend

#### Database Operations
- **Add Test Data**: Use "Add Test Data to DB" button in admin dashboard
- **Clear Test Data**: Use "Clear Test Data" button to reset
- **View Real Data**: All statistics reflect actual database content
- **Monitor Logs**: Backend console shows all API requests and database operations

### Production Deployment

#### Backend Deployment
1. **Deploy to Server**: Upload `backend/` folder to your production server
2. **Install Dependencies**: `npm install express mysql2 dotenv cors`
3. **Configure Environment**: Update `backend/.env` with production database credentials
4. **Start Service**: Use PM2 or similar process manager
   ```bash
   pm2 start server.js --name "project-management-api"
   ```

#### Frontend Integration
Update frontend API calls to use production backend URL:
```typescript
const API_BASE = "https://your-backend-domain.com/api/dashboard";
```

### Monitoring & Maintenance

#### Health Checks
- **Database Connection**: Monitor MySQL connectivity
- **API Response Times**: Track endpoint performance
- **Error Rates**: Monitor failed requests and database errors

#### Backup & Recovery
- **Database Backups**: Regular MySQL dumps
- **Application Logs**: Backend request/error logging
- **Environment Config**: Secure storage of environment variables
