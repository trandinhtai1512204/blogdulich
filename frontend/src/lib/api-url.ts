const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;

if (process.env.NODE_ENV === 'production' && !configuredApiUrl) {
  // Fail loudly during production builds instead of silently calling a stale
  // backend URL and rendering empty pages after deploy.
  throw new Error('Missing NEXT_PUBLIC_API_URL for production frontend build');
}

export const API_BASE_URL = configuredApiUrl || 'http://localhost:3001/api';
