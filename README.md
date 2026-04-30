# Blogdulich — Hotel Booking Platform

> Nền tảng đặt phòng khách sạn full-stack, inspired by Hopper

## 🚀 Tech Stack

**Backend:** NestJS · Prisma · PostgreSQL (Supabase) · JWT · Stripe · Resend

**Frontend:** Next.js 14 · TypeScript · Tailwind CSS · Zustand

## ✨ Features

- 🔐 Authentication (JWT + Email Verification + Google OAuth)
- 🏨 Hotel search với filter, pagination
- 📅 Booking system với overlap detection
- 💳 Stripe payment integration + Webhook
- ⏰ Auto-expire booking (Cron job)
- 📧 Email confirmation (Resend)
- 👑 Admin dashboard
- 🌙 Dark mode

## 📸 Screenshots
<!-- thêm ảnh chụp màn hình vào đây -->

## 🛠️ Setup

### Backend
\`\`\`bash
cd backend
npm install
cp .env.example .env  # điền API keys
npx prisma migrate dev
npm run start:dev
\`\`\`

### Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

## 📝 Environment Variables

### Backend (.env)
\`\`\`
DATABASE_URL=
JWT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
CLIENT_URL=
\`\`\`

### Frontend (.env.local)
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:3001/api
\`\`\`