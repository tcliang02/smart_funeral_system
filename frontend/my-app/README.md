# Smart Funeral System Frontend

This is the frontend application for the Smart Funeral System, built with **Next.js 16** (App Router) and React.

## Development Guide

### Project Structure

The frontend is organized as follows:

```
frontend/my-app/
├── public/                    # Static assets
│   ├── fonts/                 # Custom fonts
│   └── images/                # Static images
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (main)/            # Route groups
│   │   ├── api/               # API routes (Next.js API)
│   │   ├── layout.tsx         # Root layout
│   │   └── ...
│   ├── components/            # Reusable UI components
│   │   ├── ui/                # Basic UI elements
│   │   ├── Layout.jsx         # Layout wrapper
│   │   ├── Navbar.jsx         # Navigation
│   │   ├── Footer.jsx         # Footer
│   │   └── ...
│   ├── pages/                 # Page components (migrated from React Router)
│   ├── lib/                   # Utility libraries
│   ├── AuthContext.jsx        # Authentication context
│   └── ...
├── docs/                      # Documentation files
├── package.json               # Dependencies and scripts
└── next.config.js             # Next.js configuration
```

### Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `env.example` to `.env.local`
   - Fill in required values (see `docs/SETUP_ENV.md`)

3. Start the development server:
   ```bash
   npm run dev
   ```
   
   The app will be available at http://localhost:3000

4. Build for production:
   ```bash
   npm run build
   ```

5. Start production server:
   ```bash
   npm start
   ```

### Architecture

- **Framework**: Next.js 16 with App Router
- **Routing**: File-based routing in `src/app/`
- **Navigation**: Next.js `useRouter` and `Link` components
- **Styling**: Tailwind CSS + CSS modules
- **State Management**: React Context API (`AuthContext`)
- **API**: Next.js API routes in `src/app/api/` that proxy to PHP backend

### Authentication

User authentication is handled via JWT tokens and managed through the `AuthContext`. Protected routes use the `ProtectedRouteNext` component to restrict access based on user roles.

### API Integration

The frontend uses Next.js API routes (`src/app/api/`) that communicate with the PHP backend. All API calls are centralized in the API route handlers.

### Documentation

See the `docs/` directory for detailed setup guides, deployment instructions, and troubleshooting.

## Available Scripts

- `npm run dev` - Start Next.js development server (Turbopack)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
