# SmartComply Web

SmartComply Web is a compliance management application built with Next.js 13, Supabase, and Tailwind CSS. It provides auditors and compliance teams with tools to create, manage, and track audit checklists, documents, and user profiles through a modern web interface.

## Features

- **Authentication**: Supabase Auth with email/password and secure session management
- **Protected Routes**: Middleware-based route protection for authenticated users
- **Audit Management**: Create, view history, and detail pages for audits
- **Checklist Workflows**: Dynamic, filterable checklists for compliance assessments
- **Document Handling**: Upload, preview, and download compliance documents
- **User Management**: Role-based user setup, profile management, and invitations
- **Theming**: Light/dark mode switcher
- **Notifications**: Toast messages for user feedback

## Technologies

- Next.js 13 (App Router)
- React and React Server Components
- Supabase (Client & Admin SDKs)
- Tailwind CSS
- ShadCN UI Components
- TypeScript

## Prerequisites

- Node.js v18 or higher
- pnpm (recommended) or npm
- A Supabase project (create at [Supabase Dashboard](https://app.supabase.com))

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/<your-org>/smartcomply_web.git
   cd smartcomply_web
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Configure environment**

   Copy `.env.example` to `.env.local` and update with your Supabase credentials:

   ```ini
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   SUPABASE_SERVICE_KEY=<your-supabase-service-role-key>
   ```

4. **Run development server**

   ```bash
   pnpm dev
   ```

   - Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

```bash
pnpm build
pnpm start
```

- The production build will run on [http://localhost:3000](http://localhost:3000) by default.

## Available Tasks

- **dev-server**: Starts the Next.js development server (`pnpm dev`)
- **build**: Builds the application for production (`pnpm build`)
- **start**: Starts the production server (`pnpm start`)

## Project Structure

```text
├─ app/                 # Next.js App Router routes and layouts
├─ components/          # Reusable UI components
├─ hooks/               # Custom React hooks
├─ lib/                 # API clients, authentication utils, types
├─ public/              # Static assets
├─ utils/               # Helper functions and utilities
├─ frontend/            # Additional client modules (if any)
└─ README.md            # Project overview and setup instructions
```

## Application Routes

### Public Routes

- `/` - Home page or redirect to dashboard if authenticated
- `/test-page` - Example/test page for development

### Authentication

- `/auth/sign-in` - Sign-in page for users
- `/auth/forgot-password` - Request password reset
- `/auth/callback` - OAuth callback handling
- `/auth/confirm` - Email confirmation flow

### Invitation Flow

- `/invite/[token]` - Accept invitation and set up user profile via token

### Protected Routes (requires authentication)

- `/protected` - Base layout for authenticated users
  - `/protected/page` - Main dashboard overview
  - `/protected/Audit` - Audit list and history views
  - `/protected/checklist` - Create, fill, and preview compliance checklists
  - `/protected/documents` - Upload, preview, and download documents
  - `/protected/profile` - User profile management
  - `/protected/user-management` - Admin user setup and roles

### API Endpoints

- `/api/user-management/*` - Server-side functions for managing users

## Contributing

Contributions are welcome! Please open issues and pull requests to improve features, fix bugs, or enhance documentation.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
