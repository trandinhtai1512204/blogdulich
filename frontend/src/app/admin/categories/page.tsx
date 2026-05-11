// src/app/admin/categories/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Tag } from 'lucide-react';
import api from '@/lib/axios';

type CategoryType = 'destination' | 'itinerary' | 'review' | 'experience';

interface Category {
  id: string;
  name: string;
  slug: string;
  type?: CategoryType | string;
  cityId?: string | null;
  parentId?: string | null;
  createdAt: string;
}

interface City {
  id: string;
  name: string;
}

const TYPE_LABELS: Record<CategoryType, string> = {
  destination: 'Điểm đến hấp dẫn',
  itinerary: 'Lịch trình du lịch',
  review: 'Review',
  experience: 'Kinh nghiệm du lịch',
};
const SYSTEM_MENU: CategoryType[] = ['destination', 'itinerary', 'review', 'experience'];

const getTypeLabel = (type?: string) => {
  if (!type) return TYPE_LABELS.destination;
  if (type in TYPE_LABELS) return TYPE_LABELS[type as CategoryType];
  return type;
};

const ROOT_SLUGS = ['diem-den', 'lich-trinh-du-lich', 'review', 'kinh-nghiem'] as const;

const EMPTY = { name: '', slug: '', cityId: '', parentId: '' };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [activeSystemType, setActiveSystemType] = useState<CategoryType>('destination');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data ?? []);
    } finally { setLoading(false); }
  }

  useEffect(() => {
    api.get('/categories/roots/bootstrap').catch(() => null);
    fetchData();
    api.get('/cities').then((res) => setCities(res.data ?? []));
  }, []);

  const autoSlug = (name: string) =>
    name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

  const openCreate = () => { setEditing(null); setForm(EMPTY); setError(''); setShowModal(true); };
  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({
      name: c.name,
      slug: c.slug,
      cityId: c.cityId ?? '',
      parentId: c.parentId ?? '',
    });
    setError(''); setShowModal(true);
  };

  const getCategoryDepth = (category: Category, map: Map<string, Category>): number => {
    let depth = 0;
    let current = category;
    while (current.parentId) {
      const parent = map.get(current.parentId);
      if (!parent) break;
      depth += 1;
      current = parent;
    }
    return depth;
  };

  const getCategoryPathLabel = (category: Category, map: Map<string, Category>) => {
    const names = [category.name];
    let current = category;
    while (current.parentId) {
      const parent = map.get(current.parentId);
      if (!parent) break;
      names.unshift(parent.name);
      current = parent;
    }
    return names.join(' > ');
  };

  const sortedCategories = [...categories].sort((a, b) => {
    const typeA = getTypeLabel(a.type);
    const typeB = getTypeLabel(b.type);
    if (typeA !== typeB) return typeA.localeCompare(typeB, 'vi');
    return a.name.localeCompare(b.name, 'vi');
  });

  const isRootCategory = (cat: Category) => !cat.parentId && ROOT_SLUGS.includes(cat.slug as (typeof ROOT_SLUGS)[number]);
  const roots = sortedCategories.filter((cat) => isRootCategory(cat));
  const childCategories = sortedCategories.filter((cat) => !isRootCategory(cat));
  const activeRoot = roots.find((root) => root.type === activeSystemType) ?? null;
  const visibleCategories = childCategories.filter((cat) => cat.type === activeSystemType);
  const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));
  const parentOptions = categories
    .filter((cat) => !editing || cat.id !== editing.id)
    .filter((cat) => cat.type === activeSystemType || (!cat.parentId && cat.type === activeSystemType))
    .sort((a, b) => getCategoryPathLabel(a, categoryMap).localeCompare(getCategoryPathLabel(b, categoryMap), 'vi'));
  const editingIsRoot = editing ? isRootCategory(editing) : false;

  const handleSave = async () => {
    if (!form.name || !form.slug) { setError('Điền đầy đủ thông tin'); return; }
    if (!editingIsRoot && !form.parentId) { setError('Vui lòng chọn chuyên mục cha thuộc nhóm trụ cột'); return; }
    setSaving(true); setError('');
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        cityId: form.cityId || null,
        parentId: form.parentId || null,
      };
      if (editing) {
        await api.patch(`/categories/${editing.id}`, payload);
      } else {
        await api.post('/categories', payload);
      }
      setShowModal(false); fetchData();
    } catch (e: unknown) {
      const message = e && typeof e === 'object' && 'response' in e
        ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setError(message || 'Lưu chuyên mục thất bại');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xoá chuyên mục này?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/categories/${id}`);
      fetchData();
    } catch (e: unknown) {
      const message = e && typeof e === 'object' && 'response' in e
        ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      alert(message || 'Xoá thất bại');
    } finally { setDeletingId(null); }
  };

  const COLORS = [
    'bg-violet-100 text-violet-700',
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-amber-100 text-amber-700',
    'bg-pink-100 text-pink-700',
    'bg-teal-100 text-teal-700',
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>
            Chuyên mục bài viết
          </h1>
          <p className="text-gray-500 text-sm">{childCategories.length} chuyên mục con / {roots.length} trụ cột hệ thống</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors">
          <Plus size={15} /> Thêm chuyên mục
        </button>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {SYSTEM_MENU.map((type) => (
          <button
            key={type}
            onClick={() => setActiveSystemType(type)}
            className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-colors ${
              activeSystemType === type
                ? 'bg-violet-600 text-white border-violet-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'
            }`}
          >
            {TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
          <Tag size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-1">Chưa có chuyên mục nào</p>
          <p className="text-gray-400 text-xs">Tạo bài viết và gán category trước</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-violet-50 border border-violet-100 rounded-xl px-4 py-3 text-sm text-violet-800">
            {activeRoot
              ? <>Đang xem nhóm <span className="font-semibold">{activeRoot.name}</span>.</>
              : <>Chưa có danh mục trụ cột cho nhóm này.</>}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {visibleCategories.map((cat, idx) => (
            <div key={cat.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 group hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${COLORS[idx % COLORS.length]}`}>
                  <Tag size={16} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(cat)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <Pencil size={12} className="text-gray-500" />
                  </button>
                  <button onClick={() => handleDelete(cat.id)}
                    disabled={deletingId === cat.id}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={12} className="text-red-400" />
                  </button>
                </div>
              </div>
              <p className="font-semibold text-gray-800 text-sm">{cat.name}</p>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{cat.slug}</p>
              <p className="text-[11px] text-violet-700 mt-1">{getTypeLabel(cat.type)}</p>
              {cat.parentId && (
                <p className="text-[11px] text-gray-500 mt-1">
                  Cấp {getCategoryDepth(cat, categoryMap) + 1} - {getCategoryPathLabel(cat, categoryMap)}
                </p>
              )}
            </div>
          ))}
          </div>
          {visibleCategories.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 py-10 text-center text-gray-500 text-sm">
              Chưa có chuyên mục con cho nhóm này.
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{editing ? 'Sửa chuyên mục' : 'Thêm chuyên mục'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tên chuyên mục *</label>
                <input value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value, slug: autoSlug(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                  placeholder="Du lịch biển" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Slug *</label>
                <input value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  disabled={editingIsRoot}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 font-mono disabled:bg-gray-100 disabled:text-gray-400"
                  placeholder="du-lich-bien" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Thành phố (tuỳ chọn)</label>
                <select
                  value={form.cityId}
                  onChange={(e) => setForm({ ...form, cityId: e.target.value })}
                  disabled={editingIsRoot}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">Không chọn</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Thuộc chuyên mục cha {!editingIsRoot ? '*' : ''}</label>
                <select
                  value={form.parentId}
                  onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                  disabled={editingIsRoot}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">{editingIsRoot ? 'Danh mục trụ cột' : 'Chọn chuyên mục cha'}</option>
                  {parentOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {getCategoryPathLabel(cat, categoryMap)}
                    </option>
                  ))}
                </select>
                {!editingIsRoot && <p className="text-[11px] text-gray-500 mt-1">Chuyên mục mới phải nằm dưới 1 trong 5 danh mục trụ cột.</p>}
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm hover:bg-gray-50">
                Huỷ
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 disabled:opacity-50">
                {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
