# Compliance Management System Database Setup

## Overview
This guide will help you set up the required database tables for the Compliance Management System in your Supabase project.

## Prerequisites
- A Supabase project created and configured
- Access to the Supabase SQL Editor
- The `view_user_profiles` table should already exist (this appears to be part of your existing user management system)

## Setup Instructions

### 1. Execute Database Schema
1. Open your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database-setup.sql`
4. Click "Run" to execute the SQL statements

### 2. Verify Tables Created
After running the SQL, you should have the following tables:
- `compliance` - Stores compliance framework definitions
- `form` - Stores dynamic form schemas linked to compliance frameworks

### 3. Verify RLS Policies
The setup includes Row Level Security (RLS) policies that:
- Allow admin users full access to both tables
- Allow all authenticated users to read compliance frameworks and forms
- Ensure data security through user role-based access

## Table Schemas

### `compliance` Table
- `id` (UUID, Primary Key)
- `name` (TEXT, Unique) - Framework name
- `created_at` (TIMESTAMP)

### `form` Table  
- `id` (UUID, Primary Key)
- `compliance_id` (UUID, Foreign Key) - Links to compliance framework
- `name` (TEXT) - Form name
- `form_schema` (JSONB) - Dynamic form configuration
- `created_at` (TIMESTAMP)

## Sample Data
The setup script includes sample compliance frameworks and a GDPR assessment form to help you get started quickly.

## Testing the Setup
Once the database is set up, you can:
1. Start the development server: `npm run dev`
2. Navigate to `/protected/compliance` 
3. Verify you can view existing frameworks
4. Test creating new frameworks (admin users only)
5. Test creating and editing forms within frameworks

## Troubleshooting
- Ensure your user has the 'admin' role in the `view_user_profiles` table to create/edit frameworks
- Check that RLS policies are properly applied
- Verify all foreign key relationships are correctly established

## Next Steps
After database setup:
1. Test the compliance framework CRUD operations
2. Test the dynamic form builder and preview functionality
3. Customize form schemas as needed for your compliance requirements
