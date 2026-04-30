'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Hotel, MapPin, FileText, Users, CreditCard,
  TrendingUp, Clock, CheckCircle, XCircle,
  ArrowRight, ArrowUpRight, DollarSign, Activity
} from 'lucide-react';
import api from '@/lib/axios';

interface Stats {
  totalHotels: number;
  totalCities: number;
  totalPosts: number;
  totalUsers: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalHotels: 0, totalCities: 0, totalPosts: 0, totalUsers: 0,
    totalBookings: 0, pendingBookings: 0, confirmedBookings: 0,
    cancelledBookings: 0, totalRevenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/hotels?limit=1'),
      api.get('/cities'),
      api.get('/posts?limit=1'),
      api.get('/users'),
    ]).then(([hotels, cities, posts, users]) => {
      const allUsers: any[] = users.data;
      let totalBookings = 0, pending = 0, confirmed = 0, cancelled = 0, revenue = 0;
      const allBookings: any[] = [];

      // Aggregate bookings from users
      Promise.all(
        allUsers.slice(0, 10).map((u: any) =>
          api.get(`/users/${u.id}`).then((r) => {
            const bookings = r.data.bookings || [];
            bookings.forEach((b: any) => {
              totalBookings++;
              if (b.status === 'pending') pending++;
              if (b.status === 'confirmed') { confirmed++; revenue += b.totalPrice; }
              if (b.status === 'cancelled') cancelled++;
              allBookings.push({ ...b, user: { name: u.name, email: u.email } });
            });
          }).catch(() => {})
        )
      ).then(() => {
        allBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRecentBookings(allBookings.slice(0, 5));
        setStats({
          totalHotels: hotels.data.meta?.total || 0,
          totalCities: cities.data.length || 0,
          totalPosts: posts.data.meta?.total || 0,
          totalUsers: allUsers.length || 0,
          totalBookings, pendingBookings: pending,
          confirmedBookings: confirmed, cancelledBookings: cancelled,
          totalRevenue: revenue,
        });
        setLoading(false);
      });
    }).catch(() => setLoading(false));
  }, []);

  const STAT_CARDS = [
    { label: 'Khách sạn', value: stats.totalHotels, icon: Hotel, color: 'violet', href: '/admin/hotels', delta: '+2 tuần này' },
    { label: 'Thành phố', value: stats.totalCities, icon: MapPin, color: 'blue', href: '/admin/cities', delta: 'Hoạt động' },
    { label: 'Bài viết', value: stats.totalPosts, icon: FileText, color: 'green', href: '/admin/posts', delta: 'Đã xuất bản' },
    { label: 'Người dùng', value: stats.totalUsers, icon: Users, color: 'orange', href: '/admin/users', delta: 'Đã đăng ký' },
  ];

  const COLOR_MAP: Record<string, string> = {
    violet: 'bg-violet-50 text-violet-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    pending: { label: 'Chờ TT', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    confirmed: { label: 'Đã xác nhận', color: 'bg-green-50 text-green-700 border-green-200' },
    cancelled: { label: 'Đã huỷ', color: 'bg-gray-50 text-gray-500 border-gray-200' },
    failed: { label: 'Thất bại', color: 'bg-red-50 text-red-600 border-red-200' },
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.03em' }}>
          Dashboard
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Revenue highlight */}
      <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} className="text-white/70" />
            <span className="text-white/70 text-sm font-medium">Tổng doanh thu</span>
          </div>
          <p className="text-4xl font-extrabold mb-1" style={{ letterSpacing: '-0.04em' }}>
            ${stats.totalRevenue.toLocaleString()}
          </p>
          <p className="text-white/60 text-sm">từ {stats.confirmedBookings} booking đã xác nhận</p>
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-white/60 text-xs">Chờ thanh toán</p>
              <p className="text-white font-bold text-lg">{stats.pendingBookings}</p>
            </div>
            <div>
              <p className="text-white/60 text-xs">Đã xác nhận</p>
              <p className="text-white font-bold text-lg">{stats.confirmedBookings}</p>
            </div>
            <div>
              <p className="text-white/60 text-xs">Đã huỷ</p>
              <p className="text-white font-bold text-lg">{stats.cancelledBookings}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${COLOR_MAP[card.color]}`}>
                  <Icon size={18} />
                </div>
                <ArrowUpRight size={14} className="text-gray-300 group-hover:text-violet-400 transition-colors" />
              </div>
              {loading ? (
                <div className="h-8 bg-gray-100 rounded animate-pulse mb-1" />
              ) : (
                <p className="text-2xl font-extrabold text-gray-900 mb-0.5" style={{ letterSpacing: '-0.03em' }}>
                  {card.value.toLocaleString()}
                </p>
              )}
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{card.delta}</p>
            </Link>
          );
        })}
      </div>

      {/* Content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent bookings */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-violet-500" />
              <h2 className="font-bold text-gray-900 text-sm">Booking gần đây</h2>
            </div>
            <Link href="/admin/bookings" className="text-xs text-violet-600 font-semibold hover:underline flex items-center gap-1">
              Xem tất cả <ArrowRight size={11} />
            </Link>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-gray-100 rounded w-1/2" />
                    <div className="h-3 bg-gray-50 rounded w-1/3" />
                  </div>
                  <div className="h-6 w-20 bg-gray-100 rounded-full" />
                </div>
              ))}
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="py-12 text-center">
              <CreditCard size={32} className="text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Chưa có booking nào</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentBookings.map((booking) => {
                const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.failed;
                const nights = Math.floor(
                  (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / 86400000
                );
                return (
                  <div key={booking.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {booking.hotel?.images?.[0]
                        ? <img src={booking.hotel.images[0]} className="w-full h-full object-cover" alt="" />
                        : <span className="text-lg">🏨</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{booking.hotel?.name}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {booking.user?.name || booking.user?.email} · {nights} đêm
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-violet-600">${booking.totalPrice?.toLocaleString()}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 text-sm mb-4">Thao tác nhanh</h2>
            <div className="space-y-2">
              {[
                { href: '/admin/hotels', icon: Hotel, label: 'Thêm khách sạn', desc: 'Đăng tin mới' },
                { href: '/admin/cities', icon: MapPin, label: 'Thêm thành phố', desc: 'Mở rộng điểm đến' },
                { href: '/admin/posts', icon: FileText, label: 'Viết bài viết', desc: 'Blog du lịch' },
                { href: '/admin/users', icon: Users, label: 'Quản lý user', desc: 'Phân quyền' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-violet-50 hover:border-violet-200 border border-transparent transition-all group">
                    <div className="w-8 h-8 bg-violet-50 group-hover:bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                      <Icon size={14} className="text-violet-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                    <ArrowRight size={12} className="ml-auto text-gray-300 group-hover:text-violet-400 transition-colors flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Booking status summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 text-sm mb-4">Trạng thái booking</h2>
            <div className="space-y-3">
              {[
                { label: 'Chờ thanh toán', value: stats.pendingBookings, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
                { label: 'Đã xác nhận', value: stats.confirmedBookings, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
                { label: 'Đã huỷ', value: stats.cancelledBookings, icon: XCircle, color: 'text-gray-400', bg: 'bg-gray-50' },
              ].map((item) => {
                const Icon = item.icon;
                const total = stats.totalBookings || 1;
                const pct = Math.round((item.value / total) * 100);
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <Icon size={12} className={item.color} />
                        <span className="text-xs text-gray-600 font-medium">{item.label}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-800">{item.value}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.bg.replace('bg-', 'bg-').replace('-50', '-400')} rounded-full transition-all`}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}