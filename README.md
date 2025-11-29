# Smart Funeral System

A comprehensive digital funeral service management platform that connects bereaved families with service providers, enables online memorial creation and tribute management, facilitates funeral service bookings with Buddhist ceremony customization, and provides AI-powered voice memorial and grief support features.

## Features

- **Service Provider Management**: Package creation, availability calendar, booking management
- **Family Services**: Memorial creation, service booking, document upload
- **Memorial & Tribute**: Public tribute pages, condolence messages, RSVP management
- **AI Features**: Voice cloning, AI chatbot, memory collection
- **Booking System**: Real-time availability, package selection, add-on customization

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes + PHP endpoints
- **Database**: PostgreSQL (Supabase)
- **Storage**: Supabase Storage
- **Authentication**: JWT with role-based access

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (or Supabase account)

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd smart_funeral_system
```

2. Navigate to frontend
```bash
cd frontend/my-app
```

3. Install dependencies
```bash
npm install
```

4. Set up environment variables
```bash
cp env.example .env.local
# Edit .env.local with your configuration
```

5. Run development server
```bash
npm run dev
```

## Deployment

### Vercel Deployment

1. Push to GitHub/GitLab
2. Import project in Vercel
3. Set root directory to `frontend/my-app`
4. Configure environment variables in Vercel dashboard
5. Deploy

## Project Structure

```
smart_funeral_system/
├── frontend/
│   └── my-app/          # Next.js application
│       ├── src/
│       │   ├── app/     # Next.js App Router
│       │   ├── pages/   # React pages
│       │   └── lib/     # Utilities
│       └── api/         # PHP legacy endpoints
├── backend/             # PHP backend files
└── database/            # SQL scripts
```

## Environment Variables

Required environment variables (see `frontend/my-app/env.example`):

- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `JWT_SECRET` - JWT signing secret
- `ELEVENLABS_API_KEY` - ElevenLabs API key (for voice cloning)

## License

Academic Project

