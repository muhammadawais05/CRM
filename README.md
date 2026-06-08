# CRM Platform

Modern internal CRM platform for a software agency focused on cold outreach and lead management.

## Architecture

- **Framework**: Next.js + TypeScript
- **Database**: PostgreSQL via Prisma
- **Styling**: Tailwind CSS
- **Auth**: JWT-based credentials with secure cookie sessions
- **UI**: Dashboard, table, kanban, lead detail, import/export

## Features

- Login / Logout
- Admin and Sales Rep roles
- Lead management with full profile fields
- Pipeline stages and kanban board
- Activity timeline and follow-up tracking
- CSV import/export
- Filters, search, dark/light mode

## Setup

1. Copy `.env.example` to `.env`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set `DATABASE_URL` to a PostgreSQL database connection string.
   - For Supabase, use the `DATABASE_URL` from your project settings.
4. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```
5. Apply migrations:
   ```bash
   npm run prisma:migrate
   ```
6. Start development server:
   ```bash
   npm run dev
   ```

## Deployment

- Use Vercel, Railway, Fly.io, or Supabase for a managed Postgres database.
- Create separate environment variable sets for staging and production.
- Set `DATABASE_URL` and `JWT_SECRET` in each environment.
- Build:
  ```bash
  npm run build
  ```
- Start:
  ```bash
  npm run start
  ```

## Database schema

See `prisma/schema.prisma` for the lead, user, activity, and follow-up models.

## API Overview

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`
- `GET /api/leads`
- `POST /api/leads`
- `GET /api/leads/:id`
- `PUT /api/leads/:id`
- `DELETE /api/leads/:id`
- `GET /api/leads/:id/activities`
- `POST /api/leads/:id/followups`
- `POST /api/import`
- `GET /api/export`
