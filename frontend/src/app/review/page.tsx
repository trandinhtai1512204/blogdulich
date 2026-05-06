'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Star, BookOpen, MapPin, Search, FileText, X, MessageSquareQuote } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import api from '@/lib/axios';

const REVIEW_IMAGES: Record<string, string> = {
  'review-tour': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80',
  'review-khach-san': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
  'review-combo': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80',
  'review-resort': 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&q=80',
  'review-du-thuyen': 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=600&q=80',
  'review-nha-hang': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
};

const HERO_IMAGE = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80';

const REVIEW_TYPES = [
  { label: 'Review Tour Du Lịch', href: '/review-tour' },
  { label: 'Review Khách Sạn', href: '/review-khach-san' },
  { label: 'Review Combo', href: '/review-combo' },
  { label: 'Review Resort', href: '/review-resort' },
  { label: 'Review Du Thuyền', href: '/review-du-thuyen' },
  { label: 'Review Nhà Hàng', href: '/review-nha-hang' },
];

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  createdAt: string;
  thumbnail?: string;
  category?: { id: string; name: string; slug: string };
  city?: { id: string; name: string; slug: string };
};

export default function ReviewIndexPage() {
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      api.get('/categories?type=review'),
      api.get('/posts?limit=200'),
    ]).then(([catRes, postRes]) => {
      const reviewCats: { id: string }[] = catRes.data ?? [];
      const reviewCatIds = new Set(reviewCats.map((c) => c.id));
      const all: Post[] = postRes.data?.data ?? [];
      const reviewPosts = all
        .filter((p) => p.category?.id && reviewCatIds.has(p.category.id))
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
      setAllPosts(reviewPosts);
      setFeaturedPosts(reviewPosts.slice(0, 6));
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

  const matchedTypes = hasQuery
    ? REVIEW_TYPES.filter((t) => t.label.toLowerCase().includes(q))
    : REVIEW_TYPES.slice(0, 5);

  const matchedPosts = hasQuery
    ? allPosts.filter((p) => p.title.toLowerCase().includes(q))
    : allPosts.slice(0, 5);

  const showDropdown = focused && (matchedTypes.length > 0 || matchedPosts.length > 0);

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
              alt="Review du lịch"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/35 to-black/60" />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-2xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-4">
              Review<br className="hidden sm:block" /> du lịch
            </h1>

            {/* ── SEARCH BOX ── */}
            <div className="relative w-full max-w-lg">
              <div
                className="flex items-center rounded-4xl overflow-visible"
                style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.22)' }}
              >
                <Star size={17} className="ml-4 shrink-0 text-white/60" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setFocused(true)}
                  placeholder="Tìm review tour, khách sạn, nhà hàng..."
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
                    {matchedTypes.length > 0 && (
                      <div className="pt-3 pb-1">
                        <div className="flex items-center gap-2 px-4 pb-2">
                          <MessageSquareQuote size={12} className="text-white/60" />
                          <span className="text-[11px] font-bold uppercase tracking-widest text-white/60">Loại review</span>
                        </div>
                        {matchedTypes.map((t) => (
                          <Link
                            key={t.href}
                            href={t.href}
                            onClick={() => setFocused(false)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-violet-50/80 transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0">
                              <img src={REVIEW_IMAGES[t.href.slice(1)] ?? HERO_IMAGE} alt={t.label} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-sm font-semibold text-white leading-tight group-hover:text-violet-300 transition-colors">{t.label}</p>
                            </div>
                            <ArrowUpRight size={14} className="text-white/30 group-hover:text-violet-500 shrink-0 transition-colors" />
                          </Link>
                        ))}
                      </div>
                    )}

                    {matchedTypes.length > 0 && matchedPosts.length > 0 && (
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
                            href={post.category?.slug ? `/${post.category.slug}/${post.slug}` : `/posts/${post.slug}`}
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

                    {hasQuery && matchedTypes.length === 0 && matchedPosts.length === 0 && (
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

        {/* ── REVIEW TYPE CARDS ── */}
        <section className="mb-14">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-1">Đánh giá thực tế</p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Chọn loại review</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {REVIEW_TYPES.map((t) => {
              const imgKey = t.href.slice(1);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className="group relative overflow-hidden rounded-2xl h-48 block shadow-sm hover:shadow-lg transition-shadow duration-200"
                >
                  <img
                    src={REVIEW_IMAGES[imgKey] ?? HERO_IMAGE}
                    alt={t.label}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-bold text-sm leading-tight line-clamp-2 mb-1">{t.label}</p>
                    <p className="text-white/60 text-xs flex items-center gap-1">
                      Xem đánh giá <ArrowUpRight size={11} />
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── FEATURED POSTS ── */}
        {featuredPosts.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-1">Mới nhất</p>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Review nổi bật</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredPosts.map((post) => (
                <Link
                  key={post.id}
                  href={post.category?.slug ? `/${post.category.slug}/${post.slug}` : `/posts/${post.slug}`}
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
                        <Star size={11} /> {post.category.name}
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
      </div>
    </div>
  );
}
