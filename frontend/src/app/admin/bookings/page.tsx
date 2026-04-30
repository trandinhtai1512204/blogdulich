// src/app/admin/bookings/page.tsx
// Note: Backend /bookings/my only returns current user's bookings.
// Admin needs to view via /users/:id to see each user's bookings.
// This page lists all users then aggregates their bookings.
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Calendar, MapPin, Clock, CheckCircle, XCircle, AlertCircle, Search } from 'lucide-react';
import api from '@/lib/axios';

interface BookingEntry {
  id: string; checkIn: string; checkOut: string; totalPrice: number;
  status: string; createdAt: string; expiresAt?: string;
  hotel: { name: string; address: string; images: string[] };
  user?: { name?: string; email: string };
  payment?: { status: string; transactionId?: string };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending:   { label: 'Chờ TT', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  confirmed: { label: 'Đã xác nhận', color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle },
  cancelled: { label: 'Đã huỷ', color: 'bg-gray-50 text-gray-500 border-gray-200', icon: XCircle },
  failed:    { label: 'Thất bại', color: 'bg-red-50 text-red-600 border-red-200', icon: AlertCircle },
};

export default function AdminBookingsPage() {
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<BookingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Fetch all users then their bookings
    api.get('/users').then(async (usersRes) => {
      const allBookings: BookingEntry[] = [];
      await Promise.all(
        usersRes.data.map(async (user: any) => {
          try {
            const userRes = await api.get(`/users/${user.id}`);
            const userBookings = (userRes.data.bookings || []).map((b: any) => ({
              ...b,
              user: { name: user.name, email: user.email },
            }));
            allBookings.push(...userBookings);
          } catch {}
        })
      );
      // Sort by createdAt desc
      allBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBookings(allBookings);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return b.hotel.name.toLowerCase().includes(q) || (b.user?.email || '').includes(q);
    }
    return true;
  });

  const counts = { all: bookings.length, pending: 0, confirmed: 0, cancelled: 0, failed: 0 };
  bookings.forEach((b) => { if (counts[b.status as keyof typeof counts] !== undefined) (counts as any)[b.status]++; });

  const TABS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chờ TT' },
    { key: 'confirmed', label: 'Đã xác nhận' },
    { key: 'cancelled', label: 'Đã huỷ' },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Quản lý Booking</h1>
        <p className="text-gray-500 text-sm">{bookings.length} booking trong hệ thống</p>
      </div>

      {/* Tabs + search */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-gray-100 shadow-sm">
          {TABS.map((tab) => (
            <button key={tab.key} onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                statusFilter === tab.key ? 'bg-violet-600 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}>
              {tab.label}
              <span className={`text-xs rounded-full w-5 h-5 flex items-center justify-center ${
                statusFilter === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>{(counts as any)[tab.key]}</span>
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo khách sạn hoặc email..."
            className="pl-8 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 w-64" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {['Khách sạn', 'Người đặt', 'Ngày', 'Tổng tiền', 'Trạng thái', 'Thanh toán'].map((h) => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? [...Array(8)].map((_, i) => (
              <tr key={i}>{[...Array(6)].map((_, j) => (
                <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
              ))}</tr>
            )) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Không có booking nào</td></tr>
            ) : filtered.map((b) => {
              const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.failed;
              const Icon = cfg.icon;
              const nights = Math.floor((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / 86400000);

              return (
                <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-violet-100 flex-shrink-0">
                        {b.hotel.images?.[0] ? (
                          <img src={b.hotel.images[0]} alt={b.hotel.name} className="w-full h-full object-cover" />
                        ) : <div className="w-full h-full flex items-center justify-center text-sm">🏨</div>}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 max-w-[160px] truncate">{b.hotel.name}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-0.5">
                          <MapPin size={9} />{b.hotel.address.slice(0, 25)}...
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-700">{b.user?.name || '—'}</p>
                    <p className="text-xs text-gray-400">{b.user?.email}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <Calendar size={10} />
                      {new Date(b.checkIn).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="text-xs text-gray-400">{nights} đêm</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-bold text-violet-600">${b.totalPrice.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border ${cfg.color}`}>
                      <Icon size={9} />{cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {b.payment ? (
                      <span className={`text-xs font-medium ${b.payment.status === 'paid' ? 'text-green-600' : 'text-gray-400'}`}>
                        {b.payment.status === 'paid' ? '✓ Đã TT' : b.payment.status}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
