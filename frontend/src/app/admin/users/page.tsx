// ===== src/app/admin/users/page.tsx =====
'use client';

import { useEffect, useState } from 'react';
import { Shield, User, Search } from 'lucide-react';
import api from '@/lib/axios';

interface AppUser {
  id: string; email: string; name?: string; role: string; createdAt: string;
  _count?: { bookings: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => { api.get('/users').then((r) => setUsers(r.data)).finally(() => setLoading(false)); }, []);

  const toggleRole = async (user: AppUser) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Đổi role của ${user.email} thành "${newRole}"?`)) return;
    setUpdatingId(user.id);
    try {
      await api.patch(`/users/${user.id}/role`, { role: newRole });
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: newRole } : u));
    } catch (e: any) { alert(e.response?.data?.message || 'Thất bại'); }
    finally { setUpdatingId(null); }
  };

  const filtered = users.filter((u) =>
    !search || u.email.includes(search) || (u.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Quản lý người dùng</h1>
          <p className="text-gray-500 text-sm">{users.length} tài khoản</p>
        </div>
      </div>

      <div className="relative mb-5 max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo email hoặc tên..."
          className="w-full pl-8 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {['Người dùng', 'Role', 'Bookings', 'Ngày tạo', 'Thao tác'].map((h) => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? [...Array(5)].map((_, i) => (
              <tr key={i}>{[...Array(5)].map((_, j) => (
                <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
              ))}</tr>
            )) : filtered.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{(user.name || user.email)[0].toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{user.name || '—'}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    user.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {user.role === 'admin' ? <Shield size={10} /> : <User size={10} />}
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-gray-600">{user._count?.bookings ?? 0}</span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-xs text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <button onClick={() => toggleRole(user)} disabled={updatingId === user.id}
                    className="text-xs text-violet-600 hover:text-violet-800 font-medium border border-violet-200 hover:border-violet-400 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50">
                    {updatingId === user.id ? '...' : user.role === 'admin' ? '→ User' : '→ Admin'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
