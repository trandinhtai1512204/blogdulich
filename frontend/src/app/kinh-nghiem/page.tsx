'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, MapPin, Search, FileText, X, Backpack } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import api from '@/lib/axios';

const CITY_IMAGES: Record<string, string> = {
  'ha-noi': 'https://images.unsplash.com/photo-1601108644994-1e450e786d3d?w=400&q=80',
  'sai-gon': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&q=80',
  'hoi-an': 'https://images.unsplash.com/photo-1660562925534-3f6948ac654f?w=400&q=80',
  'da-nang': 'https://images.unsplash.com/photo-1696993545232-2b2717676c40?w=400&q=80',
  'nha-trang': 'https://images.unsplash.com/photo-1508009603885-50cf7c8dd0d5?w=400&q=80',
  'phu-quoc': 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=400&q=80',
  'sa-pa': 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&q=80',
  'ha-long': 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=80',
  'vung-tau': 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=400&q=80',
  'hue': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
  'da-lat': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&q=80',
  'can-tho': 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=80',
};
const DEFAULT_IMG = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80';
const HERO_IMAGE = 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=1600&q=80';

type ExperienceCategory = { id: string; name: string; slug: string };
type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  createdAt: string;
  thumbnail?: string;
  category?: { id: string; name: string; slug: string };
  city?: { id: string; name: string; slug: string };
  canonicalUrl?: string;
};

function getCitySlugFromExperience(categorySlug: string) {
  return categorySlug.replace(/^kinh-nghiem-du-lich-/, '');
}

export default function ExperienceIndexPage() {
  const [categories, setCategories] = useState<ExperienceCategory[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);

  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      api.get('/categories?type=experience'),
      api.get('/posts?limit=200'),
    ]).then(([catRes, postRes]) => {
      const allCats: ExperienceCategory[] = catRes.data ?? [];
      const cityCats = allCats.filter((c) => c.slug !== 'kinh-nghiem-du-lich');
      setCategories(cityCats);

      const expCatIds = new Set(allCats.map((c) => c.id));
      const all: Post[] = postRes.data?.data ?? [];
      const expPosts = all
        .filter((p) => p.category?.id && expCatIds.has(p.category.id))
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
      setAllPosts(expPosts);
      setFeaturedPosts(expPosts.slice(0, 6));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const q = query.trim().toLowerCase();
  const hasQuery = q.length > 0;

  const matchedCities = hasQuery
    ? categories.filter((c) => c.name.toLowerCase().includes(q))
    : categories.slice(0, 5);

  const matchedPosts = hasQuery
    ? allPosts.filter((p) => p.title.toLowerCase().includes(q))
    : allPosts.slice(0, 5);

  const showDropdown = focused && (matchedCities.length > 0 || matchedPosts.length > 0);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── HERO ── */}
      <div className="bg-white px-3 pt-3 pb-0">
        <section
          className="relative w-full flex flex-col items-center justify-center"
          style={{ height: '70vh', minHeight: 480, borderRadius: 24 }}
        >
          <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: 24 }}>
            <img
              src={HERO_IMAGE}
              alt="Kinh nghiệm du lịch"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/35 to-black/60" />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-2xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-4">
              Kinh nghiệm<br className="hidden sm:block" /> du lịch
            </h1>

            {/* ── SEARCH BOX ── */}
            <div className="relative w-full max-w-lg">
              <div
                className="flex items-center rounded-4xl overflow-visible"
                style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.22)' }}
              >
                <MapPin size={17} className="ml-4 shrink-0 text-white/60" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setFocused(true)}
                  placeholder="Tìm kinh nghiệm, thành phố..."
                  className="flex-1 py-3.5 px-3 text-white placeholder-white/50 text-sm outline-none bg-transparent"
                />
                {query && (
                  <button
                    onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                    className="p-1.5 mr-1 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X size={15} />
                  </button>
                )}
                <button
                  className="m-1.5 w-9 h-9 rounded-4xl flex items-center justify-center shrink-0 transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
                >
                  <Search size={16} className="text-white" />
                </button>
              </div>

              {/* Dropdown */}
              {showDropdown && (
                <div
                  ref={dropdownRef}
                  className="absolute left-0 right-0 top-full mt-2 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  <div className="max-h-[380px] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent' }}>
                    {matchedCities.length > 0 && (
                      <div className="pt-3 pb-1">
                        <div className="flex items-center gap-2 px-4 pb-2">
                          <MapPin size={12} className="text-white/60" />
                          <span className="text-[11px] font-bold uppercase tracking-widest text-white/60">Thành phố</span>
                        </div>
                        {matchedCities.map((cat) => {
                          const citySlug = getCitySlugFromExperience(cat.slug);
                          const img = CITY_IMAGES[citySlug] ?? DEFAULT_IMG;
                          return (
                            <Link
                              key={cat.id}
                              href={`/${cat.slug}`}
                              onClick={() => setFocused(false)}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-violet-50/80 transition-colors group"
                            >
                              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 ring-2 ring-white shadow-sm">
                                <img src={img} alt={cat.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-semibold text-white leading-tight group-hover:text-violet-300 transition-colors">{cat.name}</p>
                                <p className="text-xs text-white/60 mt-0.5">Việt Nam</p>
                              </div>
                              <ArrowUpRight size={14} className="text-white/30 group-hover:text-violet-500 shrink-0 transition-colors" />
                            </Link>
                          );
                        })}
                      </div>
                    )}

                    {matchedCities.length > 0 && matchedPosts.length > 0 && (
                      <div className="mx-4 border-t border-white/10" />
                    )}

                    {matchedPosts.length > 0 && (
                      <div className="pt-2 pb-3">
                        <div className="flex items-center gap-2 px-4 pb-2">
                          <FileText size={12} className="text-white/60" />
                          <span className="text-[11px] font-bold uppercase tracking-widest text-white/60">Bài viết</span>
                        </div>
                        {matchedPosts.map((post) => (
                          <Link
                            key={post.id}
                            href={post.canonicalUrl ?? (post.category?.slug ? `/${post.category.slug}/${post.slug}` : `/posts/${post.slug}`)}
                            onClick={() => setFocused(false)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-violet-50/80 transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-violet-100 shadow-sm">
                              {post.thumbnail ? (
                                <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <BookOpen size={14} className="text-violet-300" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-sm font-semibold text-white leading-tight truncate group-hover:text-violet-300 transition-colors">{post.title}</p>
                              {(post.city?.name || post.category?.name) && (
                                <p className="text-xs text-white/60 mt-0.5 flex items-center gap-1">
                                  <MapPin size={10} /> {post.city?.name ?? post.category?.name}
                                </p>
                              )}
                            </div>
                            <ArrowUpRight size={14} className="text-white/30 group-hover:text-violet-500 shrink-0 transition-colors" />
                          </Link>
                        ))}
                      </div>
                    )}

                    {hasQuery && matchedCities.length === 0 && matchedPosts.length === 0 && (
                      <div className="py-8 text-center text-sm text-white/60">Không tìm thấy kết quả phù hợp.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="max-w-[1180px] mx-auto px-4 md:px-6 py-10">

        {/* ── CITY CARDS ── */}
        {categories.length > 0 && (
          <section className="mb-14">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-1">Theo điểm đến</p>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Kinh nghiệm theo thành phố</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categories.map((cat) => {
                const citySlug = getCitySlugFromExperience(cat.slug);
                const img = CITY_IMAGES[citySlug] ?? DEFAULT_IMG;
                return (
                  <Link
                    key={cat.id}
                    href={`/${cat.slug}`}
                    className="group relative overflow-hidden rounded-2xl h-48 block shadow-sm hover:shadow-lg transition-shadow duration-200"
                  >
                    <img
                      src={img}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white font-bold text-sm leading-tight line-clamp-2 mb-1">{cat.name}</p>
                      <p className="text-white/60 text-xs flex items-center gap-1">
                        Xem kinh nghiệm <ArrowUpRight size={11} />
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── FEATURED POSTS ── */}
        {featuredPosts.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-1">Cẩm nang thực chiến</p>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Kinh nghiệm nổi bật</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredPosts.map((post) => (
                <Link
                  key={post.id}
                  href={post.canonicalUrl ?? (post.category?.slug ? `/${post.category.slug}/${post.slug}` : `/posts/${post.slug}`)}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:border-violet-200 transition-all duration-200"
                >
                  {post.thumbnail ? (
                    <div className="h-44 overflow-hidden">
                      <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="h-44 bg-linear-to-br from-violet-50 to-indigo-100 flex items-center justify-center">
                      <BookOpen size={32} className="text-violet-200" />
                    </div>
                  )}
                  <div className="p-4">
                    {post.category && (
                      <span className="inline-flex items-center gap-1 text-xs text-violet-600 font-semibold mb-2">
                        <Backpack size={11} /> {post.category.name}
                      </span>
                    )}
                    <h3 className="font-bold text-gray-900 line-clamp-2 leading-snug mb-2 group-hover:text-violet-700 transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{post.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">{formatDate(post.createdAt)}</span>
                      <span className="inline-flex items-center gap-1 text-violet-600 font-semibold">
                        Đọc <ArrowUpRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── EMPTY STATE ── */}
        {categories.length === 0 && featuredPosts.length === 0 && (
          <div className="flex flex-col items-center py-24 text-gray-400">
            <Backpack size={44} className="mb-4 opacity-25" />
            <p className="font-semibold text-base">Chưa có kinh nghiệm nào.</p>
            <Link href="/" className="mt-4 text-sm font-semibold text-violet-600 hover:text-violet-700">
              Về trang chủ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
