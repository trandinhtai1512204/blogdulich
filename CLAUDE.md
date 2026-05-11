# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Travel blog platform (blogdulich.vn) — monorepo with two sub-projects:
- `backend/` — NestJS REST API, Prisma ORM, PostgreSQL (Supabase)
- `frontend/` — Next.js 16 App Router, Tailwind CSS v4, shadcn/ui, Zustand, TanStack Query

## Commands

### Backend (`cd backend`)
```bash
npm run start:dev        # Dev with watch
npm run build            # Compile to dist/
npm run start:prod       # Run compiled (node dist/main)
npm run lint             # ESLint --fix
npm run test             # Jest unit tests
npm run test:e2e         # E2E tests
npx prisma generate      # Regenerate Prisma client after schema change
npx prisma migrate dev   # Create and apply migration
npx prisma studio        # GUI for the database
npm run seed             # Run prisma/seed.ts
```

### Frontend (`cd frontend`)
```bash
npm run dev              # Next.js dev server on :3000
npm run build            # Production build
npm run lint             # ESLint
```

## Architecture

### Backend — NestJS Module Pattern

Each domain is a self-contained module in `src/<domain>/`:
- `auth/` — JWT + Google OAuth (currently custom, migrating to Supabase Auth)
- `users/` — user CRUD
- `cities/` — city entities with slugs
- `hotels/` — hotel listings, linked to cities
- `posts/` — blog posts with composite slug `[categoryId, slug]`
- `categories/` — hierarchical categories (ROOT → SUBTYPE → CITY → SUB) with `CategoryType` enum
- `taxonomy/` — unified category/city taxonomy queries
- `bookings/` — hotel bookings with expiry cron job (`bookings.cron.ts`)
- `payments/` — Stripe integration; webhook at `/api/payments/webhook` uses raw body parser
- `reviews/` — hotel reviews (unique per user+hotel)
- `upload/` — Cloudinary image uploads
- `mail/` — Resend email service for verification emails
- `prisma/` — global `PrismaService` singleton via `PrismaModule`

`AppModule` imports all modules. `ConfigModule.forRoot({ isGlobal: true })` makes env vars available everywhere. `ScheduleModule.forRoot()` powers the bookings expiry cron.

### Auth (current — being replaced)

Custom JWT implementation:
- `JwtAuthGuard` + `jwt.strategy.ts` — validates `Authorization: Bearer <token>` header
- `AdminGuard` (roles.guard.ts) — checks `request.user.role === 'admin'`
- Token payload: `{ sub: userId, email, role }`; expires 7d
- Google OAuth via `passport-google-oauth20` → `google.strategy.ts`
- Email verification with UUID token stored in `users.verifyToken`

### Database — Prisma + Supabase PostgreSQL

Schema at `backend/prisma/schema.prisma`. Key relationships:
- `User` → `Booking[]`, `Review[]`
- `City` → `Hotel[]`, `Post[]`, `Category[]`
- `Hotel` → `Booking[]`, `Review[]`
- `Category` self-referential parent/children tree
- `Post` composite unique on `[categoryId, slug]`
- `Booking` → `Payment` (one-to-one)

Two DB URLs required: `DATABASE_URL` (pooled) and `DIRECT_URL` (direct, for migrations).

### Frontend — Next.js App Router

Structure:
- `src/app/` — pages using App Router conventions
- `src/app/admin/` — admin dashboard; `layout.tsx` guards by checking `user.role === 'admin'` in Zustand store
- `src/app/auth/google/callback/` — handles Google OAuth token from URL param
- `src/components/` — shared components; `ui/` is shadcn
- `src/store/auth.store.ts` — Zustand with `persist` middleware; stores `user` and `token` in `localStorage` under key `auth-storage`
- `src/lib/axios.ts` — axios instance; interceptor auto-attaches `Authorization: Bearer` from `localStorage`

Routing: `[...slug]` catch-all handles SEO-friendly taxonomy URLs. Post slugs are composite — always paired with category.

### External Services

| Service | Purpose | Config |
|---|---|---|
| Supabase | PostgreSQL database | `DATABASE_URL`, `DIRECT_URL` |
| Cloudinary | Image uploads | `CLOUDINARY_*` env vars |
| Stripe | Payments | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| Resend | Transactional email | `RESEND_API_KEY` |
| Google OAuth | Social login | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` |

### CORS

Allowed origins are hardcoded in `backend/src/main.ts` plus `process.env.CLIENT_URL`. Add new origins there if needed.

### Deployment

- Backend: deploys from `dist/` (committed to repo); entry point `dist/src/main.js`
- Frontend: Vercel (config at `frontend/.vercel/project.json`)
