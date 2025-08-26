# Saved Resumes Feature

## Overview

The Saved Resumes feature allows users to save modified resumes that are tailored for specific job applications. This enables users to link the appropriate modified resume when scheduling calls for specific job descriptions.

## Features

### 1. Save Modified Resumes
- Users can save resumes that have been modified/tailored for specific job applications
- Each saved resume includes:
  - Original resume content
  - Modified resume content
  - Job description
  - Company name (optional)
  - Job posting link (optional)
  - Creation and update timestamps

### 2. Resume Management
- View all saved resumes for a user/profile
- Search saved resumes by company, job description, or resume content
- Delete saved resumes
- Copy resume content to clipboard

### 3. Integration with Job Applications
- Link saved resumes to job applications when creating proposals
- Select from previously saved resumes when editing job applications
- Maintain the connection between modified resumes and specific job opportunities

## Database Schema

### saved_resumes Table
```sql
CREATE TABLE saved_resumes (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user VARCHAR(36) NOT NULL,
  profile VARCHAR(36) NOT NULL,
  original_resume TEXT NOT NULL,
  modified_resume TEXT NOT NULL,
  job_description TEXT NOT NULL,
  company VARCHAR(255),
  job_link TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (profile) REFERENCES profiles(id) ON DELETE CASCADE
);
```

## API Endpoints

### GET /api/saved-resumes
Get list of saved resumes with optional filters
- Query parameters: `userId`, `profileId`, `page`, `limit`, `company`, `jobDescription`

### GET /api/saved-resumes/:id
Get a specific saved resume by ID
- Query parameters: `userId` (optional, for user-specific access)

### POST /api/saved-resumes
Create a new saved resume
- Body: `user`, `profile`, `originalResume`, `modifiedResume`, `jobDescription`, `company`, `jobLink`

### PUT /api/saved-resumes/:id
Update an existing saved resume
- Body: Same as POST

### DELETE /api/saved-resumes/:id
Delete a saved resume
- Query parameters: `userId` (optional, for user-specific access)

## Frontend Components

### ResumeModal
- Enhanced with "Save Resume" functionality
- Allows users to save modified resumes with metadata
- Includes a save modal for entering company and job link information

### SavedResumesModal
- Displays list of saved resumes
- Search functionality
- Resume selection for job applications
- Copy and delete operations

### ProjectModal
- Updated to include "Saved Resumes" button
- Allows selection of previously saved resumes
- Automatically populates form fields when a saved resume is selected

## Usage Workflow

1. **Create Job Application**: User creates a new job application with job description
2. **Edit Resume**: User clicks "Edit" to modify resume for the specific job
3. **Save Resume**: User clicks "Save Resume" to store the modified version
4. **Schedule Call**: When scheduling a call, user can select the appropriate saved resume
5. **Link Resume**: The saved resume is linked to the job application for future reference

## Setup Instructions

### Backend Setup
1. Run the database schema creation:
   ```bash
   cd backend
   node create-tables.js
   ```

2. Test the saved resumes functionality:
   ```bash
   node test-saved-resumes.js
   ```

3. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup
1. The frontend components are already integrated into the existing project structure
2. No additional setup required - the functionality is available in the project management interface

## Benefits

1. **Efficiency**: Users don't need to recreate tailored resumes for similar job applications
2. **Organization**: Clear tracking of which resume version was used for which job
3. **Consistency**: Ensures the right resume is linked to the right job application
4. **Time Savings**: Quick access to previously tailored resumes
5. **Better Tracking**: Maintains history of resume modifications for different job opportunities

## Future Enhancements

1. **Resume Versioning**: Track multiple versions of the same resume
2. **ATS Scoring**: Include ATS compatibility scores for saved resumes
3. **Resume Templates**: Pre-built templates for different job types
4. **Export Options**: Export saved resumes in different formats
5. **Analytics**: Track which saved resumes lead to successful applications 