// ===== src/app/admin/cities/page.tsx =====
'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import api from '@/lib/axios';

interface City { id: string; name: string; slug: string; country: string; image?: string; description?: string; }
const EMPTY = { name: '', slug: '', country: 'Việt Nam', image: '', description: '' };

export default function AdminCitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<City | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = () => {
    setLoading(true);
    api.get('/cities').then((r) => setCities(r.data)).finally(() => setLoading(false));
  };

  const openCreate = () => { setEditing(null); setForm(EMPTY); setError(''); setShowModal(true); };
  const openEdit = (c: City) => {
    setEditing(c);
    setForm({ name: c.name, slug: c.slug, country: c.country, image: c.image || '', description: c.description || '' });
    setError(''); setShowModal(true);
  };

  const autoSlug = (name: string) =>
    name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

  const handleSave = async () => {
    if (!form.name || !form.slug || !form.country) { setError('Điền đầy đủ thông tin bắt buộc'); return; }
    setSaving(true); setError('');
    try {
      if (editing) await api.patch(`/cities/${editing.id}`, form);
      else await api.post('/cities', form);
      setShowModal(false); fetchData();
    } catch (e: any) { setError(e.response?.data?.message || 'Lưu thất bại'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xoá thành phố này?')) return;
    setDeletingId(id);
    try { await api.delete(`/cities/${id}`); fetchData(); }
    catch (e: any) { alert(e.response?.data?.message || 'Xoá thất bại'); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Quản lý thành phố</h1>
          <p className="text-gray-500 text-sm">{cities.length} thành phố</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors">
          <Plus size={15} /> Thêm thành phố
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? [...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 h-32 animate-pulse" />
        )) : cities.map((city) => (
          <div key={city.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <div className="relative h-28 bg-gradient-to-br from-violet-100 to-purple-100">
              {city.image ? (
                <img src={city.image} alt={city.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">🏙️</div>
              )}
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(city)} className="p-1.5 bg-white/90 rounded-lg hover:bg-white transition-colors">
                  <Pencil size={12} className="text-gray-600" />
                </button>
                <button onClick={() => handleDelete(city.id)} className="p-1.5 bg-white/90 rounded-lg hover:bg-white transition-colors">
                  <Trash2 size={12} className="text-red-500" />
                </button>
              </div>
              <div className="absolute bottom-2 left-3">
                <p className="text-white font-bold text-sm">{city.name}</p>
                <p className="text-white/70 text-xs">{city.country}</p>
              </div>
            </div>
            {city.description && (
              <div className="px-3 py-2">
                <p className="text-xs text-gray-500 line-clamp-2">{city.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{editing ? 'Sửa thành phố' : 'Thêm thành phố'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={16} className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-3">
              {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>}
              {[
                { key: 'name', label: 'Tên thành phố *', ph: 'Hà Nội' },
                { key: 'slug', label: 'Slug *', ph: 'ha-noi', mono: true },
                { key: 'country', label: 'Quốc gia *', ph: 'Việt Nam' },
                { key: 'image', label: 'URL ảnh', ph: 'https://...' },
              ].map(({ key, label, ph, mono }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
                  <input
                    value={(form as any)[key]}
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm((f) => ({ ...f, [key]: val, ...(key === 'name' ? { slug: autoSlug(val) } : {}) }));
                    }}
                    className={`w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 ${mono ? 'font-mono' : ''}`}
                    placeholder={ph}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mô tả</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
                  placeholder="Mô tả ngắn..." />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm hover:bg-gray-50">Huỷ</button>
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
