'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Hotel, MapPin, FileText,
  Users, CreditCard, LogOut, ChevronRight,
  Tag, Menu, X, TrendingUp
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/hotels', label: 'Khách sạn', icon: Hotel },
  { href: '/admin/cities', label: 'Thành phố', icon: MapPin },
  { href: '/admin/posts', label: 'Bài viết', icon: FileText },
  { href: '/admin/categories', label: 'Chuyên mục', icon: Tag },
  { href: '/admin/users', label: 'Người dùng', icon: Users },
  { href: '/admin/bookings', label: 'Bookings', icon: CreditCard },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'admin') { router.push('/'); return; }
  }, [user]);

  if (!user || user.role !== 'admin') return null;

  const handleLogout = () => { logout(); router.push('/'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold">✈</span>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-none">tripviet</p>
            <p className="text-[10px] text-gray-400 leading-none mt-0.5 font-medium uppercase tracking-wider">Admin</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}>
              <Icon size={16} className={isActive ? 'text-violet-600' : 'text-gray-400 group-hover:text-gray-600'} />
              {label}
              {isActive && <ChevronRight size={12} className="ml-auto text-violet-400" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gray-50 mb-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {(user.name || user.email)[0].toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-800 truncate">{user.name || 'Admin'}</p>
            <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
        <Link href="/" className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 rounded-xl transition-colors font-medium mb-1">
          <TrendingUp size={13} /> Xem trang khách
        </Link>
        <button onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium">
          <LogOut size={13} /> Đăng xuất
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="w-60 bg-white border-r border-gray-100 fixed h-full z-30 hidden lg:flex flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-white flex flex-col shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 lg:ml-60 min-h-screen">
        {/* Mobile topbar */}
        <div className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
            <Menu size={18} className="text-gray-600" />
          </button>
          <span className="font-bold text-gray-900 text-sm">Admin Panel</span>
        </div>
        {children}
      </main>
    </div>
  );
}