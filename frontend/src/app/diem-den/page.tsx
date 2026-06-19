'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ArrowUpRight, X, ChevronLeft, ChevronRight, BookOpen, Eye, CalendarDays } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { FaqSection } from '@/components/FaqSection';
import InteractiveVietnamMap from '@/components/map/InteractiveVietnamMap';
import api from '@/lib/axios';

type City = { id: string; name: string; slug: string; country: string; image?: string };

type DestinationCategory = {
  id: string;
  name: string;
  slug: string;
  type?: string;
  level?: string;
  cityId?: string | null;
  parentId?: string | null;
};

type HotPost = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  thumbnail?: string;
  createdAt?: string;
  viewCount?: number;
  city?: { id: string; name: string; slug: string };
  category?: { id: string; name: string; slug: string; type?: string };
  canonicalUrl?: string;
};

type CategorySection = {
  category: DestinationCategory;
  posts: HotPost[];
};

const POPULAR = [
  { name: 'Hà Nội', slug: 'ha-noi' },
  { name: 'Đà Nẵng', slug: 'da-nang' },
  { name: 'Hội An', slug: 'da-nang' },
  { name: 'Phú Quốc', slug: 'an-giang' },
  { name: 'Sài Gòn', slug: 'sai-gon' },
  { name: 'Sa Pa', slug: 'lao-cai' },
];

export default function DestinationsPage() {
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([]);
  const [hotPosts, setHotPosts] = useState<HotPost[]>([]);
  const [categorySections, setCategorySections] = useState<CategorySection[]>([]);
  const [loadingSections, setLoadingSections] = useState(true);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/cities').then((r) => setCities(r.data ?? []));

    api.get('/posts?type=destination&limit=120')
      .then((r) => {
        const posts: HotPost[] = [...(r.data?.data ?? [])].sort(
          (a, b) =>
            (b.viewCount ?? 0) - (a.viewCount ?? 0)
            || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setHotPosts(posts.slice(0, 6));

        const sectionMap = new Map<string, CategorySection>();
        posts.forEach((post) => {
          if (!post.category?.id || !post.category.slug) return;
          const key = post.category.slug;
          const current = sectionMap.get(key);
          if (current) {
            if (current.posts.length < 6) current.posts.push(post);
            return;
          }
          sectionMap.set(key, {
            category: {
              id: post.category.id,
              name: post.category.name,
              slug: post.category.slug,
              type: post.category.type,
            },
            posts: [post],
          });
        });

        setCategorySections([...sectionMap.values()].filter((section) => section.posts.length > 0));
      })
      .finally(() => setLoadingSections(false));
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) setFocused(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query.trim()
    ? cities.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.slug.includes(query.toLowerCase()))
    : [];

  const showDropdown = focused && (filtered.length > 0 || query.trim() === '');
  const activeMapSlugs = new Set(cities.map((c) => c.slug));

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const term = query.trim().toLowerCase();
    if (!term) {
      inputRef.current?.focus();
      return;
    }

    const match = cities.find((c) => c.name.toLowerCase() === term || c.slug === term) ?? filtered[0];
    if (match) router.push(`/diem-den/${match.slug}`);
  };

  const getPostHref = (post: HotPost) =>
    post.canonicalUrl ?? (post.city?.slug && post.category?.slug ? `/diem-den/${post.city.slug}/${post.category.slug}/${post.slug}` : `/posts/${post.slug}`);

  const getCategoryHref = (section: CategorySection) => {
    const firstPostHref = section.posts[0] ? getPostHref(section.posts[0]) : '';
    if (firstPostHref.startsWith('/diem-den/')) {
      return firstPostHref.split('/').slice(0, -1).join('/');
    }
    if (section.category.level === 'CITY') return `/diem-den/${section.category.slug}`;
    return '/diem-den';
  };

  const formatDate = (dateStr?: string) =>
    dateStr ? new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-white text-[#0A2D5B]">
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
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_86%_20%,rgba(255,255,255,0.66)_0%,rgba(255,255,255,0.38)_18%,rgba(255,255,255,0)_38%),radial-gradient(ellipse_at_88%_30%,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.46)_24%,rgba(255,255,255,0)_48%),radial-gradient(ellipse_at_86%_55%,rgba(255,255,255,0.64)_0%,rgba(255,255,255,0.34)_22%,rgba(255,255,255,0)_46%)]"
        style={{ zIndex: -9 }}
      />
      <Navbar logoOnlyUntilScroll />

      {/* ── HERO ── */}
      <section className="relative z-10 overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[30%] top-1/2 z-0 h-[76%] w-[72%] max-w-[1080px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.58)_0%,rgba(255,255,255,0.30)_48%,rgba(255,255,255,0)_76%)]"
        />
        <div className="relative z-10 mx-auto grid min-h-[680px] max-w-[1440px] grid-cols-1 items-stretch lg:h-[min(790px,calc(100vh-74px))] lg:grid-cols-[58%_42%]">
          <div className="relative flex min-h-[540px] flex-col justify-center overflow-hidden px-5 py-16 sm:px-8 lg:min-h-[680px] lg:px-14 xl:px-20">
            <div className="relative z-10 max-w-xl">
              <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0A2D5B]/70">
                <Link href="/" className="transition-colors hover:text-[#F37021]">
                  Trang chủ
                </Link>
                <span className="text-[#0A2D5B]/35">/</span>
                <span className="text-[#0A2D5B]">Điểm đến</span>
              </nav>

              <div className="relative">
                <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.22em] text-[#F37021]">Atlas du lịch Việt Nam</p>
                <h1 className="max-w-xl text-5xl font-extrabold leading-[1.02] tracking-normal text-[#0A2D5B] sm:text-6xl lg:text-7xl">
                  Khám phá điểm đến Việt Nam
                </h1>
                <p className="mt-5 max-w-md text-base font-semibold leading-7 text-[#0A2D5B]/72">
                  Tìm nhanh tỉnh thành bạn đã có trong đầu, hoặc rê trên bản đồ để mở một hành trình mới.
                </p>
              </div>

              <form onSubmit={handleSearch} className="relative mt-8 w-full max-w-xl">
                <div className="flex items-center overflow-visible rounded-full bg-white/94 shadow-[0_18px_60px_rgba(10,45,91,0.14)] ring-1 ring-[#0A2D5B]/10 backdrop-blur-sm">
                  <Search size={19} className="ml-5 shrink-0 text-[#0A2D5B]/42" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setFocused(true)}
                  placeholder="Tìm tỉnh thành, điểm đến..."
                  className="min-w-0 flex-1 bg-transparent px-4 py-4 text-base font-semibold text-[#0A2D5B] outline-none placeholder:text-[#0A2D5B]/48"
                />
                {query && (
                  <button type="button" onClick={() => { setQuery(''); inputRef.current?.focus(); }} className="mr-2 rounded-full p-1 text-[#0A2D5B]/40 hover:bg-[#0A2D5B]/5 hover:text-[#0A2D5B]">
                    <X size={14} />
                  </button>
                )}
                <button
                  type="submit"
                  className="m-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0A2D5B] shadow-lg transition-all hover:scale-105 hover:bg-[#0A2D5B]/90 active:scale-95"
                  aria-label="Tìm kiếm"
                >
                  <Search size={20} className="text-white" />
                </button>
              </div>

              {showDropdown && (
                <div ref={dropdownRef} className="absolute left-0 right-0 top-full z-50 mt-3 overflow-hidden rounded-2xl bg-white shadow-[0_24px_70px_rgba(10,45,91,0.18)] ring-1 ring-[#0A2D5B]/10">
                  {query.trim() === '' ? (
                    <div className="p-4">
                      <p className="mb-3 px-1 text-xs font-bold uppercase tracking-wider text-[#0A2D5B]">Phổ biến</p>
                      <div className="flex flex-wrap gap-2">
                        {POPULAR.map((item) => {
                          const city = cities.find((c) => c.slug === item.slug);
                          return (
                            <Link key={item.name} href={city ? `/diem-den/${city.slug}` : `/diem-den/${item.slug}`} onClick={() => setFocused(false)}
                              className="flex items-center gap-1.5 rounded-full bg-[#0A2D5B]/5 px-3 py-1.5 text-sm font-semibold text-[#0A2D5B] transition-colors hover:bg-[#F37021]/10 hover:text-[#F37021]">
                              <MapPin size={12} /> {item.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="p-5 text-center text-sm font-semibold text-[#0A2D5B]">Không tìm thấy tỉnh thành phù hợp.</div>
                  ) : (
                    <ul className="py-2 max-h-72 overflow-y-auto">
                      {filtered.map((c) => (
                        <li key={c.id}>
                          <Link href={`/diem-den/${c.slug}`} onClick={() => setFocused(false)}
                            className="group flex items-center justify-between px-5 py-3 transition-colors hover:bg-[#0A2D5B]/5">
                            <span className="flex items-center gap-3">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F37021]/10">
                                <MapPin size={14} className="text-[#F37021]" />
                              </span>
                              <span>
                                <span className="text-sm font-semibold text-[#0A2D5B]">{c.name}</span>
                                <span className="block text-xs font-semibold text-[#0A2D5B]/60">{c.country}</span>
                              </span>
                            </span>
                            <ArrowUpRight size={15} className="text-[#0A2D5B]/25 transition-colors group-hover:text-[#F37021]" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              </form>

              <div className="relative mt-5 flex flex-wrap gap-2">
                {POPULAR.slice(0, 5).map((item) => {
                  const city = cities.find((c) => c.slug === item.slug);
                  return (
                    <Link
                      key={`quick-${item.name}`}
                      href={city ? `/diem-den/${city.slug}` : `/diem-den/${item.slug}`}
                      className="rounded-full bg-white/75 px-3 py-1.5 text-sm font-bold text-[#0A2D5B] shadow-[0_8px_24px_rgba(10,45,91,0.08)] backdrop-blur transition-colors hover:text-[#F37021]"
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="relative min-h-[620px] overflow-hidden bg-transparent lg:min-h-[680px]">
            <InteractiveVietnamMap
              activeSlugs={activeMapSlugs}
              hrefForSlug={(slug) => `/diem-den/${slug}`}
              shapeShield
              className="relative z-10 mx-auto h-full min-h-[620px] w-full select-none overflow-hidden bg-transparent lg:min-h-[680px] [&_svg]:object-contain"
            />
          </div>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <div className="relative -mt-px pt-10 md:pt-14">
      {/* ── INTRO TEXT ── */}
      <section className="relative z-10 mx-auto grid max-w-[1180px] gap-8 px-4 pt-12 pb-8 md:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start lg:gap-20">
        <div>
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.18em] text-[#F37021]">Khám phá Việt Nam</p>
          <h2 className="max-w-[520px] text-4xl font-extrabold leading-[1.06] tracking-tight text-[#0A2D5B] md:text-5xl">
            Từ bản đồ đến hành trình cụ thể
          </h2>
        </div>
        <div className="space-y-5 pt-1 text-base font-medium leading-8 text-[#0A2D5B]/68 md:text-lg">
          <p>
            Từ những đỉnh núi phủ mây ở Sa Pa đến bãi biển xanh ngắt Phú Quốc, từ phố cổ Hội An trầm mặc đến Hà Nội sôi động.
          </p>
          <p>
            Việt Nam trải dài qua 34 tỉnh thành với vô vàn trải nghiệm chờ bạn khám phá. Chọn điểm đến, bắt đầu hành trình.
          </p>
        </div>
      </section>

      {/* ── CATEGORY HOT POSTS ── */}
      <section className="relative z-10 mx-auto max-w-[1100px] px-4 py-10 md:px-6">
        <div className="mb-9 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.18em] text-[#F37021]">Bài viết được xem nhiều</p>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#0A2D5B] md:text-3xl">
              Điểm đến theo từng danh mục
            </h2>
          </div>
          <Link
            href="/posts"
            className="inline-flex items-center gap-1 text-sm font-extrabold text-[#0A2D5B] hover:text-[#F37021]"
          >
            Tất cả bài viết <ArrowUpRight size={14} />
          </Link>
        </div>

        {loadingSections ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[320px] animate-pulse bg-white/80 shadow-[0_18px_45px_rgba(10,45,91,0.08)]" />
            ))}
          </div>
        ) : categorySections.length > 0 ? (
          <div className="space-y-14">
            {categorySections.map((section) => (
              <div key={section.category.id}>
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#F37021]">
                      Danh mục điểm đến
                    </p>
                    <h3 className="text-2xl font-extrabold tracking-tight text-[#0A2D5B] md:text-[2rem]">
                      {section.category.name}
                    </h3>
                  </div>
                  <Link
                    href={getCategoryHref(section)}
                    className="inline-flex items-center gap-1 text-sm font-extrabold text-[#0A2D5B] hover:text-[#F37021]"
                  >
                    Xem danh mục <ArrowUpRight size={14} />
                  </Link>
                </div>
                <DestinationPostRail posts={section.posts} getPostHref={getPostHref} formatDate={formatDate} />
              </div>
            ))}
          </div>
        ) : hotPosts.length > 0 ? (
          <DestinationPostRail posts={hotPosts} getPostHref={getPostHref} formatDate={formatDate} />
        ) : (
          <div className="rounded-2xl bg-white/90 p-8 text-center font-semibold text-[#0A2D5B]/60 shadow-[0_18px_45px_rgba(10,45,91,0.08)]">
            Chưa có bài viết điểm đến để hiển thị.
          </div>
        )}
      </section>

      <FaqSection
        targetType="global"
        module="destination"
        heading="Những câu hỏi khi du lịch Việt Nam"
      />
      </div>
    </div>
  );
}

function DestinationPostRail({
  posts,
  getPostHref,
  formatDate,
}: {
  posts: HotPost[];
  getPostHref: (post: HotPost) => string;
  formatDate: (date?: string) => string;
}) {
  const railRef = useRef<HTMLDivElement>(null);

  const scrollRail = (direction: 'prev' | 'next') => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({
      left: direction === 'next' ? rail.clientWidth * 0.86 : -rail.clientWidth * 0.86,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative">
      <div
        ref={railRef}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide md:mx-0 md:px-0"
      >
        {posts.map((post, index) => (
          <div key={post.id} className="w-[82vw] shrink-0 snap-start sm:w-[330px] lg:w-[340px]">
            <DestinationArticleCard post={post} index={index} href={getPostHref(post)} formatDate={formatDate} />
          </div>
        ))}
      </div>
      {posts.length > 2 && (
        <>
          <button
            type="button"
            aria-label="Trước"
            onClick={() => scrollRail('prev')}
            className="absolute left-0 top-1/2 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-white text-[#0A2D5B] shadow-[0_12px_30px_rgba(10,45,91,0.16)] transition-colors hover:text-[#F37021] md:flex"
          >
            <ChevronLeft size={24} strokeWidth={2.2} />
          </button>
          <button
            type="button"
            aria-label="Tiếp"
            onClick={() => scrollRail('next')}
            className="absolute right-0 top-1/2 hidden h-11 w-11 -translate-y-1/2 translate-x-1/2 items-center justify-center bg-white text-[#0A2D5B] shadow-[0_12px_30px_rgba(10,45,91,0.16)] transition-colors hover:text-[#F37021] md:flex"
          >
            <ChevronRight size={24} strokeWidth={2.2} />
          </button>
        </>
      )}
    </div>
  );
}

function DestinationArticleCard({
  post,
  index,
  href,
  formatDate,
}: {
  post: HotPost;
  index: number;
  href: string;
  formatDate: (date?: string) => string;
}) {
  return (
    <Link
      href={href}
      className="group flex h-[360px] flex-col overflow-hidden bg-white/94 shadow-[0_18px_45px_rgba(10,45,91,0.11)] ring-1 ring-[#0A2D5B]/10 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 sm:h-[340px] lg:h-[350px]"
    >
      <div className="relative h-[75%] shrink-0 overflow-hidden bg-[#0A2D5B]/5">
        {post.thumbnail ? (
          <img
            src={post.thumbnail}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0A2D5B] to-[#F37021]">
            <BookOpen size={30} className="text-white/55" />
          </div>
        )}
        <span className="absolute left-3 top-3 inline-flex bg-[#ddd6c7] px-2 py-1 text-[11px] font-semibold text-[#1d2738] shadow-sm">
          {post.category?.name || `#${index + 1}`}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-3.5 pb-0">
        <h3
          className="line-clamp-2 text-[1rem] leading-[1.14] text-[#071f3d] transition-colors group-hover:text-[#F37021] md:text-[1.08rem]"
          style={{ fontFamily: 'Georgia, Cambria, \"Times New Roman\", serif' }}
        >
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-1.5 hidden text-xs font-medium leading-5 text-[#0A2D5B]/58 xl:line-clamp-1 xl:block">
            {post.excerpt}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pb-2.5 pt-2 text-[11px] font-medium text-[#1d2738]/80">
          {post.city?.name && (
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="shrink-0 fill-[#071f3d] text-[#071f3d]" />
              {post.city.name}
            </div>
          )}
          {formatDate(post.createdAt) && (
            <div className="flex items-center gap-1.5">
              <CalendarDays size={12} className="shrink-0 text-[#071f3d]" />
              {formatDate(post.createdAt)}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[#F37021]">
            <Eye size={12} className="shrink-0" />
            <span className="font-bold">{post.viewCount ?? 0} lượt xem</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
