// src/app/admin/posts/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/axios';

interface Post {
  id: string; title: string; slug: string; content: string;
  excerpt?: string; thumbnail?: string; published: boolean;
  location?: string; latitude?: number; longitude?: number;
  cityId?: string; categoryId?: string; createdAt: string;
  city?: { id: string; name: string }; category?: { id: string; name: string };
}
interface City { id: string; name: string; }
interface Category {
  id: string;
  name: string;
  slug: string;
  type?: 'destination' | 'itinerary' | 'review' | 'experience';
  cityId?: string | null;
  parentId?: string | null;
}

const EMPTY = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  thumbnail: '',
  location: '',
  latitude: '',
  longitude: '',
  published: false,
  cityId: '',
  categoryId: '',
};
const ROOT_SLUGS = ['diem-den', 'lich-trinh-du-lich', 'review', 'kinh-nghiem'] as const;
const SYSTEM_MENU = [
  { type: 'destination', label: 'Điểm đến hấp dẫn' },
  { type: 'itinerary', label: 'Lịch trình du lịch' },
  { type: 'review', label: 'Review' },
  { type: 'experience', label: 'Kinh nghiệm du lịch' },
] as const;
type SystemType = (typeof SYSTEM_MENU)[number]['type'];

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [selectedRootId, setSelectedRootId] = useState('');
  const [activeSystemType, setActiveSystemType] = useState<SystemType>('destination');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchData() {
    setLoading(true);
    try {
      // Admin needs to see unpublished too — using limit high enough
      const res = await api.get(`/posts?page=${page}&limit=10`);
      setPosts(res.data.data);
      setTotal(res.data.meta.total);
      setTotalPages(res.data.meta.totalPages);
    } finally { setLoading(false); }
  }

  useEffect(() => { fetchData(); }, [page]);
  useEffect(() => { api.get('/cities').then((r) => setCities(r.data)); }, []);
  useEffect(() => { api.get('/categories').then((r) => setCategories(r.data ?? [])); }, []);

  const autoSlug = (name: string) =>
    name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

  const openCreate = () => { setEditing(null); setForm(EMPTY); setSelectedRootId(''); setError(''); setShowModal(true); };
  const openEdit = (p: Post) => {
    setEditing(p);
    setForm({
      title: p.title,
      slug: p.slug,
      content: p.content,
      excerpt: p.excerpt || '',
      thumbnail: p.thumbnail || '',
      location: p.location || '',
      latitude: p.latitude != null ? String(p.latitude) : '',
      longitude: p.longitude != null ? String(p.longitude) : '',
      published: p.published,
      cityId: p.cityId || p.city?.id || '',
      categoryId: p.categoryId || p.category?.id || '',
    });
    setSelectedRootId('');
    setError(''); setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.slug || !form.content) { setError('Điền đầy đủ tiêu đề, slug và nội dung'); return; }
    if ((form.latitude && !form.longitude) || (!form.latitude && form.longitude)) {
      setError('Vui lòng nhập đầy đủ cả latitude và longitude');
      return;
    }
    setSaving(true); setError('');
    try {
      const payload = {
        ...form,
        cityId: form.cityId || undefined,
        categoryId: form.categoryId || undefined,
        location: form.location || undefined,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
      };
      if (editing) await api.patch(`/posts/${editing.id}`, payload);
      else await api.post('/posts', payload);
      setShowModal(false); fetchData();
    } catch (e: unknown) {
      const message = e && typeof e === 'object' && 'response' in e
        ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setError(message || 'Lưu thất bại');
    }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xoá bài viết này?')) return;
    setDeletingId(id);
    try { await api.delete(`/posts/${id}`); fetchData(); }
    catch (e: unknown) {
      const message = e && typeof e === 'object' && 'response' in e
        ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      alert(message || 'Xoá thất bại');
    }
    finally { setDeletingId(null); }
  };

  const togglePublish = async (post: Post) => {
    try {
      await api.patch(`/posts/${post.id}`, { published: !post.published });
      setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, published: !post.published } : p));
    } catch (_e: unknown) { alert('Thất bại'); }
  };

  const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));
  const isRootCategory = (cat: Category) => !cat.parentId && ROOT_SLUGS.includes(cat.slug as (typeof ROOT_SLUGS)[number]);
  const roots = categories.filter((cat) => isRootCategory(cat));
  const activeRoot = roots.find((root) => root.type === activeSystemType) ?? null;

  const getRootId = (categoryId?: string): string => {
    if (!categoryId) return '';
    let current = categoryMap.get(categoryId);
    while (current?.parentId) {
      const parent = categoryMap.get(current.parentId);
      if (!parent) break;
      current = parent;
    }
    if (!current) return '';
    if (isRootCategory(current)) return current.id;
    const byType = roots.find((root) => root.type && current.type && root.type === current.type);
    return byType?.id || '';
  };

  const isDescendantOfRoot = (category: Category, rootId: string): boolean => {
    if (!rootId) return false;
    let current: Category | undefined = category;
    while (current?.parentId) {
      if (current.parentId === rootId) return true;
      current = categoryMap.get(current.parentId);
    }
    return false;
  };

  const getCategoryPath = (category: Category): string => {
    const names = [category.name];
    let current: Category | undefined = category;
    while (current?.parentId) {
      const parent = categoryMap.get(current.parentId);
      if (!parent) break;
      names.unshift(parent.name);
      current = parent;
    }
    return names.join(' > ');
  };

  const getPostSystemType = (post: Post): SystemType | '' => {
    const categoryId = post.categoryId || post.category?.id;
    if (!categoryId) return '';
    let current = categoryMap.get(categoryId);
    while (current?.parentId) {
      const parent = categoryMap.get(current.parentId);
      if (!parent) break;
      current = parent;
    }
    const rootType = current?.type;
    if (rootType === 'destination' || rootType === 'itinerary' || rootType === 'review' || rootType === 'experience') {
      return rootType;
    }
    return '';
  };

  useEffect(() => {
    if (!showModal) return;
    setSelectedRootId(getRootId(form.categoryId));
  }, [showModal, form.categoryId, categories]);

  const filteredCategories = categories
    .filter((cat) => !isRootCategory(cat))
    .filter((cat) => {
      if (!selectedRootId) return true;
      if (isDescendantOfRoot(cat, selectedRootId)) return true;
      const selectedRoot = roots.find((root) => root.id === selectedRootId);
      if (!selectedRoot) return false;
      // Backward compatibility: old categories may be top-level without parentId.
      return !cat.parentId && !!cat.type && cat.type === selectedRoot.type;
    })
    .filter((cat) => {
      if (!form.cityId) return true;
      return !cat.cityId || cat.cityId === form.cityId;
    })
    .sort((a, b) => getCategoryPath(a).localeCompare(getCategoryPath(b), 'vi'));
  const filteredPosts = posts.filter((post) => getPostSystemType(post) === activeSystemType);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Quản lý bài viết</h1>
          <p className="text-gray-500 text-sm">{filteredPosts.length} bài viết trong nhóm đang chọn</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors">
          <Plus size={15} /> Viết bài mới
        </button>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {SYSTEM_MENU.map((item) => (
          <button
            key={item.type}
            onClick={() => setActiveSystemType(item.type)}
            className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-colors ${
              activeSystemType === item.type
                ? 'bg-violet-600 text-white border-violet-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mb-4 bg-violet-50 border border-violet-100 rounded-xl px-4 py-3 text-sm text-violet-800">
        {activeRoot
          ? <>Đang xem bài viết thuộc nhóm <span className="font-semibold">{activeRoot.name}</span>.</>
          : <>Chưa có danh mục trụ cột cho nhóm này.</>}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {['Bài viết', 'Thành phố', 'Bản đồ', 'Trạng thái', 'Ngày tạo', 'Thao tác'].map((h) => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? [...Array(5)].map((_, i) => (
              <tr key={i}>{[...Array(6)].map((_, j) => (
                <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
              ))}</tr>
            )) : filteredPosts.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Chưa có bài viết nào</td></tr>
            ) : filteredPosts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {post.thumbnail ? (
                      <img src={post.thumbnail} alt={post.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0 text-lg">📝</div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-800 text-sm max-w-[240px] truncate">{post.title}</p>
                      {post.excerpt && <p className="text-xs text-gray-400 max-w-[240px] truncate">{post.excerpt}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-gray-600">{post.city?.name || '—'}</span>
                </td>
                <td className="px-5 py-4">
                  {typeof post.latitude === 'number' && typeof post.longitude === 'number' ? (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                      Có tọa độ
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <button onClick={() => togglePublish(post)}
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${
                      post.published
                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                    }`}>
                    {post.published ? <Eye size={10} /> : <EyeOff size={10} />}
                    {post.published ? 'Công khai' : 'Ẩn'}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(post)} className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(post.id)} disabled={deletingId === post.id}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${page === i + 1 ? 'bg-violet-600 text-white' : 'border border-gray-200 text-gray-600 hover:border-violet-300'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{editing ? 'Sửa bài viết' : 'Viết bài mới'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={16} className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-3">
              {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tiêu đề *</label>
                <input value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value, slug: autoSlug(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                  placeholder="Khám phá Hà Nội 36 phố phường..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Slug *</label>
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 font-mono"
                    placeholder="kham-pha-ha-noi" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Danh mục lớn</label>
                  <select
                    value={selectedRootId}
                    onChange={(e) => {
                      const nextRootId = e.target.value;
                      setSelectedRootId(nextRootId);
                      setForm((prev) => ({ ...prev, categoryId: '' }));
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                  >
                    <option value="">Chọn danh mục lớn</option>
                    {roots.sort((a, b) => a.name.localeCompare(b.name, 'vi')).map((root) => (
                      <option key={root.id} value={root.id}>{root.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Thành phố</label>
                  <select
                    value={form.cityId}
                    onChange={(e) => {
                      const nextCityId = e.target.value;
                      setForm((prev) => ({ ...prev, cityId: nextCityId, categoryId: '' }));
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white">
                    <option value="">Không chọn</option>
                    {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Chuyên mục</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                  >
                    <option value="">{selectedRootId ? 'Chọn chuyên mục' : 'Chọn danh mục lớn trước'}</option>
                    {filteredCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {getCategoryPath(cat)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tóm tắt</label>
                <input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                  placeholder="Mô tả ngắn cho bài viết..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">URL thumbnail</label>
                <input value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                  placeholder="https://images.unsplash.com/..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Địa điểm hiển thị map</label>
                  <input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                    placeholder="Hồ Gươm, Hà Nội"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                    placeholder="21.028511"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                    placeholder="105.804817"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nội dung *</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={8} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none font-mono"
                  placeholder="Nội dung bài viết (hỗ trợ Markdown)..." />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="published" checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  className="w-4 h-4 accent-violet-600" />
                <label htmlFor="published" className="text-sm font-medium text-gray-700">Công khai ngay</label>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm hover:bg-gray-50">Huỷ</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 disabled:opacity-50">
                {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Đăng bài'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
