'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { Globe, User, BookOpen, MapPin, Route, Star, Menu, X } from 'lucide-react';

export function Navbar({ opaque = false, logoOnlyUntilScroll = false }: { opaque?: boolean; logoOnlyUntilScroll?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const isOpaque = opaque || scrolled;
  const logoOnly = logoOnlyUntilScroll && !isOpaque;
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [

    { label: 'Điểm đến ', href: '/diem-den', icon: <MapPin size={15} /> },
    { label: 'Lịch trình ', href: '/lich-trinh', icon: <Route size={15} /> },
    { label: 'Review', href: '/review', icon: <Star size={15} /> },
    { label: 'Kinh nghiệm', href: '/kinh-nghiem', icon: <BookOpen size={15} /> },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isOpaque ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-transparent'
    }`}>
      <div className="w-full px-6 md:px-10 lg:px-14 h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src={logoOnly ? '/logo-black.png' : isOpaque ? '/logo-color.png' : '/logo-white.png'}
            alt="BlogDuLich.vn"
            width={623}
            height={120}
            className="h-9 w-auto object-contain"
            priority
          />
        </Link>

        {/* Center Nav Links */}
<div className={`${logoOnly ? 'hidden' : 'hidden lg:flex'} items-center gap-1`}>
  {navLinks.map((link) => (
    <Link
      key={link.label}
      href={link.href}
      className={`flex items-center gap-1.5 px-5 py-2 rounded-full transition-all duration-200 text-sm font-bold ${
        isOpaque
          ? 'text-gray-950 hover:bg-[#F37021]/10 hover:text-[#0A2D5B]'
          : 'text-white hover:text-white hover:bg-white/10'
      }`}
    >
      {link.icon}
      {link.label}
    </Link>
  ))}
</div>

        {/* Right Side */}

        <div className={`${logoOnly ? 'hidden' : 'flex'} items-center gap-3`}>
          <button className={`p-2 rounded-full transition-all ${
            isOpaque ? 'text-gray-950 hover:bg-gray-100' : 'text-white/80 hover:bg-white/10'
          }`}>
            <Globe size={20} />
          </button>

          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className={`lg:hidden p-2 rounded-full transition-all ${
              isOpaque ? 'text-gray-950 hover:bg-gray-100' : 'text-white hover:bg-white/10'
            }`}
            aria-label="Mở menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-bold ${
                  isOpaque ? 'text-gray-950 hover:bg-gray-100' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <img
                  src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(user.email)}`}
                  alt={user.name || user.email}
                  className="w-7 h-7 rounded-full bg-[#F37021]/10 object-cover"
                />
                <span className="hidden md:inline">{user.name || user.email.split('@')[0]}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  {user.role === 'admin' && (
                    <Link href="/admin" onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-gray-50">
                      ⚙️ Quản trị
                    </Link>
                  )}
                  <hr className="my-1" />
                  <button onClick={() => { logout(); router.push('/'); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                    🚪 Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login"
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-bold ${
                  isOpaque ? 'text-gray-950 hover:bg-gray-100' : 'text-white/80 hover:bg-white/10'
                }`}>
                <User size={18} />
                Đăng nhập
              </Link>
              <Link href="/register"
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95 ${
                  scrolled
                    ? 'bg-[#F37021] text-white shadow-md hover:bg-[#d95f18]'
                    : 'bg-white text-gray-900 shadow-lg hover:bg-gray-50'
                }`}>
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
      {mobileMenuOpen && (
        <div className={`lg:hidden border-t ${isOpaque ? 'border-gray-200 bg-white' : 'border-white/20 bg-black/55 backdrop-blur-md'}`}>
          <div className="px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm ${
                  isOpaque ? 'font-bold text-gray-950 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            {!user && (
              <div className="flex items-center gap-2 mt-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}
                  className={`flex-1 text-center py-2 rounded-lg text-sm font-bold ${isOpaque ? 'bg-gray-100 text-gray-950' : 'bg-white/15 text-white'}`}>
                  Đăng nhập
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 rounded-lg text-sm font-semibold bg-[#F37021] text-white">
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
