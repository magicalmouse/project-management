# Job Application Dashboard

This dashboard provides a comprehensive view of job applications and interview statistics.

## Features

### Key Statistics
- **Total Applications**: Shows the total number of job applications submitted
- **Total Interviews**: Displays the total number of interviews scheduled
- **This Month**: Applications submitted in the current month
- **This Week**: Applications submitted in the current week

### Charts and Visualizations
- **Applications Over Time**: Line chart showing application trends
- **Interviews Over Time**: Line chart showing interview scheduling trends
- **Application Status**: Donut chart showing the breakdown of application statuses

### Recent Activity
- **Recent Applications**: List of the most recent job applications
- **Upcoming Interviews**: List of scheduled interviews with join links

### Interview Progress
- **Scheduled**: Number of interviews that are scheduled
- **Completed**: Number of interviews that have been completed
- **Cancelled**: Number of interviews that were cancelled

## Data Sources

The dashboard pulls data from:
- `proposals` table: Job applications submitted by users
- `interviews` table: Interview records with meeting details

## Navigation

The dashboard is accessible via:
- Main navigation menu: "Job Dashboard"
- Direct URL: `/job-dashboard`

## Technical Details

- **Service**: `dashboardService.ts` handles data fetching and statistics calculation
- **Component**: `index.tsx` contains the main dashboard UI
- **Charts**: Uses the existing chart components for visualizations
- **Mock Data**: Includes fallback mock data for testing when no real data is available

## Future Enhancements

- Add filtering by date ranges
- Include more detailed analytics
- Add export functionality for reports
- Implement real-time updates
- Add in-app notifications for upcoming interviews 