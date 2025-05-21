# SmartComply Web

A modern authentication-enabled web application built with Next.js, React, and Supabase, following the MVC (Model-View-Controller) pattern.

## Features

- User Signup and Login with Supabase Auth
- Session-based Dashboard Access (protected route)
- MVC code structure for maintainability
- Styled with Tailwind CSS

## Project Structure

```text
smartcomply_web/
├── src/
│   ├── app/
│   │   ├── login/         # Login page (View)
│   │   ├── signup/        # Signup page (View)
│   │   ├── dashboard/     # Protected dashboard (View)
│   │   ├── layout.tsx     # App layout
│   │   └── ...
│   ├── controllers/       # Controllers (business logic)
│   ├── models/            # Models (Supabase logic)
│   └── lib/
│       └── supabase/      # Supabase client setup
├── public/                # Static assets
├── package.json           # Project dependencies
└── ...
```

## Getting Started

### 1. Install Dependencies

```pwsh
npm install
```

### 2. Configure Supabase

- Create a project at [Supabase](https://supabase.com/).
- Copy your Supabase URL and Anon Key.
- Create a `.env.local` file in the root of `smartcomply_web/`:

  ```env
  NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  ```

### 3. Run the Development Server

```pwsh
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

## Usage

- **Sign Up:** Register a new user account.
- **Login:** Access your account.
- **Dashboard:** Only accessible when logged in. Redirects to login if not authenticated.

## Code Style

- Follows MVC: business logic in `controllers/`, data access in `models/`, UI in `app/`.
- Uses functional React components and hooks.

## License

MIT


