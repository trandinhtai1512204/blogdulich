'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, ArrowUpRight, Clock, BookOpen, X } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import api from '@/lib/axios';

type City = { id: string; name: string; slug: string; country: string; image?: string };

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  createdAt: string;
  thumbnail?: string;
  category?: { id: string; name: string; slug: string; type?: string };
  city?: { id: string; name: string; slug: string };
}

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1528127269322-539801943592?w=1600&q=80';

const POPULAR = ['Hà Nội', 'Đà Nẵng', 'Hội An', 'Phú Quốc', 'Sài Gòn', 'Sa Pa'];

export default function DestinationsPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/cities').then((r) => setCities(r.data ?? []));

    Promise.all([api.get('/categories'), api.get('/posts?limit=200')]).then(
      ([catRes, postRes]) => {
        const cats: Array<{ id: string; type?: string }> = catRes.data ?? [];
        const destCatIds = new Set(
          cats.filter((c) => c.type === 'destination').map((c) => c.id),
        );
        const all: Post[] = postRes.data?.data ?? [];
        const dest = all
          .filter((p) => p.category?.id && destCatIds.has(p.category.id))
          .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
          .slice(0, 6);
        setPosts(dest);
      },
    );
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query.trim()
    ? cities.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.slug.includes(query.toLowerCase()),
      )
    : [];

  const showDropdown = focused && (filtered.length > 0 || query.trim() === '');

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── HERO (bo góc giống trang chủ) ── */}
      <div className="bg-white px-3 pt-3 pb-0">
      <section className="relative w-full flex flex-col items-center justify-center"
        style={{ height: '70vh', minHeight: 460, borderRadius: 24 }}>
        {/* Background — overflow-hidden chỉ để clip ảnh vào bo góc */}
        <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: 24 }}>
          <img
            src={HERO_IMAGE}
            alt="Điểm đến Việt Nam"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/35 to-black/60" />
        </div>

        {/* Content — không overflow-hidden, dropdown thoát tự do */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-xs font-semibold mb-5">
            <MapPin size={13} />
            {cities.length > 0 ? `${cities.length} tỉnh thành` : 'Khám phá điểm đến'}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-4">
            Khám phá<br className="hidden sm:block" /> Việt Nam
          </h1>

          {/* Search box */}
          <div className="relative w-full max-w-lg">
  <div className="flex items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.35)] overflow-visible">
    <Search size={18} className="ml-5 text-white/60 shrink-0" />
    <input
      ref={inputRef}
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onFocus={() => setFocused(true)}
      placeholder="Tìm tỉnh thành, điểm đến..."
      className="flex-1 py-4 px-4 text-white placeholder-white/50 text-base outline-none bg-transparent"
    />
    {query && (
      <button
        onClick={() => { setQuery(''); inputRef.current?.focus(); }}
        className="mr-2 p-1 rounded-full hover:bg-white/20 text-white/70"
      >
        <X size={14} />
      </button>
    )}
    <button
      className="m-2 px-5 py-2.5 rounded-full font-semibold text-white text-sm shrink-0 transition-all hover:scale-105 active:scale-95 bg-violet-600 hover:bg-violet-700"
    >
      Tìm
    </button>
  </div>

  {/* Dropdown — giữ nguyên logic, chỉ đổi style */}
  {showDropdown && (
    <div
      ref={dropdownRef}
      className="absolute left-0 right-0 top-full mt-3 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
    >
      {query.trim() === '' ? (
        <div className="p-4">
          <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3 px-1">
            Phổ biến
          </p>
          <div className="flex flex-wrap gap-2">
            {POPULAR.map((name) => {
              const city = cities.find(
                (c) => c.name.toLowerCase() === name.toLowerCase(),
              );
              return (
                <Link
                  key={name}
                  href={city ? `/${city.slug}` : '#'}
                  onClick={() => setFocused(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 text-sm text-white/80 hover:border-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                  <MapPin size={12} />
                  {name}
                </Link>
              );
            })}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-5 text-center text-sm text-white/70">
          Không tìm thấy tỉnh thành nào phù hợp.
        </div>
      ) : (
        <ul className="py-2 max-h-72 overflow-y-auto">
          {filtered.map((c) => (
            <li key={c.id}>
              <Link
                href={`/${c.slug}`}
                onClick={() => setFocused(false)}
                className="flex items-center justify-between px-5 py-3 hover:bg-white/10 transition-colors group"
              >
                <span className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <MapPin size={14} className="text-white/70" />
                  </span>
                  <span>
                    <span className="font-semibold text-white text-sm">{c.name}</span>
                    <span className="block text-xs text-white/50">{c.country}</span>
                  </span>
                </span>
                <ArrowUpRight size={15} className="text-white/30 group-hover:text-white transition-colors" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )}
</div>
        </div>

        {/* Scroll indicator */}
        {/* <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 animate-bounce">
          <div className="w-5 h-8 rounded-full border-2 border-white/40 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-white/60" />
          </div>
        </div> */}
      </section>
      </div>

      {/* ── FEATURED POSTS ── */}
      <section className="max-w-275 mx-auto px-4 md:px-6 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-1">
              Bài viết đặc sắc
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              Điểm đến nổi bật
            </h2>
          </div>
          <Link
            href="/posts"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-violet-600 hover:text-violet-700 transition-colors"
          >
            Xem tất cả <ArrowUpRight size={15} />
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={post.category?.slug ? `/${post.category.slug}/${post.slug}` : `/posts/${post.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:border-violet-200 transition-all duration-200"
              >
                {post.thumbnail ? (
                  <div className="h-44 overflow-hidden">
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-44 bg-linear-to-br from-violet-50 to-indigo-100 flex items-center justify-center">
                    <BookOpen size={32} className="text-violet-200" />
                  </div>
                )}
                <div className="p-5">
                  {(post.category || post.city) && (
                    <div className="flex items-center gap-2 mb-2">
                      {post.city && (
                        <span className="inline-flex items-center gap-1 text-xs text-violet-600 font-semibold">
                          <MapPin size={11} /> {post.city.name}
                        </span>
                      )}
                      {post.category && (
                        <span className="text-xs text-gray-400">{post.category.name}</span>
                      )}
                    </div>
                  )}
                  <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 line-clamp-2 group-hover:text-violet-700 transition-colors">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{post.excerpt}</p>
                  )}
                  <p className="text-xs text-gray-400 flex items-center gap-1.5">
                    <Clock size={11} /> {formatDate(post.createdAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-10">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95 shadow-md"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
          >
            Xem tất cả bài viết <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── ALL CITIES (minimal) ── */}
      {cities.length > 0 && (
        <section className="bg-white border-t border-gray-100 py-12">
          <div className="max-w-275 mx-auto px-4 md:px-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
              Tất cả tỉnh thành
            </p>
            <div className="flex flex-wrap gap-2">
              {cities.map((c) => (
                <Link
                  key={c.id}
                  href={`/${c.slug}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-600 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50 transition-all"
                >
                  <MapPin size={12} />
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
