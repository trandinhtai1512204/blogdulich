# Blogdulich.vn — Travel Blog & Hotel Booking Platform

![Next.js](https://img.shields.io/badge/Next.js_15-000?logo=next.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)

A full-stack travel blog and hotel booking web application. Users can read travel guides, explore destinations, and book hotels with online payment via Stripe.

## Features

### User-facing
- Browse travel posts organized by destination, itinerary, experience, cost, and review
- Full-text search across all posts
- Hotel listings with filtering by city and price range
- Hotel booking with real-time availability tracking
- Online payment via **Stripe**
- Email confirmation via **Resend**
- User authentication: email/password + **Google OAuth 2.0**
- Email verification on registration
- Hotel reviews and ratings

### Admin panel
- Dashboard with overview stats
- CRUD for posts, hotels, cities, categories, users, bookings
- Image upload via **Cloudinary**
- Role-based access control (admin / user)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Backend | NestJS, TypeScript, REST API |
| Database | PostgreSQL (hosted on Supabase) |
| ORM | Prisma |
| Auth | JWT, Passport.js, Google OAuth 2.0 |
| Payment | Stripe |
| Email | Resend |
| Storage | Cloudinary |
| Scheduler | @nestjs/schedule (auto-cancel expired bookings) |

## Architecture

```
blogdulich/
├── frontend/          # Next.js App Router
│   └── src/app/
│       ├── (public)   # Home, posts, destinations, hotels
│       └── admin/     # Admin dashboard (protected)
└── backend/           # NestJS REST API
    └── src/
        ├── auth/      # JWT + Google OAuth
        ├── users/
        ├── posts/
        ├── hotels/
        ├── cities/
        ├── categories/
        ├── bookings/  # Booking logic + cron job
        ├── payments/  # Stripe webhook handling
        ├── reviews/
        ├── upload/    # Cloudinary
        └── mail/      # Resend email service
```

## Data Model

- **User** — authentication, roles, bookings, reviews
- **City** — travel destinations (slug-based routing)
- **Hotel** — listings with room availability, price indexing
- **Booking** — status lifecycle: pending → confirmed / cancelled / failed
- **Payment** — Stripe payment records linked to bookings
- **Post** — travel content with geo-coordinates (lat/lng)
- **Category** — hierarchical taxonomy (parent/child) with 6 types
- **Review** — one review per user per hotel (unique constraint)

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Supabase)

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in your credentials
npx prisma migrate dev
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Backend runs on `http://localhost:3001`, frontend on `http://localhost:3000`.

## Environment Variables

See `backend/.env.example` for all required variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `STRIPE_SECRET_KEY` | Stripe API key for payments |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature secret |
| `RESEND_API_KEY` | Resend API key for transactional email |
| `CLOUDINARY_*` | Cloudinary credentials for image upload |
| `GOOGLE_CLIENT_ID/SECRET` | Google OAuth 2.0 credentials |
| `CLIENT_URL` | Frontend URL (for CORS and email links) |

## API Overview

| Module | Endpoints |
|--------|-----------|
| Auth | `POST /api/auth/register`, `/login`, `/google`, `/verify-email` |
| Posts | `GET /api/posts`, `GET /api/posts/:slug`, `POST /api/posts` |
| Hotels | `GET /api/hotels`, `GET /api/hotels/:slug` |
| Bookings | `POST /api/bookings`, `GET /api/bookings/my` |
| Payments | `POST /api/payments/checkout`, `POST /api/payments/webhook` |
| Reviews | `POST /api/reviews`, `GET /api/reviews/hotel/:id` |
| Cities | `GET /api/cities` |
| Upload | `POST /api/upload/image` |
