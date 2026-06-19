// src/app/admin/content/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown, ChevronRight, FileText, MapPin, Folder,
  Plus, Pencil, Trash2, Eye, EyeOff, X, HelpCircle,
} from 'lucide-react';
import api from '@/lib/axios';
import { TiptapEditor } from '@/components/TiptapEditor';

type Module = 'destination' | 'itinerary' | 'review' | 'experience';
type Level = 'ROOT' | 'SUBTYPE' | 'CITY' | 'SUB';

const MODULES: Array<{ key: Module; label: string; rootSlug: string; emoji: string; cityPrefix?: string }> = [
  { key: 'destination', label: 'Điểm đến',   rootSlug: 'diem-den',           emoji: '🗺️' },
  { key: 'itinerary',   label: 'Lịch trình', rootSlug: 'lich-trinh-du-lich', emoji: '🧭', cityPrefix: 'lich-trinh-du-lich-' },
  { key: 'review',      label: 'Review',     rootSlug: 'review',             emoji: '⭐' },
  { key: 'experience',  label: 'Kinh nghiệm', rootSlug: 'kinh-nghiem',       emoji: '📖', cityPrefix: 'kinh-nghiem-du-lich-' },
];

const REVIEW_SUBTYPES: Array<{ slug: string; label: string }> = [
  { slug: 'review-tour',       label: 'Tour' },
  { slug: 'review-khach-san',  label: 'Khách sạn' },
  { slug: 'review-combo',      label: 'Combo' },
  { slug: 'review-resort',     label: 'Resort' },
  { slug: 'review-du-thuyen',  label: 'Du thuyền' },
  { slug: 'review-nha-hang',   label: 'Nhà hàng' },
];

interface Category {
  id: string; name: string; slug: string;
  type: string; level: Level;
  parentId: string | null; cityId: string | null;
  createdAt?: string;
}

interface Post {
  id: string; title: string; slug: string; excerpt?: string; content?: string;
  thumbnail?: string; published: boolean; createdAt: string;
  cityId?: string; categoryId?: string;
  location?: string; latitude?: number; longitude?: number;
}

interface City { id: string; name: string; slug: string; }
interface FaqItem {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  published: boolean;
}

// ----- Helpers --------------------------------------------------------------
function buildChildrenMap(categories: Category[]) {
  const byParent = new Map<string | null, Category[]>();
  for (const cat of categories) {
    const list = byParent.get(cat.parentId) ?? [];
    list.push(cat);
    byParent.set(cat.parentId, list);
  }
  for (const list of byParent.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  }
  return byParent;
}

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

const errMsg = (e: unknown) => {
  if (e && typeof e === 'object' && 'response' in e) {
    return (e as { response?: { data?: { message?: string } } }).response?.data?.message
      || 'Yêu cầu thất bại';
  }
  return 'Yêu cầu thất bại';
};

// Determine if a node is a "leaf" — i.e. posts attach directly to it.
function isLeafNode(cat: Category, mod: Module, subtypeSlug?: string): boolean {
  if (mod === 'destination' || mod === 'itinerary' || mod === 'experience') {
    return cat.level === 'CITY' || cat.level === 'SUB';
  }
  if (mod === 'review') return cat.level === 'CITY' || cat.level === 'SUB';
  return false;
}

// Determine if the node should accept SUB children.
function canHaveSubChildren(cat: Category, mod: Module, subtypeSlug?: string): boolean {
  return cat.level === 'CITY';
}

// ============================================================================
// Page
// ============================================================================
type ModalState =
  | { kind: 'add-city'; parentId: string }
  | { kind: 'add-sub'; parentCity: Category }
  | { kind: 'edit-category'; category: Category }
  | { kind: 'add-post'; parentCategory: Category }
  | { kind: 'edit-post'; post: Post; parentCategory: Category }
  | { kind: 'manage-faqs'; targetType: 'category' | 'post'; targetId: string; module: Module; title: string }
  | null;

export default function AdminContentPage() {
  const [activeModule, setActiveModule] = useState<Module>('destination');
  const [activeSubtype, setActiveSubtype] = useState<string>('review-tour');
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selected, setSelected] = useState<Category | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  useEffect(() => {
    Promise.all([api.get('/categories'), api.get('/cities')])
      .then(([c, city]) => {
        setCategories(c.data ?? []);
        setCities(city.data ?? []);
      })
      .finally(() => setLoading(false));
  }, [refetchKey]);

  useEffect(() => {
    setSelected(null);
    setPosts([]);
    setExpanded(new Set());
  }, [activeModule, activeSubtype]);

  useEffect(() => {
    if (!selected) { setPosts([]); return; }
    setPostsLoading(true);
    api.get(`/posts?categoryId=${selected.id}&limit=100`)
      .then((r) => setPosts(r.data?.data ?? []))
      .finally(() => setPostsLoading(false));
  }, [selected, refetchKey]);

  const childrenMap = useMemo(() => buildChildrenMap(categories), [categories]);

  const moduleRoot = useMemo(() => {
    const meta = MODULES.find((m) => m.key === activeModule);
    if (!meta) return null;
    return categories.find((c) => c.slug === meta.rootSlug && c.level === 'ROOT') ?? null;
  }, [categories, activeModule]);

  const reviewSubtypeNode = useMemo(() => {
    if (activeModule !== 'review' || !moduleRoot) return null;
    return categories.find((c) => c.slug === activeSubtype && c.parentId === moduleRoot.id) ?? null;
  }, [categories, activeModule, activeSubtype, moduleRoot]);

  // Parent under which "+ Tỉnh" creates new CITY:
  // destination/itinerary/experience: directly under module root
  // review: under selected SUBTYPE
  const cityParentForAdd = activeModule === 'review' ? reviewSubtypeNode : moduleRoot;

  const refetchAll = () => setRefetchKey((k) => k + 1);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (!confirm(`Xoá chuyên mục "${cat.name}"?`)) return;
    try {
      await api.delete(`/categories/${cat.id}`);
      if (selected?.id === cat.id) setSelected(null);
      refetchAll();
    } catch (e) {
      alert(errMsg(e));
    }
  };

  const handleDeletePost = async (p: Post) => {
    if (!confirm(`Xoá bài "${p.title}"?`)) return;
    try {
      await api.delete(`/posts/${p.id}`);
      refetchAll();
    } catch (e) {
      alert(errMsg(e));
    }
  };

  const handleTogglePublished = async (p: Post) => {
    try {
      await api.patch(`/posts/${p.id}`, { published: !p.published });
      refetchAll();
    } catch (e) {
      alert(errMsg(e));
    }
  };

  // ----- Render --------------------------------------------------------------
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>
          Quản lý nội dung
        </h1>
        <p className="text-gray-500 text-sm">
          Cây danh mục theo từng mô-đun · {categories.length} chuyên mục · {cities.length} tỉnh thành
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {MODULES.map((m) => (
          <button key={m.key}
            onClick={() => setActiveModule(m.key)}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold border transition-colors ${
              activeModule === m.key
                ? 'bg-violet-600 text-white border-violet-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'
            }`}
          >
            <span className="mr-1.5">{m.emoji}</span>{m.label}
          </button>
        ))}
      </div>

      {activeModule === 'review' && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {REVIEW_SUBTYPES.map((s) => (
            <button key={s.slug}
              onClick={() => setActiveSubtype(s.slug)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                activeSubtype === s.slug
                  ? 'bg-amber-100 text-amber-700 border-amber-300'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-amber-300'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Đang tải...</div>
      ) : !moduleRoot ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
          Không tìm thấy danh mục gốc <code>{MODULES.find(m=>m.key===activeModule)?.rootSlug}</code>.
          Hãy chạy migration Phase 1 và restart backend.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5">
          {/* ---- Tree (left) ---- */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 max-h-[calc(100vh-220px)] overflow-y-auto">
            <div className="flex items-center justify-between px-2 py-2 border-b border-gray-100 mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Cây danh mục</p>
              <button
                onClick={() => cityParentForAdd && setModal({ kind: 'add-city', parentId: cityParentForAdd.id })}
                disabled={!cityParentForAdd}
                className="flex items-center gap-1 text-xs text-violet-700 px-2 py-1 rounded-lg border border-violet-200 hover:bg-violet-50 disabled:opacity-40 disabled:cursor-not-allowed">
                <Plus size={11} /> Tỉnh
              </button>
            </div>
            <ModuleTree
              activeModule={activeModule}
              moduleRoot={moduleRoot}
              reviewSubtypeNode={reviewSubtypeNode}
              activeSubtype={activeSubtype}
              childrenMap={childrenMap}
              expanded={expanded}
              selected={selected}
              onSelect={setSelected}
              onToggle={toggleExpand}
              onAddSub={(city) => setModal({ kind: 'add-sub', parentCity: city })}
              onEdit={(cat) => setModal({ kind: 'edit-category', category: cat })}
              onDelete={handleDeleteCategory}
            />
          </div>

          {/* ---- Detail panel (right) ---- */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 min-h-[400px]">
            {!selected ? (
              <div className="text-center py-20">
                <Folder size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">Chọn một node bên trái để xem bài viết</p>
              </div>
            ) : (
              <DetailPanel
                category={selected}
                posts={posts}
                postsLoading={postsLoading}
                cities={cities}
                isLeaf={isLeafNode(selected, activeModule, activeSubtype)}
                canAddSub={canHaveSubChildren(selected, activeModule, activeSubtype)}
                onAddSub={() => setModal({ kind: 'add-sub', parentCity: selected })}
                onAddPost={() => setModal({ kind: 'add-post', parentCategory: selected })}
                onEditPost={(p) => setModal({ kind: 'edit-post', post: p, parentCategory: selected })}
                onDeletePost={handleDeletePost}
                onTogglePublished={handleTogglePublished}
                onManageCategoryFaqs={() => setModal({
                  kind: 'manage-faqs',
                  targetType: 'category',
                  targetId: selected.id,
                  module: activeModule,
                  title: selected.name,
                })}
                onManagePostFaqs={(p) => setModal({
                  kind: 'manage-faqs',
                  targetType: 'post',
                  targetId: p.id,
                  module: activeModule,
                  title: p.title,
                })}
              />
            )}
          </div>
        </div>
      )}

      {/* ---- Modal ---- */}
      {modal && (
        <ModalShell onClose={() => setModal(null)}>
          {modal.kind === 'add-city' && (
            <AddCityForm
              activeModule={activeModule}
              parentId={modal.parentId}
              cities={cities}
              existingCategories={categories}
              onClose={() => setModal(null)}
              onSaved={() => { setModal(null); refetchAll(); }}
            />
          )}
          {modal.kind === 'add-sub' && (
            <AddSubForm
              parentCity={modal.parentCity}
              onClose={() => setModal(null)}
              onSaved={() => { setModal(null); refetchAll(); }}
            />
          )}
          {modal.kind === 'edit-category' && (
            <EditCategoryForm
              category={modal.category}
              cities={cities}
              onClose={() => setModal(null)}
              onSaved={() => { setModal(null); refetchAll(); }}
            />
          )}
          {(modal.kind === 'add-post' || modal.kind === 'edit-post') && (
            <PostForm
              category={modal.parentCategory}
              cities={cities}
              editing={modal.kind === 'edit-post' ? modal.post : null}
              onClose={() => setModal(null)}
              onSaved={() => { setModal(null); refetchAll(); }}
            />
          )}
          {modal.kind === 'manage-faqs' && (
            <FaqManager
              targetType={modal.targetType}
              targetId={modal.targetId}
              module={modal.module}
              title={modal.title}
              onClose={() => setModal(null)}
            />
          )}
        </ModalShell>
      )}
    </div>
  );
}

// ============================================================================
// ModuleTree
// ============================================================================
function ModuleTree(props: {
  activeModule: Module;
  moduleRoot: Category;
  reviewSubtypeNode: Category | null;
  activeSubtype: string;
  childrenMap: Map<string | null, Category[]>;
  expanded: Set<string>;
  selected: Category | null;
  onSelect: (cat: Category) => void;
  onToggle: (id: string) => void;
  onAddSub: (city: Category) => void;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
}) {
  const { activeModule, moduleRoot, reviewSubtypeNode, activeSubtype,
          childrenMap, expanded, selected, onSelect, onToggle,
          onAddSub, onEdit, onDelete } = props;

  if (activeModule === 'destination') {
    const cityList = (childrenMap.get(moduleRoot.id) ?? []).filter((c) => c.level === 'CITY');
    if (cityList.length === 0) return <EmptyTree text="Chưa có tỉnh nào. Bấm + Tỉnh ở phía trên." />;
    return (
      <div className="space-y-0.5">
        {cityList.map((city) => (
          <CityWithSubs
            key={city.id} city={city} canAddSub
            childrenMap={childrenMap} expanded={expanded}
            selected={selected} onSelect={onSelect} onToggle={onToggle}
            onAddSub={onAddSub} onEdit={onEdit} onDelete={onDelete}
          />
        ))}
      </div>
    );
  }

  if (activeModule === 'itinerary' || activeModule === 'experience') {
    const cityList = (childrenMap.get(moduleRoot.id) ?? []).filter((c) => c.level === 'CITY');
    if (cityList.length === 0) return <EmptyTree text="Chưa có tỉnh nào." />;
    return (
      <div className="space-y-0.5">
        {cityList.map((city) => (
          <CityWithSubs
            key={city.id} city={city} canAddSub
            childrenMap={childrenMap} expanded={expanded}
            selected={selected} onSelect={onSelect} onToggle={onToggle}
            onAddSub={onAddSub} onEdit={onEdit} onDelete={onDelete}
          />
        ))}
      </div>
    );
  }

  if (activeModule === 'review') {
    if (!reviewSubtypeNode) return <EmptyTree text={`Subtype ${activeSubtype} chưa được seed.`} />;
    const reviewCities = (childrenMap.get(reviewSubtypeNode.id) ?? []).filter((c) => c.level === 'CITY');
    if (reviewCities.length === 0) return <EmptyTree text="Chưa có tỉnh nào trong subtype này. Bấm + Tỉnh." />;
    return (
      <div className="space-y-0.5">
        {reviewCities.map((city) => (
          <CityWithSubs
            key={city.id} city={city} canAddSub
            childrenMap={childrenMap} expanded={expanded}
            selected={selected} onSelect={onSelect} onToggle={onToggle}
            onAddSub={onAddSub} onEdit={onEdit} onDelete={onDelete}
          />
        ))}
      </div>
    );
  }

  return null;
}

function CityWithSubs(props: {
  city: Category;
  canAddSub: boolean;
  childrenMap: Map<string | null, Category[]>;
  expanded: Set<string>;
  selected: Category | null;
  onSelect: (cat: Category) => void;
  onToggle: (id: string) => void;
  onAddSub: (city: Category) => void;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
}) {
  const { city, canAddSub, childrenMap, expanded, selected, onSelect, onToggle,
          onAddSub, onEdit, onDelete } = props;
  const subs = (childrenMap.get(city.id) ?? []).filter((c) => c.level === 'SUB');
  const isOpen = expanded.has(city.id);
  const isSelected = selected?.id === city.id;
  return (
    <div>
      <div className="flex items-center group">
        <button
          onClick={() => onToggle(city.id)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </button>
        <button
          onClick={() => onSelect(city)}
          className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${
            isSelected ? 'bg-violet-100 text-violet-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <MapPin size={13} className={isSelected ? 'text-violet-600' : 'text-gray-400'} />
          <span className="truncate">{city.name}</span>
          {subs.length > 0 && (
            <span className="text-[10px] text-gray-400 ml-auto">{subs.length}</span>
          )}
        </button>
        <NodeActions onEdit={() => onEdit(city)} onDelete={() => onDelete(city)} />
      </div>
      {isOpen && (
        <div className="ml-4 border-l border-gray-100 pl-1 mt-0.5">
          {subs.map((s) => (
            <TreeNode key={s.id} cat={s} icon={<Folder size={12} />}
              selected={selected} onSelect={onSelect} indent={1}
              onEdit={onEdit} onDelete={onDelete} />
          ))}
          {canAddSub && (
            <button
              onClick={() => onAddSub(city)}
              className="ml-2 mt-1 mb-1 flex items-center gap-1 text-[11px] font-semibold text-violet-600 hover:bg-violet-50 px-2 py-1 rounded">
              <Plus size={10} /> Tiểu mục
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function TreeNode(props: {
  cat: Category; icon: React.ReactNode;
  selected: Category | null; onSelect: (cat: Category) => void;
  indent: number;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
}) {
  const { cat, icon, selected, onSelect, indent, onEdit, onDelete } = props;
  const isSelected = selected?.id === cat.id;
  return (
    <div className="flex items-center group">
      <button
        onClick={() => onSelect(cat)}
        style={{ paddingLeft: 8 + indent * 8 }}
        className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${
          isSelected ? 'bg-violet-100 text-violet-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        <span className={isSelected ? 'text-violet-600' : 'text-gray-400'}>{icon}</span>
        <span className="truncate">{cat.name}</span>
      </button>
      <NodeActions onEdit={() => onEdit(cat)} onDelete={() => onDelete(cat)} />
    </div>
  );
}

function NodeActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
      <button onClick={onEdit} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-violet-600">
        <Pencil size={11} />
      </button>
      <button onClick={onDelete} className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-600">
        <Trash2 size={11} />
      </button>
    </div>
  );
}

function EmptyTree({ text }: { text: string }) {
  return <div className="px-3 py-6 text-center text-xs text-gray-400">{text}</div>;
}

// ============================================================================
// DetailPanel
// ============================================================================
function DetailPanel(props: {
  category: Category;
  posts: Post[];
  postsLoading: boolean;
  cities: City[];
  isLeaf: boolean;
  canAddSub: boolean;
  onAddSub: () => void;
  onAddPost: () => void;
  onEditPost: (p: Post) => void;
  onDeletePost: (p: Post) => void;
  onTogglePublished: (p: Post) => void;
  onManageCategoryFaqs: () => void;
  onManagePostFaqs: (p: Post) => void;
}) {
  const { category, posts, postsLoading, cities, isLeaf, canAddSub,
          onAddSub, onAddPost, onEditPost, onDeletePost, onTogglePublished,
          onManageCategoryFaqs, onManagePostFaqs } = props;
  const cityName = category.cityId ? cities.find((c) => c.id === category.cityId)?.name : null;

  return (
    <>
      <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-600 mb-1">
            {category.level}
          </p>
          <h2 className="text-lg font-bold text-gray-900">{category.name}</h2>
          <p className="text-xs text-gray-400 font-mono mt-1">{category.slug}</p>
          {cityName && <p className="text-xs text-gray-500 mt-1">Tỉnh: {cityName}</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={onManageCategoryFaqs}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-sky-200 text-sky-700 rounded-xl text-xs font-semibold hover:bg-sky-50">
            <HelpCircle size={12} /> FAQ
          </button>
          {canAddSub && (
            <button onClick={onAddSub}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-violet-200 text-violet-700 rounded-xl text-xs font-semibold hover:bg-violet-50">
              <Plus size={12} /> Tiểu mục
            </button>
          )}
          {isLeaf && (
            <button onClick={onAddPost}
              className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 text-white rounded-xl text-xs font-semibold hover:bg-violet-700">
              <Plus size={12} /> Bài viết
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-700">Bài viết ({posts.length})</p>
      </div>

      {postsLoading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Đang tải...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <FileText size={26} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">Chưa có bài viết nào</p>
          {!isLeaf && <p className="text-[11px] text-gray-400 mt-1">Tạo tiểu mục con trước (nếu có), bài viết gắn vào cấp lá.</p>}
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((p) => (
            <div key={p.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 group border border-transparent hover:border-gray-100 transition-all">
              {p.thumbnail ? (
                <img src={p.thumbnail} alt={p.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                  <FileText size={14} className="text-violet-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{p.title}</p>
                <p className="text-[11px] text-gray-400 truncate font-mono">{p.slug}</p>
              </div>
              <button onClick={() => onTogglePublished(p)}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                  p.published
                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                    : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                }`}>
                {p.published ? <Eye size={9} className="inline mr-0.5" /> : <EyeOff size={9} className="inline mr-0.5" />}
                {p.published ? 'Công khai' : 'Ẩn'}
              </button>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onManagePostFaqs(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-sky-600 hover:bg-sky-50">
                  <HelpCircle size={12} />
                </button>
                <button onClick={() => onEditPost(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50">
                  <Pencil size={12} />
                </button>
                <button onClick={() => onDeletePost(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ============================================================================
// Modals
// ============================================================================
function ModalShell({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between p-5 border-b border-gray-100">
      <h2 className="font-bold text-gray-900">{title}</h2>
      <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
        <X size={16} className="text-gray-500" />
      </button>
    </div>
  );
}

// AddCityForm — tạo CITY level chuyên mục dưới module root (or review subtype).
function AddCityForm(props: {
  activeModule: Module;
  parentId: string;
  cities: City[];
  existingCategories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { activeModule, parentId, cities, existingCategories, onClose, onSaved } = props;
  const meta = MODULES.find((m) => m.key === activeModule)!;
  const [cityId, setCityId] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Cities not yet used under this parent
  const usedCityIds = new Set(
    existingCategories
      .filter((c) => c.parentId === parentId && c.level === 'CITY' && c.cityId)
      .map((c) => c.cityId as string),
  );
  const availableCities = cities.filter((c) => !usedCityIds.has(c.id));

  const selectedCity = cities.find((c) => c.id === cityId);
  const slug = selectedCity ? `${meta.cityPrefix ?? ''}${selectedCity.slug}` : '';
  const name = selectedCity?.name ?? '';

  const handleSave = async () => {
    if (!cityId || !selectedCity) { setError('Chọn tỉnh thành'); return; }
    setSaving(true); setError('');
    try {
      await api.post('/categories', {
        name,
        slug,
        cityId,
        parentId,
      });
      onSaved();
    } catch (e) {
      setError(errMsg(e));
    } finally { setSaving(false); }
  };

  return (
    <>
      <ModalHeader title={`Thêm tỉnh — ${meta.label}`} onClose={onClose} />
      <div className="p-5 space-y-3">
        {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Tỉnh thành *</label>
          <select value={cityId} onChange={(e) => setCityId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white">
            <option value="">Chọn tỉnh thành</option>
            {availableCities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {availableCities.length === 0 && (
            <p className="text-xs text-amber-600 mt-1">Tất cả tỉnh đã có trong nhóm này.</p>
          )}
        </div>
        {selectedCity && (
          <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1">
            <p className="text-gray-500">Sẽ tạo:</p>
            <p><span className="text-gray-500">Tên:</span> <span className="font-semibold">{name}</span></p>
            <p><span className="text-gray-500">Slug:</span> <span className="font-mono">{slug}</span></p>
            <p><span className="text-gray-500">Cấp:</span> CITY</p>
          </div>
        )}
      </div>
      <ModalFooter onCancel={onClose} onSave={handleSave} saving={saving} disabled={!cityId} saveLabel="Tạo tỉnh" />
    </>
  );
}

// AddSubForm — tạo SUB level dưới CITY.
function AddSubForm(props: {
  parentCity: Category;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { parentCity, onClose, onSaved } = props;
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !slug.trim()) { setError('Điền tên và slug'); return; }
    setSaving(true); setError('');
    try {
      await api.post('/categories', {
        name: name.trim(),
        slug: slug.trim(),
        cityId: parentCity.cityId ?? null,
        parentId: parentCity.id,
      });
      onSaved();
    } catch (e) {
      setError(errMsg(e));
    } finally { setSaving(false); }
  };

  return (
    <>
      <ModalHeader title={`Thêm tiểu mục dưới ${parentCity.name}`} onClose={onClose} />
      <div className="p-5 space-y-3">
        {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Tên *</label>
          <input value={name}
            onChange={(e) => { setName(e.target.value); setSlug(slugify(e.target.value)); }}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            placeholder="Bảo tàng" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Slug *</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 font-mono"
            placeholder="bao-tang" />
        </div>
        <p className="text-xs text-gray-500">URL phần này sẽ là <code className="bg-gray-100 px-1 rounded">{slug || 'slug'}</code> dưới <code className="bg-gray-100 px-1 rounded">{parentCity.slug}</code>.</p>
      </div>
      <ModalFooter onCancel={onClose} onSave={handleSave} saving={saving} disabled={!name || !slug} saveLabel="Tạo tiểu mục" />
    </>
  );
}

// EditCategoryForm — edit name/slug/cityId.
function EditCategoryForm(props: {
  category: Category;
  cities: City[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { category, cities, onClose, onSaved } = props;
  const [name, setName] = useState(category.name);
  const [slug, setSlug] = useState(category.slug);
  const [cityId, setCityId] = useState(category.cityId ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !slug.trim()) { setError('Điền tên và slug'); return; }
    setSaving(true); setError('');
    try {
      await api.patch(`/categories/${category.id}`, {
        name: name.trim(),
        slug: slug.trim(),
        cityId: cityId || null,
      });
      onSaved();
    } catch (e) {
      setError(errMsg(e));
    } finally { setSaving(false); }
  };

  return (
    <>
      <ModalHeader title="Sửa chuyên mục" onClose={onClose} />
      <div className="p-5 space-y-3">
        {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>}
        <div className="bg-gray-50 rounded-xl p-3 text-xs">
          <p><span className="text-gray-500">Cấp:</span> {category.level}</p>
          <p><span className="text-gray-500">ID:</span> <span className="font-mono">{category.id}</span></p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Tên *</label>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Slug *</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 font-mono" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Tỉnh thành (tuỳ chọn)</label>
          <select value={cityId} onChange={(e) => setCityId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white">
            <option value="">Không chọn</option>
            {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>
      <ModalFooter onCancel={onClose} onSave={handleSave} saving={saving} disabled={!name || !slug} saveLabel="Cập nhật" />
    </>
  );
}

// PostForm — create or edit a post pinned to a leaf category.
function PostForm(props: {
  category: Category;
  cities: City[];
  editing: Post | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { category, cities, editing, onClose, onSaved } = props;
  const [title, setTitle] = useState(editing?.title ?? '');
  const [slug, setSlug] = useState(editing?.slug ?? '');
  const [excerpt, setExcerpt] = useState(editing?.excerpt ?? '');
  const [content, setContent] = useState(editing?.content ?? '');
  const [thumbnail, setThumbnail] = useState(editing?.thumbnail ?? '');
  const [location, setLocation] = useState(editing?.location ?? '');
  const [latitude, setLatitude] = useState<string>(editing?.latitude != null ? String(editing.latitude) : '');
  const [longitude, setLongitude] = useState<string>(editing?.longitude != null ? String(editing.longitude) : '');
  const [published, setPublished] = useState(editing?.published ?? false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const cityName = category.cityId ? cities.find((c) => c.id === category.cityId)?.name : null;

  const handleSave = async () => {
    if (!title.trim() || !slug.trim() || !content.trim()) {
      setError('Điền đầy đủ tiêu đề, slug và nội dung');
      return;
    }
    if ((latitude && !longitude) || (!latitude && longitude)) {
      setError('Vui lòng nhập đầy đủ cả latitude và longitude');
      return;
    }
    setSaving(true); setError('');
    try {
      const payload: Record<string, unknown> = {
        title: title.trim(),
        slug: slug.trim(),
        content,
        excerpt: excerpt || undefined,
        thumbnail: thumbnail || undefined,
        location: location || undefined,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        published,
        categoryId: category.id,
        cityId: category.cityId ?? undefined,
      };
      if (editing) {
        await api.patch(`/posts/${editing.id}`, payload);
      } else {
        await api.post('/posts', payload);
      }
      onSaved();
    } catch (e) {
      setError(errMsg(e));
    } finally { setSaving(false); }
  };

  return (
    <>
      <ModalHeader title={editing ? 'Sửa bài viết' : `Tạo bài viết — ${category.name}`} onClose={onClose} />
      <div className="p-5 space-y-3">
        {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>}
        <div className="bg-violet-50 rounded-xl p-3 text-xs text-violet-800">
          Bài viết gắn vào: <span className="font-semibold">{category.name}</span> ({category.level})
          {cityName && <> · {cityName}</>}
        </div>

        {/* Cơ bản */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Tiêu đề *</label>
          <input value={title}
            onChange={(e) => { setTitle(e.target.value); if (!editing) setSlug(slugify(e.target.value)); }}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Slug *</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 font-mono" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Tóm tắt
            <span className="ml-1 font-normal text-gray-400">(dùng làm meta description SEO)</span>
          </label>
          <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Mô tả ngắn 120–160 ký tự, hiển thị trên Google"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
          <p className="text-[11px] text-gray-400 mt-0.5">{excerpt.length}/160 ký tự</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">URL thumbnail</label>
          <input value={thumbnail} onChange={(e) => setThumbnail(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
        </div>

        {/* Map */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Địa điểm map</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Latitude</label>
            <input value={latitude} type="number" step="any"
              onChange={(e) => setLatitude(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Longitude</label>
            <input value={longitude} type="number" step="any"
              onChange={(e) => setLongitude(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
          </div>
        </div>

        {/* Rich editor */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Nội dung *
            <span className="ml-1 font-normal text-gray-400">(hỗ trợ H1–H3, bold, link, ảnh, import file)</span>
          </label>
          <TiptapEditor value={content} onChange={setContent} />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="pub" checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="w-4 h-4 accent-violet-600" />
          <label htmlFor="pub" className="text-sm font-medium text-gray-700">Công khai ngay</label>
        </div>
      </div>
      <ModalFooter onCancel={onClose} onSave={handleSave} saving={saving}
        disabled={!title || !slug || !content}
        saveLabel={editing ? 'Cập nhật' : 'Tạo bài'} />
    </>
  );
}

function FaqManager(props: {
  targetType: 'category' | 'post';
  targetId: string;
  module: Module;
  title: string;
  onClose: () => void;
}) {
  const { targetType, targetId, module, title, onClose } = props;
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [published, setPublished] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadFaqs = () => {
    setLoading(true);
    api.get(`/faqs?targetType=${targetType}&targetId=${targetId}&includeUnpublished=true`)
      .then((r) => setFaqs(r.data ?? []))
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFaqs();
  }, [targetType, targetId]);

  const handleCreate = async () => {
    if (!question.trim() || !answer.trim()) {
      setError('Điền câu hỏi và câu trả lời');
      return;
    }
    setSaving(true); setError('');
    try {
      await api.post('/faqs', {
        targetType,
        targetId,
        module,
        question: question.trim(),
        answer: answer.trim(),
        sortOrder: Number(sortOrder) || 0,
        published,
      });
      setQuestion('');
      setAnswer('');
      setSortOrder('0');
      setPublished(true);
      loadFaqs();
    } catch (e) {
      setError(errMsg(e));
    } finally { setSaving(false); }
  };

  return (
    <>
      <ModalHeader title={`FAQ — ${title}`} onClose={onClose} />
      <div className="p-5 space-y-5">
        {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>}
        <div className="rounded-xl bg-sky-50 p-3 text-xs text-sky-800">
          FAQ này gắn riêng vào {targetType === 'post' ? 'bài viết' : 'chuyên mục'}: <span className="font-semibold">{title}</span>.
        </div>

        <div className="space-y-3 rounded-2xl border border-gray-100 p-4">
          <p className="text-sm font-bold text-gray-900">Thêm FAQ</p>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Câu hỏi *</label>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Câu trả lời *</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-24">
              <label className="mb-1 block text-xs font-semibold text-gray-700">Thứ tự</label>
              <input
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                type="number"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <label className="mt-5 flex items-center gap-2 text-sm font-medium text-gray-700">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4 accent-sky-600" />
              Công khai
            </label>
          </div>
          <button
            onClick={handleCreate}
            disabled={saving || !question || !answer}
            className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : 'Thêm FAQ'}
          </button>
        </div>

        <div>
          <p className="mb-3 text-sm font-bold text-gray-900">FAQ hiện có ({faqs.length})</p>
          {loading ? (
            <div className="py-6 text-center text-sm text-gray-400">Đang tải...</div>
          ) : faqs.length === 0 ? (
            <div className="rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500">Chưa có FAQ riêng.</div>
          ) : (
            <div className="space-y-3">
              {faqs.map((faq) => (
                <FaqEditorRow key={faq.id} faq={faq} onChanged={loadFaqs} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function FaqEditorRow({ faq, onChanged }: { faq: FaqItem; onChanged: () => void }) {
  const [question, setQuestion] = useState(faq.question);
  const [answer, setAnswer] = useState(faq.answer);
  const [sortOrder, setSortOrder] = useState(String(faq.sortOrder));
  const [published, setPublished] = useState(faq.published);
  const [saving, setSaving] = useState(false);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await api.patch(`/faqs/${faq.id}`, {
        question: question.trim(),
        answer: answer.trim(),
        sortOrder: Number(sortOrder) || 0,
        published,
      });
      onChanged();
    } catch (e) {
      alert(errMsg(e));
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Xoá FAQ này?')) return;
    try {
      await api.delete(`/faqs/${faq.id}`);
      onChanged();
    } catch (e) {
      alert(errMsg(e));
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 p-4">
      <div className="grid gap-3">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <input
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              type="number"
              className="w-20 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4 accent-sky-600" />
              Công khai
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={handleUpdate} disabled={saving || !question || !answer} className="rounded-xl bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-50">
              {saving ? 'Lưu...' : 'Lưu'}
            </button>
            <button onClick={handleDelete} className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">
              Xoá
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalFooter(props: {
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  disabled?: boolean;
  saveLabel: string;
}) {
  const { onCancel, onSave, saving, disabled, saveLabel } = props;
  return (
    <div className="flex gap-3 p-5 border-t border-gray-100">
      <button onClick={onCancel}
        className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm hover:bg-gray-50">
        Huỷ
      </button>
      <button onClick={onSave} disabled={saving || disabled}
        className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 disabled:opacity-50">
        {saving ? 'Đang lưu...' : saveLabel}
      </button>
    </div>
  );
}
