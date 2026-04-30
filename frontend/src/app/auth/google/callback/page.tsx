import { Suspense } from 'react';
import GoogleCallbackClient from './GoogleCallbackClient';

export const dynamic = 'force-dynamic';

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Đang đăng nhập với Google...</p>
          </div>
        </div>
      }
    >
      <GoogleCallbackClient />
    </Suspense>
  );
}