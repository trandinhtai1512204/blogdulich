import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let refreshPromise: Promise<void> | null = null;

function clearPersistedAuth() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('auth-user');
  window.dispatchEvent(new Event('auth:logout'));
}

export function refreshAccessToken() {
  refreshPromise ??= axios
    .post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
    .then(() => undefined)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url ?? '';
    const isAuthRequest =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/refresh');

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;

      try {
        await refreshAccessToken();
        return api(originalRequest);
      } catch {
        if (typeof window !== 'undefined') {
          clearPersistedAuth();
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
