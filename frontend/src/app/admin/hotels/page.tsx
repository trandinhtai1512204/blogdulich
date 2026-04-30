'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, X, ChevronLeft, ChevronRight, Hotel } from 'lucide-react';
import api from '@/lib/axios';

interface Hotel {
  id: string; name: string; slug: string; address: string;
  price: number; images: string[]; availableRooms: number;
  description?: string; cityId: string;
  city: { id: string; name: string };
}
interface City { id: string; name: string; slug: string; }

const EMPTY = { name: '', slug: '', address: '', price: 0, availableRooms: 0, description: '', cityId: '', images: [] as string[] };

function autoSlug(name: string) {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Hotel | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [imagesRaw, setImagesRaw] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => { api.get('/cities').then((r) => setCities(r.data)); }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (search) params.set('search', search);
      const res = await api.get(`/hotels?${params}`);
      setHotels(res.data.data);
      setTotal(res.data.meta.total);
      setTotalPages(res.data.meta.totalPages);
    } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setImagesRaw(''); setError(''); setShowModal(true); };
  const openEdit = (h: Hotel) => {
    setEditing(h);
    setForm({ name: h.name, slug: h.slug, address: h.address, price: h.price, availableRooms: h.availableRooms, description: h.description || '', cityId: h.cityId, images: h.images || [] });
    setImagesRaw((h.images || []).join('\n'));
    setError(''); setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.slug || !form.address || !form.cityId) { setError('Điền đầy đủ thông tin bắt buộc'); return; }
    setSaving(true); setError('');
    try {
      const images = imagesRaw.split('\n').map((s) => s.trim()).filter(Boolean);
      const payload = { ...form, images, price: Number(form.price), availableRooms: Number(form.availableRooms) };
      if (editing) await api.patch(`/hotels/${editing.id}`, payload);
      else await api.post('/hotels', payload);
      setShowModal(false); fetchData();
    } catch (e: any) { setError(e.response?.data?.message || 'Lưu thất bại'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xoá khách sạn này?')) return;
    setDeletingId(id);
    try { await api.delete(`/hotels/${id}`); fetchData(); }
    catch (e: any) { alert(e.response?.data?.message || 'Xoá thất bại'); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Khách sạn</h1>
          <p className="text-gray-500 text-sm">{total} khách sạn</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors shadow-sm">
          <Plus size={15} /> Thêm mới
        </button>
      </div>

      <div className="relative mb-4 max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Tìm khách sạn..."
          className="w-full pl-8 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {['Khách sạn', 'Thành phố', 'Giá/đêm', 'Phòng trống', ''].map((h) => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? [...Array(5)].map((_, i) => (
              <tr key={i}>{[...Array(5)].map((_, j) => (
                <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
              ))}</tr>
            )) : hotels.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12">
                <Hotel size={32} className="text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Chưa có khách sạn nào</p>
              </td></tr>
            ) : hotels.map((hotel) => (
              <tr key={hotel.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-violet-50 flex-shrink-0">
                      {hotel.images?.[0]
                        ? <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-lg">🏨</div>}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{hotel.name}</p>
                      <p className="text-xs text-gray-400 max-w-[180px] truncate">{hotel.address}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4"><span className="text-sm text-gray-600">{hotel.city?.name}</span></td>
                <td className="px-5 py-4"><span className="font-semibold text-violet-600">${hotel.price}</span></td>
                <td className="px-5 py-4">
                  <span className={`text-sm font-medium ${hotel.availableRooms === 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {hotel.availableRooms} phòng
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 justify-end">
                    <button onClick={() => openEdit(hotel)} className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(hotel.id)} disabled={deletingId === hotel.id} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-500">{total} khách sạn · Trang {page}/{totalPages}</p>
          <div className="flex gap-1.5">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:border-violet-300 transition-all"><ChevronLeft size={14} /></button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:border-violet-300 transition-all"><ChevronRight size={14} /></button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-bold text-gray-900">{editing ? 'Sửa khách sạn' : 'Thêm khách sạn mới'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={16} className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-3">
              {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg border border-red-100">{error}</div>}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Tên khách sạn *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: autoSlug(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" placeholder="Mường Thanh Grand..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Slug *</label>
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Thành phố *</label>
                  <select value={form.cityId} onChange={(e) => setForm({ ...form, cityId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white">
                    <option value="">Chọn thành phố</option>
                    {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Địa chỉ *</label>
                  <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" placeholder="123 Đường Láng..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Giá/đêm ($) *</label>
                  <input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Số phòng trống</label>
                  <input type="number" min="0" value={form.availableRooms} onChange={(e) => setForm({ ...form, availableRooms: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">URLs ảnh (mỗi dòng 1 URL)</label>
                  <textarea value={imagesRaw} onChange={(e) => setImagesRaw(e.target.value)} rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 font-mono resize-none"
                    placeholder="https://images.unsplash.com/..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Mô tả</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100 sticky bottom-0 bg-white">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">Huỷ</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 disabled:opacity-50">
                {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}