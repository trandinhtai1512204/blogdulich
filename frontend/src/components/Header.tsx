'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Header() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg hopper-gradient flex items-center justify-center">
            <span className="text-white text-sm font-bold">✈</span>
          </div>
          <span className="text-xl font-bold text-[#1A1A2E]">tripviet</span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/hotels" className="text-gray-600 hover:text-[#6B4EFF] font-medium transition text-sm">
            Khách sạn
          </Link>
          <Link href="/posts" className="text-gray-600 hover:text-[#6B4EFF] font-medium transition text-sm">
            Blog du lịch
          </Link>
          {user?.role === 'admin' && (
            <Link href="/admin" className="text-gray-600 hover:text-[#6B4EFF] font-medium transition text-sm">
              Quản trị
            </Link>
          )}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition"
              >
                <div className="w-7 h-7 rounded-full hopper-gradient flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {(user.name || user.email)[0].toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user.name || user.email.split('@')[0]}
                </span>
                <span className="text-gray-400 text-xs">▼</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <Link
                    href="/my-bookings"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    📋 Booking của tôi
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      ⚙️ Quản trị
                    </Link>
                  )}
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                  >
                    🚪 Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-[#6B4EFF] transition"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium text-white px-4 py-2 rounded-full hopper-gradient hover:opacity-90 transition"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}