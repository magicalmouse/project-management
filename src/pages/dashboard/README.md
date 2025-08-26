# Role-Based Dashboard System

This project implements a role-based dashboard system that provides different views and functionality based on user roles.

## Overview

The dashboard system automatically detects the user's role and displays the appropriate dashboard:

- **Admin Dashboard** (`role === 0`): Comprehensive analytics and system-wide statistics
- **User Dashboard** (`role === 1`): Personalized job application tracking and progress

## Components

### 1. Main Dashboard Component

- **Purpose**: Route handler that determines which dashboard to display based on user role
- **Logic**: 
  - If `user.role === 0` → Admin Dashboard
  - Otherwise → User Dashboard

### 2. Admin Dashboard
- **File**: `src/pages/dashboard/admin-dashboard.tsx`
- **Features**:
  - Total application numbers across all users
  - Total interview schedules system-wide
  - Active users count
  - Success rate metrics
  - Application & interview trends
  - Applications by status (Applied, Interviewing, Offered, Rejected)
  - Recent applications from all users
  - Upcoming interviews across the system
  - Export functionality for data analysis

### 3. User Dashboard
- **File**: `src/pages/dashboard/user-dashboard.tsx`
- **Features**:
  - Personal application tracking
  - Individual interview progress
  - Response rate for user's applications
  - Average response time metrics
  - Personal application & interview trends
  - User's applications by status
  - Recent personal applications
  - Upcoming personal interviews
  - Quick action buttons (New Application, Schedule Interview, Update Resume)

## Data Flow

### Dashboard Service
- **File**: `src/api/services/dashboardService.ts`
- **Function**: `getDashboardStats(userId, userRole)`
- **Role-based filtering**:
  - **Admin**: Sees all applications and interviews in the system
  - **User**: Sees only their own applications and interviews

### Key Statistics
Both dashboards provide:
- Total applications and interviews
- Time-based filtering (Today, This Week, This Month)
- Trend calculations
- Recent activity lists
- Status breakdowns

## User Role Detection

The system uses the `user.role` field from the authentication context:
- `role === 0`: Admin user
- `role === 1`: Regular user

This is set during login in `src/store/userStore.ts` and used throughout the application.

## Customization

### Adding New Metrics
1. Update the `DashboardStats` interface in `dashboardService.ts`
2. Add the calculation logic in the service
3. Display the new metrics in the appropriate dashboard component

### Modifying Dashboard Layout
1. Edit the respective dashboard component file
2. Update the chart configurations and data structures
3. Test with both admin and user roles

## Testing

To test the role-based functionality:

1. **Admin User**:
   - Login with admin credentials (`admin@example.com`)
   - Navigate to Job Dashboard
   - Should see comprehensive system-wide statistics

2. **Regular User**:
   - Login with regular user credentials
   - Navigate to Job Dashboard
   - Should see personalized job application tracking

## Future Enhancements

- Add role-based permissions for specific dashboard sections
- Implement real-time data updates
- Add more granular filtering options
- Create custom dashboard builder for admins
- Add export functionality for user data 