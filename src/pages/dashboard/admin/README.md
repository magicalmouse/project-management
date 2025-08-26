# Admin Dashboard

A comprehensive admin dashboard for managing the project management system, providing oversight of all user applications, interviews, and system analytics.

## Features

### 🎯 Overview Dashboard
- **Key Metrics**: Total applications, interviews, active users, and success rates
- **Real-time Charts**: Applications and interviews trends, status distributions
- **Quick Insights**: Top companies, performance indicators

### 📊 Applications Management
- **Complete Overview**: All member applications across the system
- **Advanced Filtering**: Search by company, user, status, and time periods
- **Status Tracking**: Applied, Interviewing, Offered, Rejected applications
- **Export Functionality**: Download data for analysis
- **Statistics**: Application trends and company analysis

### 📅 Interview Scheduling
- **Calendar View**: Visual schedule with interview dates highlighted
- **Interview Management**: View, edit, and track all interviews
- **Progress Tracking**: Scheduled, Completed, Cancelled interviews
- **Meeting Links**: Direct access to interview meeting rooms
- **Upcoming Alerts**: This week's upcoming interviews

### 📈 Advanced Analytics
- **Performance Metrics**: Conversion rates, success rates, response rates
- **Trend Analysis**: 12-month historical data and patterns
- **User Performance**: Top performing users and their metrics
- **Company Analysis**: Success rates by company
- **Time-based Filtering**: Today, Week, Month, All time views

### 👥 User Management
- **User Statistics**: Total, active, and new users
- **Activity Tracking**: User engagement metrics
- **Performance Overview**: Applications per user, success rates

## URL Access

The admin dashboard is accessible at `/admin-dashboard` and requires admin permissions (`permission:admin`).

## Components Structure

```
src/pages/dashboard/admin/
├── index.tsx                          # Main admin dashboard
├── components/
│   ├── ApplicationsOverview.tsx       # Comprehensive applications management
│   ├── InterviewsManagement.tsx       # Interview scheduling and calendar
│   └── AnalyticsGraphs.tsx           # Advanced analytics and charts
└── README.md                          # This documentation
```

## Features by Tab

### Overview Tab
- System-wide key performance indicators
- Quick visual insights with charts
- Top companies and recent activity

### Applications Tab
- Searchable and filterable applications table
- Status distribution charts
- Company performance analysis
- Export capabilities

### Interviews Tab
- Interactive calendar with interview dates
- Upcoming interviews widget
- Interview progress tracking
- Meeting management tools

### Analytics Tab
- Multiple analytics views (Overview, Trends, Performance, Companies)
- Time series analysis
- Conversion funnel analysis
- User and company performance metrics

### Users Tab
- User statistics and activity metrics
- Performance indicators
- Growth tracking

## Access Control

- **Route Protection**: Only accessible by admin users (role === 0)
- **Automatic Redirect**: Non-admin users are redirected to `/job-dashboard`
- **Navigation**: Added to admin-only navigation menu

## Data Sources

The dashboard integrates with multiple API services:
- `dashboardService`: Overall statistics and trends
- `proposalService`: Application data
- `interviewService`: Interview and scheduling data
- `userService`: User management data

## Real-time Features

- Live data fetching from APIs
- Time-based filtering (Today, Week, Month, All time)
- Interactive charts and graphs
- Search and filter capabilities
- Pagination for large datasets

## Technology Stack

- **React + TypeScript**: Component architecture
- **Tailwind CSS**: Responsive styling
- **Chart.js**: Data visualization
- **React Router**: Navigation and routing
- **API Integration**: RESTful services