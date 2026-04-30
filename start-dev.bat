start cmd /k "cd backend && npm run start:dev"
start cmd /k "cd backend && stripe listen --forward-to localhost:3001/api/payments/webhook"
start cmd /k "cd frontend && npm run dev"