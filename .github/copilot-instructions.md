# Copilot Instructions for Smart Funeral System

## Project Overview
- **Architecture:**
  - Monorepo with `backend` (PHP API scripts) and `frontend/my-app` (React + Vite SPA).
  - Data flows from frontend (user/provider actions) to backend via HTTP requests (likely using fetch/axios).
  - Backend scripts (e.g., `getPackages.php`, `addPackage.php`) act as REST-like endpoints for CRUD operations.
  - Frontend is organized by pages (`src/pages`), shared components (`src/components`), and static data (`src/data`).

## Key Workflows
- **Frontend Development:**
  - Use `npm install` and `npm run dev` in `frontend/my-app` to start the React/Vite dev server.
  - Main entry: `src/main.jsx`, root component: `src/App.jsx`.
  - Routing and page logic in `src/pages`, navigation in `src/components/Navbar.jsx`.
  - Styles: CSS modules per component/page (e.g., `About.css`, `Button.css`).
- **Backend Development:**
  - PHP scripts in `backend/` are entry points for API calls.
  - Database connection via `db_connect.php` (likely MySQL, see script for details).
  - No framework detected; scripts are procedural and endpoint-focused.

## Patterns & Conventions
- **Frontend:**
  - React functional components, hooks (useState/useEffect), and prop-driven design.
  - Page components in `src/pages`, reusable UI in `src/components`.
  - Data files (e.g., `providers.js`, `addons.js`) for static lists.
  - Protected routes via `ProtectedRoute.jsx`.
- **Backend:**
  - Each PHP file handles a single responsibility (e.g., add, delete, update, get).
  - API expects POST/GET requests with JSON or form data.
  - Error handling is basic; responses are usually JSON-encoded.

## Integration Points
- **Frontend <-> Backend:**
  - API endpoints: `/backend/*.php` (relative to project root).
  - Example: `fetch('/backend/getPackages.php')` from React.
- **External Dependencies:**
  - Frontend: React, Vite, ESLint (see `package.json`).
  - Backend: PHP, MySQL (see `db_connect.php`).

## Examples
- **Adding a Package:**
  - Frontend: Calls `backend/addPackage.php` with package data.
  - Backend: `addPackage.php` inserts into DB, returns status JSON.
- **Provider Profile:**
  - Frontend: Calls `backend/getProviderProfile.php` for details.
  - Backend: Returns provider info from DB.

## Tips for AI Agents
- Reference `src/pages` for user flows and business logic.
- Reference `backend/` for API contract and DB logic.
- Use relative paths for API calls from frontend to backend.
- Follow existing file naming and component structure for new features.
- For new backend endpoints, copy the pattern of existing PHP scripts.

---
If any section is unclear or missing, please provide feedback for improvement.