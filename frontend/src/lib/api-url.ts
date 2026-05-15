export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://blogdulich-backend.onrender.com/api'
    : 'http://localhost:3001/api');
