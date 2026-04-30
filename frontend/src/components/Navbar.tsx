'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { Globe, User, BookOpen, MapPin, Route, Wallet, Star, Menu, X } from 'lucide-react';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
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
    { label: 'Lịch trình ', href: '/lich-trinh-du-lich', icon: <Route size={15} /> },
    { label: 'Chi phí ', href: '/chi-phi-du-lich', icon: <Wallet size={15} /> },
    { label: 'Review', href: '/review', icon: <Star size={15} /> },
    { label: 'Kinh nghiệm', href: '/kinh-nghiem', icon: <BookOpen size={15} /> },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-transparent'
    }`}>
      <div className="w-full px-4 md:px-6 h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-sky-500 to-blue-700 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7l9 5 9-5-9-5zM3 17l9 5 9-5M3 12l9 5 9-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className={`text-lg md:text-xl tracking-tight transition-colors font-bold ${scrolled ? 'text-gray-900' : 'text-white'}`}
            style={{ letterSpacing: '-0.02em' }}>
            blogdulich
          </span>
        </Link>

        {/* Center Nav Links */}
<div className="hidden lg:flex items-center gap-1">
  {navLinks.map((link) => (
    <Link
      key={link.label}
      href={link.href}
      className={`flex items-center gap-1.5 px-5 py-2 rounded-full transition-all duration-200 text-sm font-medium ${
        scrolled
          ? 'text-gray-600 hover:bg-gray-100 hover:text-violet-600'
          : 'text-white hover:text-white hover:bg-white/10'
      }`}
    >
      {link.icon}
      {link.label}
    </Link>
  ))}
</div>

        {/* Right Side */}
        
        <div className="flex items-center gap-3">
          <button className={`p-2 rounded-full transition-all ${
            scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white/80 hover:bg-white/10'
          }`}>
            <Globe size={20} />
          </button>

          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className={`lg:hidden p-2 rounded-full transition-all ${
              scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
            }`}
            aria-label="Mở menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-medium ${
                  scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-linear-to-br from-violet-500 to-purple-700 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {(user.name || user.email)[0].toUpperCase()}
                  </span>
                </div>
                <span className="hidden md:inline">{user.name || user.email.split('@')[0]}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  {user.role === 'admin' && (
                    <Link href="/admin" onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
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
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-medium ${
                  scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white/80 hover:bg-white/10'
                }`}>
                <User size={18} />
                Đăng nhập
              </Link>
              <Link href="/register"
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95 ${
                  scrolled
                    ? 'bg-violet-600 text-white shadow-md hover:bg-violet-700'
                    : 'bg-white text-gray-900 shadow-lg hover:bg-gray-50'
                }`}>
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
      {mobileMenuOpen && (
        <div className={`lg:hidden border-t ${scrolled ? 'border-gray-200 bg-white' : 'border-white/20 bg-black/55 backdrop-blur-md'}`}>
          <div className="px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm ${
                  scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            {!user && (
              <div className="flex items-center gap-2 mt-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}
                  className={`flex-1 text-center py-2 rounded-lg text-sm font-semibold ${scrolled ? 'bg-gray-100 text-gray-700' : 'bg-white/15 text-white'}`}>
                  Đăng nhập
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 rounded-lg text-sm font-semibold bg-violet-600 text-white">
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