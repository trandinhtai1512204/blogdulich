'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import api, { refreshAccessToken } from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

const AUTH_REFRESH_INTERVAL_MS = 10 * 1000;

function AuthSessionManager() {
  const { user, setUser, clearUser } = useAuthStore();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const syncUser = async () => {
      try {
        const res = await api.get('/auth/me');
        if (!cancelled) setUser(res.data);
      } catch {
        if (!cancelled) clearUser();
      }
    };

    const refreshSession = async () => {
      try {
        await refreshAccessToken();
      } catch {
        if (!cancelled) clearUser();
      }
    };

    syncUser();
    const intervalId = window.setInterval(refreshSession, AUTH_REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [clearUser, setUser, userId]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 10,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthSessionManager />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
