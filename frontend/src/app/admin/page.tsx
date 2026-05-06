'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Hotel, MapPin, FileText, Users,
  ArrowRight, ArrowUpRight
} from 'lucide-react';
import api from '@/lib/axios';

interface Stats {
  totalHotels: number;
  totalCities: number;
  totalPosts: number;
  totalUsers: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalHotels: 0, totalCities: 0, totalPosts: 0, totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/hotels?limit=1'),
      api.get('/cities'),
      api.get('/posts?limit=1'),
      api.get('/users'),
    ]).then(([hotels, cities, posts, users]) => {
      const allUsers: any[] = users.data;
      setStats({
        totalHotels: hotels.data.meta?.total || 0,
        totalCities: cities.data.length || 0,
        totalPosts: posts.data.meta?.total || 0,
        totalUsers: allUsers.length || 0,
      });
      setLoading(false);
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

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-4 lg:col-span-2">
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
                    <div className="w-8 h-8 bg-violet-50 group-hover:bg-violet-100 rounded-lg flex items-center justify-center shrink-0 transition-colors">
                      <Icon size={14} className="text-violet-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                    <ArrowRight size={12} className="ml-auto text-gray-300 group-hover:text-violet-400 transition-colors shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-fit">
          <h2 className="font-bold text-gray-900 text-sm mb-3">Ghi chú vận hành</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Hệ thống đang tạm dừng luồng booking và chi phí du lịch. Dashboard hiện chỉ hiển thị số liệu nội dung
            để tập trung vào chiến lược blog và điểm đến.
          </p>
        </div>
      </div>
    </div>
  );
}