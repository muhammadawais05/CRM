# CRM Platform Architecture

## Stack

- **Framework**: Next.js App Router
- **Language**: TypeScript
- **Database**: PostgreSQL via Prisma
- **Styling**: Tailwind CSS
- **Auth**: JWT-based session cookie
- **Deployment**: Vercel / Railway / Fly.io / custom Docker

## Folder structure

- `app/`
  - `api/`
    - `auth/`
      - `login/route.ts`
      - `logout/route.ts`
      - `session/route.ts`
    - `leads/`
      - `route.ts`
      - `[id]/route.ts`
      - `[id]/activities/route.ts`
      - `[id]/followups/route.ts`
    - `import/route.ts`
    - `export/route.ts`
  - `leads/`
    - `page.tsx`
    - `[id]/page.tsx`
  - `login/page.tsx`
  - `page.tsx`
  - `layout.tsx`
  - `globals.css`
- `app/components/` - shared UI pieces
- `app/lib/` - shared helper modules and Prisma client
- `prisma/` - database schema and seeds
- `public/` - static assets
- `.env.example` - environment variable template
- `README.md` - project setup and overview
- `ARCHITECTURE.md` - design and deployment notes

## Database schema

### User

- `id`
- `fullName`
- `email`
- `passwordHash`
- `role` (`ADMIN`, `SALES`)
- `createdAt`, `updatedAt`

### Lead

- `id`
- `fullName`
- `companyName`
- `website`
- `email`
- `phone`
- `linkedIn`
- `socialLinks`
- `industry`
- `country`
- `source`
- `notes`
- `status` (`NEW_LEAD`, `RESEARCHING`, `READY_FOR_OUTREACH`, `CONTACTED`, `FOLLOW_UP_1`, `FOLLOW_UP_2`, `INTERESTED`, `MEETING_BOOKED`, `PROPOSAL_SENT`, `WON`, `LOST`)
- `assignedToId`
- `createdAt`, `updatedAt`

### Activity

- `id`
- `leadId`
- `actorId`
- `type`
- `message`
- `metadata`
- `createdAt`

### FollowUp

- `id`
- `leadId`
- `ownerId`
- `dueDate`
- `note`
- `status` (`PENDING`, `COMPLETED`, `OVERDUE`)
- `completedAt`
- `createdAt`, `updatedAt`

## API structure

### Authentication

- `POST /api/auth/login` — login credentials
- `POST /api/auth/logout` — clear session cookie
- `GET /api/auth/session` — validate session

### Leads

- `GET /api/leads` — list leads with query filters
- `POST /api/leads` — create a new lead
- `GET /api/leads/:id` — get lead detail
- `PUT /api/leads/:id` — update lead
- `DELETE /api/leads/:id` — remove lead

### Lead interactions

- `GET /api/leads/:id/activities` — lead timeline activity
- `POST /api/leads/:id/activities` — add activity note
- `GET /api/leads/:id/followups` — follow-up list
- `POST /api/leads/:id/followups` — schedule follow-up

### Import / Export

- `POST /api/import` — import CSV leads
- `GET /api/export` — export lead CSV

## UI screen map

- **Login** — secure credentials and session
- **Dashboard** — summary cards, pipeline stage chart, top reps
- **Leads list** — search, filters, table view, import/export actions
- **Lead detail** — profile, timeline, notes, follow-ups
- **Kanban board** — stage-based visual pipeline (planned)
- **Responsive design** — mobile-friendly layout
- **Dark/light mode** — base theme support via Tailwind

## Deployment steps

1. Create database and set `DATABASE_URL`.
2. Set `JWT_SECRET` for session token signing.
3. Install dependencies: `npm install`
4. Generate Prisma client: `npm run prisma:generate`
5. Apply migrations: `npm run prisma:migrate`
6. Seed initial users: `npm run prisma:seed`
7. Build for production: `npm run build`
8. Start app: `npm run start`

### Recommended deployment providers

- **Vercel** — easy for Next.js app router
- **Railway** — managed Postgres + environment variables
- **Fly.io** — full-stack deployment for internal tools

## Future integration roadmap

- Gmail sync and outreach logging
- LinkedIn enrichment and profile search
- Aircall call logging and click-to-dial
- WhatsApp messaging workflows
- AI lead scoring and intent prediction
