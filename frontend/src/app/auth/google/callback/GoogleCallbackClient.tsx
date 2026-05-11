'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/axios';

// Backend đã set httpOnly cookie và redirect về đây.
// Chỉ cần fetch /auth/me để lấy user info vào store.
export default function GoogleCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      router.push('/login?error=oauth_failed');
      return;
    }

    api.get('/auth/me')
      .then((res) => {
        setUser(res.data);
        router.push('/');
      })
      .catch(() => router.push('/login'));
  }, [router, searchParams, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Đang đăng nhập với Google...</p>
      </div>
    </div>
  );
}
