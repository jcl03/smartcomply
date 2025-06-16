# Audit Functionality - SmartComply

## Overview

The Audit functionality provides a comprehensive system for reviewing and managing audit history. The system supports role-based access control where:

- **Users** can only view their own audits
- **Managers/Admins** can view all audits in the system

## Features

### Audit History Page (`/protected/Audit`)

1. **Dashboard Integration**: Accessible via the main navigation menu
2. **Search & Filter**: 
   - Search by audit title, form type, or auditor name
   - Filter by status (pending, completed, draft)
   - Filter by result (pass, failed)
3. **Summary Statistics**: Shows total audits, passed, failed, and pending counts
4. **Audit Cards**: Display key information including:
   - Audit title and result badge
   - Form type and compliance information
   - Score and percentage
   - Creation date and last modified date
   - Comments preview
   - Progress bar visualization

### Audit Detail Page (`/protected/Audit/[id]`)

1. **Comprehensive View**: Shows complete audit information
2. **Three-Tab Interface**:
   - **Overview**: Audit metadata and form information
   - **Form Responses**: Detailed view of all form submissions
   - **Comments**: Audit comments and notes
3. **Score Visualization**: Visual representation of audit results
4. **Role-Based Access**: Users can only access their own audits unless they're managers

## Database Structure

The audit system uses the following tables:

### `audit` Table
```sql
id                - Unique audit identifier
form_id          - Reference to the form used
user_id          - Reference to the user who performed the audit
status           - Current status (pending, completed, draft)
created_at       - Audit creation timestamp
last_edit_at     - Last modification timestamp (auto-updated)
result           - Pass/fail result
marks            - Numerical score
percentage       - Percentage score
comments         - Audit comments
title            - Audit title
audit_data       - JSON data containing form responses
```

### `form` Table
```sql
id               - Unique form identifier
form_schema      - JSON schema defining form structure
compliance_id    - Reference to compliance type
status           - Form status (active, archive, draft)
date_created     - Form creation timestamp
```

## Security & Permissions

1. **Row Level Security (RLS)**: Enabled on audit table
2. **Access Policies**:
   - Users can view/edit only their own audits
   - Managers/admins can view all audits
   - Only system can set final results (marks, percentage)
3. **Route Protection**: All audit routes require authentication
4. **Role Validation**: Server-side role checking for manager access

## Components

### `AuditHistoryComponent`
- Located: `components/audit/audit-history.tsx`
- Provides search, filtering, and listing functionality
- Responsive design with mobile support

### `AuditDetailView`
- Located: `components/audit/audit-detail-view.tsx`
- Tabbed interface for detailed audit review
- Read-only view (no editing capabilities)

## API Functions

### `getUserAudits(userId)`
- Fetches audits for a specific user
- Returns audit data with form and compliance information

### `getAllAudits()`
- Fetches all audits (manager/admin only)
- Returns complete audit dataset

### `getAuditById(id)`
- Fetches a specific audit by ID
- Includes form schema and compliance details

## Navigation

The audit functionality is integrated into the main dashboard navigation:
- Menu item: "Audit History"
- Icon: CheckCircle
- Route: `/protected/Audit`

## Usage

1. **Viewing Audits**:
   - Navigate to "Audit History" from the main menu
   - Use search and filters to find specific audits
   - Click "View Details" to see complete audit information

2. **Manager Access**:
   - Managers see all audits from all users
   - Additional user information is displayed
   - Full system-wide audit overview

3. **User Access**:
   - Users see only their own audit submissions
   - Personal audit history and progress tracking
   - Read-only access to completed audits

## Future Enhancements

Potential improvements to consider:
- Audit comparison functionality
- Export capabilities (PDF, CSV)
- Audit scheduling and reminders
- Advanced analytics and reporting
- Audit workflow management
- Comment threading and collaboration
