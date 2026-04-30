'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/axios';

export default function GoogleCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      router.push('/login');
      return;
    }

    localStorage.setItem('token', token);
    api.get('/auth/me')
      .then((res) => {
        setAuth(res.data, token);
        router.push('/');
      })
      .catch(() => router.push('/login'));
  }, [router, searchParams, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Đang đăng nhập với Google...</p>
      </div>
    </div>
  );
}

