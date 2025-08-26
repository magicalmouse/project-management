# Resume JSON and PDF Generation Feature

## Overview

This feature enhances the resume management system by adding the ability to save resumes in structured JSON format and convert them to PDF files when needed.

## Features Added

### 1. Structured JSON Data Storage
- Resumes are now saved with both text content and structured JSON data
- JSON format includes organized sections for:
  - Personal information (name, location, email, phone, LinkedIn)
  - Summary
  - Skills (programming languages, frontend, backend, database, cloud, tools)
  - Work experience (title, company, duration, location, responsibilities)
  - Education (degree, institution, location, year)

### 2. PDF Generation
- Convert structured JSON data to professional PDF format
- Uses the existing ResumePDF component for consistent formatting
- Download PDF files with timestamped filenames

### 3. Enhanced Resume Modal
- **Download JSON**: Generate and download structured JSON file
- **Download PDF**: Generate and download PDF file
- **Save Resume**: Save both text and JSON data to database
- All operations include proper loading states and error handling

## Technical Implementation

### Files Modified

1. **`src/pages/management/user/project/detail/resume-modal.tsx`**
   - Added JSON generation functionality
   - Added PDF conversion capability
   - Enhanced UI with new download buttons
   - Improved error handling and user feedback

2. **`src/api/services/resumeService.ts`**
   - Updated `SavedResume` interface to include `resume_json` field
   - Modified API calls to handle JSON data

3. **`src/types/resume.ts`**
   - New type definitions for structured resume data

4. **`src/utils/resume-utils.ts`**
   - Utility functions for JSON generation
   - File download helpers
   - Timestamped filename generation

### Database Schema Update

The saved resumes table now includes a `resume_json` field to store structured data:

```sql
ALTER TABLE saved_resumes ADD COLUMN resume_json TEXT;
```

## Usage

### For Users

1. **Open Resume Modal**: When editing a resume, the modal now shows additional buttons
2. **Download JSON**: Click "Download JSON" to get structured data file
3. **Download PDF**: Click "Download PDF" to get formatted PDF file
4. **Save Resume**: Click "Save Resume" to store both text and JSON data

### For Developers

#### Generating JSON from Resume Text

```typescript
import { generateResumeJson } from '@/utils/resume-utils';

const jsonData = await generateResumeJson(resumeText, jobDescription);
```

#### Converting JSON to PDF

```typescript
import { convertJsonToPdf } from '@/utils/resume-utils';

const pdfBlob = await convertJsonToPdf(jsonData);
```

#### Downloading Files

```typescript
import { downloadJsonFile, downloadPdfFile, generateTimestampedFilename } from '@/utils/resume-utils';

const filename = generateTimestampedFilename("resume", "json");
downloadJsonFile(jsonData, filename);
```

## Benefits

1. **Data Structure**: Resumes are now stored in a structured format that's easier to process and analyze
2. **Flexibility**: JSON format allows for easy data manipulation and integration with other systems
3. **PDF Generation**: On-demand PDF creation without losing the structured data
4. **Backward Compatibility**: Existing text-based resumes continue to work
5. **Future Extensibility**: Structured data enables advanced features like resume comparison, skill analysis, etc.

## Error Handling

- All operations include proper error handling with user-friendly messages
- Loading states prevent multiple simultaneous operations
- Graceful fallbacks when AI services are unavailable
- Validation ensures data integrity before saving

## Dependencies

- `@react-pdf/renderer`: For PDF generation
- `sonner`: For toast notifications
- OpenAI API: For JSON structure generation

## Future Enhancements

1. **Resume Templates**: Use JSON data to apply different visual templates
2. **Skill Analysis**: Analyze and categorize skills from structured data
3. **Resume Comparison**: Compare multiple resumes using structured data
4. **Export Formats**: Support additional export formats (Word, HTML, etc.)
5. **Batch Operations**: Process multiple resumes simultaneously 