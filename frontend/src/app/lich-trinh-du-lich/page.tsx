'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, CalendarRange, Clock, BookOpen, MapPin, Search, FileText, X } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { FaqSection } from '@/components/FaqSection';
import InteractiveVietnamMap from '@/components/map/InteractiveVietnamMap';
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
type ItineraryCategory = { id: string; name: string; slug: string; cityId?: string | null };
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

function getCitySlugFromItinerary(categorySlug: string) {
  return categorySlug.replace(/^lich-trinh-du-lich-/, '');
}

export default function ItinerariesIndexPage() {
  const [categories, setCategories] = useState<ItineraryCategory[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);

  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      api.get('/categories?type=itinerary'),
      api.get('/posts?type=itinerary&limit=10'),
    ]).then(([catRes, postRes]) => {
      const allCats: ItineraryCategory[] = catRes.data ?? [];
      const cityCats = allCats.filter((c) => c.slug !== 'lich-trinh-du-lich');
      setCategories(cityCats);

      const posts: Post[] = postRes.data?.data ?? [];
      setAllPosts(posts);
      setFeaturedPosts(posts.slice(0, 6));
    });
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
  const activeMapSlugs = new Set(categories.map((c) => getCitySlugFromItinerary(c.slug)));

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#F6F3EE] text-[#0A2D5B]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[url('/blogdulich-bg-linework-1440.png')] bg-[length:100%_auto] bg-top bg-repeat-y opacity-[0.4]"
        style={{
          WebkitMaskImage:
            'linear-gradient(to bottom, #000 0, #000 65vh, rgba(0,0,0,0.28) 105vh, rgba(0,0,0,0.28) 100%)',
          maskImage:
            'linear-gradient(to bottom, #000 0, #000 65vh, rgba(0,0,0,0.28) 105vh, rgba(0,0,0,0.28) 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_86%_20%,rgba(246,243,238,0.66)_0%,rgba(246,243,238,0.38)_18%,rgba(246,243,238,0)_38%),radial-gradient(ellipse_at_88%_30%,rgba(246,243,238,0.72)_0%,rgba(246,243,238,0.46)_24%,rgba(246,243,238,0)_48%),radial-gradient(ellipse_at_86%_55%,rgba(246,243,238,0.64)_0%,rgba(246,243,238,0.34)_22%,rgba(246,243,238,0)_46%)]"
        style={{ zIndex: -9 }}
      />
      <Navbar logoOnlyUntilScroll />

        {/* ── HERO ── */}
          <section className="relative z-10 overflow-hidden">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-[30%] top-1/2 z-0 h-[76%] w-[72%] max-w-[1080px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(246,243,238,0.58)_0%,rgba(246,243,238,0.30)_48%,rgba(246,243,238,0)_76%)]"
            />

            <div className="relative z-10 mx-auto grid min-h-[720px] max-w-[1440px] grid-cols-1 items-stretch lg:h-[min(860px,calc(100vh-74px))] lg:grid-cols-[60%_40%]">
            <div className="relative flex min-h-[560px] flex-col justify-center overflow-visible px-5 py-16 sm:px-8 lg:min-h-[720px] lg:px-14 xl:px-20">
            <div className="relative z-10 w-full max-w-xl">
              <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0A2D5B]/70">
                <Link href="/" className="transition-colors hover:text-[#F37021]">Trang chủ</Link>
                <span className="text-[#0A2D5B]/35">/</span>
                <span className="text-[#0A2D5B]">Lịch trình du lịch</span>
              </nav>

              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1 text-xs font-bold text-[#0A2D5B] shadow-[0_8px_24px_rgba(10,45,91,0.08)] backdrop-blur">
                <CalendarRange size={13} />
                {categories.length > 0 ? `${categories.length} lịch trình` : 'Gợi ý lịch trình'}
              </div>

              <h1 className="max-w-lg text-5xl font-extrabold leading-[1.02] tracking-normal text-[#0A2D5B] sm:text-6xl lg:text-7xl">
                Lịch trình du lịch
              </h1>
              <p className="mt-5 max-w-md text-base font-semibold leading-7 text-[#0A2D5B]/72">
                Tìm lịch trình theo thành phố, số ngày và cảm hứng chuyến đi để bắt đầu nhanh hơn.
              </p>

              {/* ── SEARCH BOX ── */}
              <div className="relative mt-8 w-full max-w-xl">
                {/* Input */}
                <div className="flex items-center overflow-visible rounded-full bg-white/94 shadow-[0_18px_60px_rgba(10,45,91,0.14)] ring-1 ring-[#0A2D5B]/10 backdrop-blur-sm">
                  <MapPin size={17} className="ml-5 shrink-0 text-[#0A2D5B]/42" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setFocused(true)}
                    placeholder="Tìm lịch trình, thành phố..."
                    className="min-w-0 flex-1 bg-transparent px-4 py-4 text-base font-semibold text-[#0A2D5B] outline-none placeholder:text-[#0A2D5B]/48"
                  />
                  {query && (
                    <button
                      onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                      className="mr-2 rounded-full p-1 text-[#0A2D5B]/40 transition-colors hover:bg-[#0A2D5B]/5 hover:text-[#0A2D5B]"
                    >
                      <X size={15} />
                    </button>
                  )}
                  <button
                    className="m-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0A2D5B] shadow-lg transition-all hover:scale-105 hover:bg-[#0A2D5B]/90 active:scale-95"
                  >
                    <Search size={16} className="text-white" />
                  </button>
                </div>

                {/* Dropdown */}
                {showDropdown && (
                  <div
                    ref={dropdownRef}
                    className="absolute left-0 right-0 top-full z-50 mt-3 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.16)]"
                  >
                  <div className="max-h-[380px] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent' }}>
                    {/* Cities section */}
                    {matchedCities.length > 0 && (
                      <div className="pt-3 pb-1">
                        <div className="flex items-center gap-2 px-4 pb-2">
                          <MapPin size={12} className="text-neutral-400" />
                          <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                            Thành phố
                          </span>
                        </div>
                        {matchedCities.map((cat) => {
                          const citySlug = getCitySlugFromItinerary(cat.slug);
                          const img = CITY_IMAGES[citySlug] ?? DEFAULT_IMG;
                          return (
                            <Link
                              key={cat.id}
                              href={`/lich-trinh/${citySlug}`}
                              onClick={() => setFocused(false)}
                              className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-neutral-50"
                            >
                              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 ring-2 ring-white shadow-sm">
                                <img src={img} alt={cat.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-semibold text-neutral-950 leading-tight transition-colors group-hover:text-neutral-700">
                                  {cat.name}
                                </p>
                                <p className="text-xs text-neutral-400 mt-0.5">Việt Nam</p>
                              </div>
                              <ArrowUpRight size={14} className="shrink-0 text-neutral-300 transition-colors group-hover:text-neutral-950" />
                            </Link>
                          );
                        })}
                      </div>
                    )}

                    {/* Divider */}
                    {matchedCities.length > 0 && matchedPosts.length > 0 && (
                      <div className="mx-4 border-t border-neutral-100" />
                    )}

                    {/* Posts section */}
                    {matchedPosts.length > 0 && (
                      <div className="pt-2 pb-3">
                        <div className="flex items-center gap-2 px-4 pb-2">
                          <FileText size={12} className="text-neutral-400" />
                          <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                            Bài viết
                          </span>
                        </div>
                        {matchedPosts.map((post) => (
                          <Link
                            key={post.id}
                            href={post.canonicalUrl ?? (post.category?.slug ? `/lich-trinh/${getCitySlugFromItinerary(post.category.slug)}/${post.slug}` : `/posts/${post.slug}`)}
                            onClick={() => setFocused(false)}
                            className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-neutral-50"
                          >
                            <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-[#F37021]/10 shadow-sm">
                              {post.thumbnail ? (
                                <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <BookOpen size={14} className="text-[#F37021]/40" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <p className="truncate text-sm font-semibold text-neutral-950 leading-tight transition-colors group-hover:text-neutral-700">
                                {post.title}
                              </p>
                              {(post.city?.name || post.category?.name) && (
                                <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-400">
                                  <MapPin size={10} />
                                  {post.city?.name ?? post.category?.name}
                                </p>
                              )}
                            </div>
                            <ArrowUpRight size={14} className="shrink-0 text-neutral-300 transition-colors group-hover:text-neutral-950" />
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* No result */}
                    {hasQuery && matchedCities.length === 0 && matchedPosts.length === 0 && (
                      <div className="py-8 text-center text-sm text-neutral-500">
                        Không tìm thấy kết quả phù hợp.
                      </div>
                    )}
                  </div>
                  </div>
                )}
              </div>
            </div>
            </div>
            <div className="relative min-h-[640px] overflow-hidden bg-transparent lg:min-h-[720px]">
              <InteractiveVietnamMap
                activeSlugs={activeMapSlugs}
                hrefForSlug={(slug) => `/lich-trinh/${slug}`}
                className="relative mx-auto h-full min-h-[640px] w-full select-none overflow-hidden bg-transparent lg:min-h-[720px] [&_svg]:object-contain"
              />
            </div>
            </div>
          </section>

        <div className="max-w-[1180px] mx-auto px-4 md:px-6 py-10">

          {/* ── FEATURED POSTS ── */}
          {featuredPosts.length > 0 && (
          <section>
              <div className="mb-8 grid gap-7 lg:grid-cols-[0.92fr_1.08fr] lg:items-end lg:gap-20">
                <div>
                  <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#F37021]">
                    Gợi ý mới nhất
                  </p>
                  <h2 className="text-4xl font-extrabold leading-[1.06] tracking-tight text-[#0A2D5B] md:text-5xl">
                    Lịch trình nổi bật
                  </h2>
                </div>
                <p className="text-base font-medium leading-8 text-[#0A2D5B]/68 md:text-lg">
                  Các lịch trình mới được biên tập theo điểm đến, phù hợp để tham khảo nhanh trước khi lên đường.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {featuredPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={post.canonicalUrl ?? (post.category?.slug ? `/lich-trinh/${getCitySlugFromItinerary(post.category.slug)}/${post.slug}` : `/posts/${post.slug}`)}
                    className="group flex min-h-full flex-col overflow-hidden bg-white/94 shadow-[0_18px_45px_rgba(10,45,91,0.11)] ring-1 ring-[#0A2D5B]/10 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1"
                  >
                    {post.thumbnail ? (
                      <div className="aspect-[3/2] overflow-hidden bg-[#0A2D5B]/5">
                        <img
                          src={post.thumbnail}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-[3/2] items-center justify-center bg-gradient-to-br from-[#0A2D5B] to-[#F37021]">
                        <BookOpen size={30} className="text-white/55" />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-5 pb-0">
                      {post.category && (
                        <span className="mb-3 inline-flex w-fit bg-[#ddd6c7] px-2.5 py-1.5 text-xs font-semibold text-[#1d2738]">
                          {post.category.name}
                        </span>
                      )}
                      <h3
                        className="line-clamp-3 text-[1.35rem] leading-[1.12] text-[#071f3d] transition-colors group-hover:text-[#F37021] md:text-[1.48rem]"
                        style={{ fontFamily: 'Georgia, Cambria, \"Times New Roman\", serif' }}
                      >
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="mt-3 line-clamp-2 text-sm font-medium leading-6 text-[#0A2D5B]/58">{post.excerpt}</p>
                      )}
                      <div className="mt-auto space-y-2 pb-4 pt-4 text-sm font-medium text-[#1d2738]/80">
                        {(post.city?.name || post.category?.name) && (
                          <span className="flex items-center gap-3">
                            <MapPin size={15} className="shrink-0 fill-[#071f3d] text-[#071f3d]" />
                            {post.city?.name ?? post.category?.name}
                          </span>
                        )}
                        <span className="flex items-center gap-3">
                          <Clock size={15} className="shrink-0 text-[#071f3d]" />
                          {formatDate(post.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-auto px-5 py-3.5 text-center text-sm font-extrabold uppercase tracking-[0.14em] text-[#0A2D5B] transition-colors group-hover:text-[#F37021]">
                      Xem bài
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ── EMPTY STATE ── */}
          {categories.length === 0 && featuredPosts.length === 0 && (
            <div className="flex flex-col items-center py-24 text-white/60">
              <CalendarRange size={44} className="mb-4 opacity-25" />
              <p className="font-semibold text-base">Chưa có lịch trình nào.</p>
              <Link href="/" className="mt-4 text-sm font-semibold text-[#F37021] hover:text-[#d95f18]">
                Về trang chủ
              </Link>
            </div>
          )}
        </div>
        <FaqSection
          targetType="global"
          module="itinerary"
          heading="Những câu hỏi thường gặp về lịch trình du lịch"
        />
    </div>
  );
}
