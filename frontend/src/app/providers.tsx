'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import api, { refreshAccessToken } from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

// Rotate refresh token mỗi 60s để giảm cửa sổ replay nếu token bị lộ.
// Supabase có reuse window 10s nên 60s là an toàn, không tạo race condition.
// Backend đã throttle /auth/refresh ở 30 req/phút/IP để chặn spam Postman.
// Mọi xử lý "session đã chết" tập trung ở axios interceptor (khi API thật sự trả 401).
const AUTH_REFRESH_INTERVAL_MS = 60 * 1000;

function AuthSessionManager() {
  const { user, setUser } = useAuthStore();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    api.get('/auth/me')
      .then((res) => { if (!cancelled) setUser(res.data); })
      .catch(() => { /* interceptor lo redirect nếu thật sự 401 */ });

    const intervalId = window.setInterval(() => {
      refreshAccessToken().catch(() => {
        /* swallow: access token còn sống thì vẫn login, interceptor sẽ xử lý khi cần */
      });
    }, AUTH_REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [setUser, userId]);

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
