'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, BookOpen, CalendarDays, ChevronLeft, ChevronRight, Eye, MapPin } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import api from '@/lib/axios';

type CategoryType = 'destination' | 'itinerary' | 'review' | 'experience';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  createdAt: string;
  thumbnail?: string;
  viewCount?: number;
  category?: { id: string; name: string; slug: string; type?: CategoryType };
  city?: { id: string; name: string; slug: string };
  canonicalUrl?: string;
}

const TYPE_ORDER: CategoryType[] = ['destination', 'itinerary', 'review', 'experience'];
const HOME_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Blog du lịch Việt Nam',
  alternateName: ['BlogDuLich.vn', 'Blogdulich', 'Blog du lich', 'Blog du lịch'],
  url: 'https://blogdulich.vn/',
  inLanguage: 'vi-VN',
  description: 'Blog du lịch Việt Nam chia sẻ kinh nghiệm, review điểm đến và lịch trình khám phá Việt Nam.',
  publisher: {
    '@type': 'Organization',
    name: 'BlogDuLich.vn',
    url: 'https://blogdulich.vn/',
  },
};

const SECTION_COPY: Record<CategoryType, { href: string; title: ReactNode; subtitle: ReactNode; cta: ReactNode }> = {
  destination: {
    href: '/diem-den',
    title: <>Điểm đến nổi bật</>,
    subtitle: <>Những địa điểm đang được cộng đồng quan tâm.</>,
    cta: <>Xem tất cả điểm đến</>,
  },
  itinerary: {
    href: '/lich-trinh',
    title: <>Lịch trình gợi ý</>,
    subtitle: <>Lịch trình thực tế để tham khảo trước mỗi chuyến đi.</>,
    cta: <>Xem tất cả lịch trình</>,
  },
  review: {
    href: '/review',
    title: <>Review mới nhất</>,
    subtitle: <>Trải nghiệm và đánh giá từ những người đã ghé thăm.</>,
    cta: <>Xem tất cả review</>,
  },
  experience: {
    href: '/kinh-nghiem',
    title: <>Kinh nghiệm du lịch</>,
    subtitle: <>Mẹo hay, bí kíp và hành trang kiến thức cho mỗi chuyến đi.</>,
    cta: <>Xem thêm bài viết</>,
  },
};

const sortPostsByHotness = (posts: Post[]) =>
  [...posts].sort(
    (a, b) =>
      (b.viewCount ?? 0) - (a.viewCount ?? 0)
      || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

const REGIONS = [
  {
    key: 'north',
    label: 'Miền Bắc',
    line: 'Núi, phố cổ và vịnh biển phía Bắc.',
    href: '/diem-den',
    slugs: [
      'dien-bien',
      'lai-chau',
      'lao-cai',
      'son-la',
      'phu-tho',
      'tuyen-quang',
      'cao-bang',
      'lang-son',
      'thai-nguyen',
      'bac-ninh',
      'ha-noi',
      'hai-phong',
      'quang-ninh',
      'hung-yen',
      'ninh-binh',
    ],
  },
  {
    key: 'central',
    label: 'Miền Trung',
    line: 'Di sản, biển dài và cung đường xuyên miền.',
    href: '/lich-trinh',
    slugs: [
      'thanh-hoa',
      'nghe-an',
      'ha-tinh',
      'quang-tri',
      'hue',
      'da-nang',
      'quang-ngai',
      'gia-lai',
      'dak-lak',
      'khanh-hoa',
      'lam-dong',
    ],
  },
  {
    key: 'south',
    label: 'Miền Nam',
    line: 'Đô thị, miệt vườn và nhịp sống phương Nam.',
    href: '/kinh-nghiem',
    slugs: [
      'sai-gon',
      'dong-nai',
      'tay-ninh',
      'dong-thap',
      'vinh-long',
      'can-tho',
      'an-giang',
      'ca-mau',
    ],
  },
] as const;

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [regionalPosts, setRegionalPosts] = useState<Post[]>([]);
  const [postsByType, setPostsByType] = useState<Record<CategoryType, Post[]>>({
    destination: [],
    itinerary: [],
    review: [],
    experience: [],
  });

  useEffect(() => {
    Promise.allSettled([
      api.get('/posts?type=destination&limit=120'),
      ...TYPE_ORDER.map((type) => api.get(`/posts?type=${type}&limit=${type === 'destination' || type === 'review' ? 48 : type === 'itinerary' || type === 'experience' ? 16 : 10}`)),
    ])
      .then(([hotPostsRes, ...postResults]) => {
        setRegionalPosts(
          hotPostsRes.status === 'fulfilled'
            ? sortPostsByHotness(hotPostsRes.value.data?.data ?? [])
            : [],
        );
        const grouped = {} as Record<CategoryType, Post[]>;
        TYPE_ORDER.forEach((type, index) => {
          const result = postResults[index];
          grouped[type] = result?.status === 'fulfilled'
            ? sortPostsByHotness(result.value.data?.data ?? [])
            : [];
        });
        setPostsByType(grouped);
      })
      .finally(() => setLoading(false));
  }, []);

  const regionHighlights = useMemo(
    () =>
      REGIONS.map((region) => {
        const slugSet = new Set<string>(region.slugs);
        const posts = regionalPosts
          .filter((post) => post.city?.slug && slugSet.has(post.city.slug))
          .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return { ...region, post: posts[0] };
      }),
    [regionalPosts],
  );

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const getPostHref = (post: Post) => {
    if (post.canonicalUrl) return post.canonicalUrl;
    if (post.category?.type === 'destination' && post.city?.slug) {
      return `/diem-den/${post.city.slug}/${post.category.slug}/${post.slug}`;
    }
    if (post.category?.type === 'itinerary' && post.city?.slug) {
      return `/lich-trinh/${post.city.slug}/${post.slug}`;
    }
    if (post.category?.type === 'experience' && post.city?.slug) {
      return `/kinh-nghiem/${post.city.slug}/${post.slug}`;
    }
    return `/posts/${post.slug}`;
  };

  return (
    <div className="relative isolate min-h-[100dvh] overflow-hidden bg-white text-[#0A2D5B]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(HOME_JSON_LD) }} />
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
      <Navbar logoOnlyUntilScroll />

      <main className="relative z-10">
        <HeroSection />

        <div className="mt-10 md:mt-16">
          <PosterRailSection
            loading={loading}
            posts={regionalPosts.slice(0, 48)}
            copy={SECTION_COPY.destination}
            eyebrow="Các Địa Điểm Hot"
            heading="Điểm Đến Nổi Bật"
            getPostHref={getPostHref}
            formatDate={formatDate}
          />
        </div>

        <TallPosterStripSection
          loading={loading}
          posts={postsByType.itinerary.slice(0, 16)}
          copy={SECTION_COPY.itinerary}
          eyebrow="Lịch trình nổi bật"
          heading="Chuyến đi theo từng nhịp"
          getPostHref={getPostHref}
          formatDate={formatDate}
        />

        <TallPosterStripSection
          loading={loading}
          posts={postsByType.review.slice(0, 12)}
          copy={SECTION_COPY.review}
          eyebrow="Review nổi bật"
          heading="Góc nhìn từ chuyến đi"
          getPostHref={getPostHref}
          formatDate={formatDate}
        />

        {/* Kinh nghiệm — scroll ngang full-width */}
        <section className="px-0 py-3 md:py-4">
          <div className="mx-auto max-w-[1160px] px-4 py-5 md:px-6 md:py-6">
            <SectionHeader {...SECTION_COPY.experience} />
          </div>
          <Reveal>
            {loading ? (
              <div className="flex gap-4 overflow-hidden px-4 md:px-[2.5vw]">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="h-[320px] w-[78vw] shrink-0 animate-pulse bg-[#0A2D5B]/6 sm:w-[320px] lg:w-[300px]" />
                ))}
              </div>
            ) : postsByType.experience.length === 0 ? (
              <div className="mx-auto max-w-[1160px] px-4 md:px-6">
                <EmptyState />
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide md:px-[2.5vw]">
                {postsByType.experience.slice(0, 8).map((post) => (
                  <div key={post.id} className="w-[78vw] shrink-0 sm:w-[320px] lg:w-[300px]">
                    <ArticleCard post={post} href={getPostHref(post)} formatDate={formatDate} compact />
                  </div>
                ))}
              </div>
            )}
          </Reveal>
        </section>
      </main>

    </div>
  );
}

function RegionalJourneySection({
  loading,
  regions,
  getPostHref,
  formatDate,
}: {
  loading: boolean;
  regions: Array<(typeof REGIONS)[number] & { post?: Post }>;
  getPostHref: (post: Post) => string;
  formatDate: (date: string) => string;
}) {
  return (
    <section className="relative px-4 pb-7 pt-12 md:px-6 md:pb-10 md:pt-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 bottom-0 bg-white/52"
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.72) 14%, #000 32%, #000 68%, rgba(0,0,0,0.72) 86%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.72) 14%, #000 32%, #000 68%, rgba(0,0,0,0.72) 86%, transparent 100%)',
        }}
      />
      <div className="relative mx-auto max-w-[1024px]">
        <div className="relative z-10">
          <div className="mb-5 flex flex-col gap-2 pb-5">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#F37021]">Gợi ý theo lượt xem</p>
              <h2 className="mt-2 text-3xl font-extrabold leading-tight text-[#0A2D5B] md:text-5xl">
                Điểm đến nổi bật
              </h2>
            </div>
            <p className="text-base font-semibold leading-7 text-[#0A2D5B]/60">Đến ba miền với ba cách đi.</p>
          </div>

          <Reveal>
            {loading ? (
              <RegionalSkeleton />
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                {regions.map((region, index) => (
                  <RegionalFeaturedCard
                    key={region.key}
                    region={region}
                    index={index}
                    getPostHref={getPostHref}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function RegionalFeaturedCard({
  region,
  index,
  getPostHref,
  formatDate,
}: {
  region: (typeof REGIONS)[number] & { post?: Post };
  index: number;
  getPostHref: (post: Post) => string;
  formatDate: (date: string) => string;
}) {
  const post = region.post;

  if (!post) {
    return (
      <div className="rounded-2xl border border-dashed border-[#0A2D5B]/15 bg-white/70 p-5 text-sm font-semibold text-[#0A2D5B]/45">
        Chưa có bài viết nổi bật cho {region.label.toLowerCase()}.
      </div>
    );
  }

  return (
    <Link
      href={getPostHref(post)}
      className="group flex min-h-full flex-col overflow-hidden bg-white shadow-[0_18px_45px_rgba(10,45,91,0.12)] ring-1 ring-[#0A2D5B]/10 transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[1.38] overflow-hidden bg-[#0A2D5B]/5">
        {post.thumbnail ? (
          <img
            src={post.thumbnail}
            alt={post.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center ${FALLBACK_BG}`}>
            <BookOpen size={28} className="text-white/60" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5 pb-0">
        <div className="mb-5">
          <span className="inline-flex bg-[#ddd6c7] px-2.5 py-1.5 text-xs font-semibold text-[#1d2738]">
            {region.label}
          </span>
        </div>
        <h3
          className="line-clamp-3 text-[1.35rem] leading-[1.12] text-[#071f3d] transition-colors group-hover:text-[#F37021] md:text-[1.5rem]"
          style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}
        >
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-3 line-clamp-2 text-sm font-medium leading-6 text-[#0A2D5B]/58">
            {post.excerpt}
          </p>
        )}
        <div className="mt-4 space-y-2 pb-4 text-sm font-medium text-[#1d2738]/80">
          {post.city?.name && (
            <div className="flex items-center gap-3">
              <MapPin size={18} className="shrink-0 fill-[#071f3d] text-[#071f3d]" />
              <span>{post.city.name}</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <CalendarDays size={18} className="shrink-0 text-[#071f3d]" />
            <span>{formatDate(post.createdAt)}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-[#F37021]">
            <Eye size={16} className="shrink-0" />
            <span className="font-bold">{post.viewCount ?? 0} lượt xem</span>
          </div>
        </div>
      </div>
      <div className="mt-auto px-5 py-3.5 text-center text-xs font-extrabold uppercase tracking-[0.14em] text-[#0A2D5B] transition-colors group-hover:text-[#F37021]">
        Xem bài
      </div>
    </Link>
  );
}

function RegionalSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[...Array(3)].map((_, index) => (
        <div key={index}>
          <div className="aspect-[16/10] animate-pulse rounded-2xl bg-[#0A2D5B]/5" />
          <div className="mt-3 h-4 w-24 animate-pulse rounded bg-[#0A2D5B]/5" />
          <div className="mt-2 h-5 w-5/6 animate-pulse rounded bg-[#0A2D5B]/5" />
        </div>
      ))}
    </div>
  );
}

function Section({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <section className="px-4 py-3 md:px-6 md:py-4">
      <div className={`mx-auto px-0 py-5 md:py-6 ${wide ? 'max-w-[1160px]' : 'max-w-[1024px]'}`}>
        {children}
      </div>
    </section>
  );
}

function TallPosterStripSection({
  loading,
  posts,
  copy,
  eyebrow,
  heading,
  getPostHref,
  formatDate,
}: {
  loading: boolean;
  posts: Post[];
  copy: { href: string; title: ReactNode; subtitle: ReactNode; cta: ReactNode };
  eyebrow: string;
  heading: ReactNode;
  getPostHref: (post: Post) => string;
  formatDate: (date: string) => string;
}) {
  const railRef = useRef<HTMLDivElement>(null);

  const scrollRail = (direction: 'prev' | 'next') => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({
      left: direction === 'next' ? rail.clientWidth * 0.82 : -rail.clientWidth * 0.82,
      behavior: 'smooth',
    });
  };

  return (
    <section className="relative overflow-hidden py-12 md:py-20">
      <div className="mx-auto mb-8 max-w-[1160px] px-4 md:px-6">
        <div className="flex items-end justify-between gap-5 pb-5">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#F37021]">{eyebrow}</p>
            <h2 className="mt-2 text-3xl font-extrabold leading-tight text-[#0A2D5B] md:text-5xl">{heading}</h2>
          </div>
          <Link
            href={copy.href}
            className="hidden shrink-0 items-center gap-2 text-sm font-extrabold uppercase tracking-[0.12em] text-[#0A2D5B] transition-colors hover:text-[#F37021] md:inline-flex"
          >
            {copy.cta}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>

      <Reveal>
        {loading ? (
          <div className="flex gap-4 overflow-hidden px-4 md:gap-5 md:px-[2.5vw]">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-[390px] w-[76vw] shrink-0 animate-pulse bg-[#0A2D5B]/6 sm:w-[310px] md:h-[430px] md:w-[360px]" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="mx-auto max-w-[1160px] px-4 md:px-6">
            <EmptyState />
          </div>
        ) : (
          <div className="relative">
            <div
              ref={railRef}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide md:gap-5 md:px-[2.5vw]"
            >
              {posts.map((post) => (
                <TallPosterCard key={post.id} post={post} href={getPostHref(post)} formatDate={formatDate} />
              ))}
            </div>
            <button
              type="button"
              aria-label="Trước"
              onClick={() => scrollRail('prev')}
              className="absolute left-4 top-1/2 hidden h-14 w-14 -translate-y-1/2 items-center justify-center bg-white text-[#0A2D5B] shadow-[0_12px_30px_rgba(10,45,91,0.16)] transition-colors hover:text-[#F37021] md:flex"
            >
              <ChevronLeft size={30} strokeWidth={2.2} />
            </button>
            <button
              type="button"
              aria-label="Tiếp"
              onClick={() => scrollRail('next')}
              className="absolute right-4 top-1/2 hidden h-14 w-14 -translate-y-1/2 items-center justify-center bg-white text-[#0A2D5B] shadow-[0_12px_30px_rgba(10,45,91,0.16)] transition-colors hover:text-[#F37021] md:flex"
            >
              <ChevronRight size={30} strokeWidth={2.2} />
            </button>
          </div>
        )}
      </Reveal>
    </section>
  );
}

function PosterRailSection({
  loading,
  posts,
  copy,
  eyebrow,
  heading,
  getPostHref,
  formatDate,
}: {
  loading: boolean;
  posts: Post[];
  copy: { href: string; title: ReactNode; subtitle: ReactNode; cta: ReactNode };
  eyebrow: string;
  heading: ReactNode;
  getPostHref: (post: Post) => string;
  formatDate: (date: string) => string;
}) {
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canAutoScroll = posts.length > 4 && !reduceMotion;
  const mosaicGroups = buildMosaicGroups(posts);
  const filmGroups = canAutoScroll ? [...mosaicGroups, ...mosaicGroups] : mosaicGroups;
  const duration = `${Math.max(96, mosaicGroups.length * 22)}s`;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(
    () => () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    },
    [],
  );

  const pauseUntilIdle = () => {
    if (!canAutoScroll) return;
    setPaused(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => setPaused(false), 4200);
  };

  const pause = () => {
    if (!canAutoScroll) return;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    setPaused(true);
  };

  const resume = () => {
    if (!canAutoScroll) return;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    setPaused(false);
  };

  return (
    <section className="relative py-12 md:py-20">
      <div className="mx-auto mb-8 max-w-[1160px] px-4 md:px-6">
        <div className="flex items-end justify-between gap-5 pb-5">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#F37021]">{eyebrow}</p>
            <h2 className="mt-2 text-3xl font-extrabold leading-tight text-[#0A2D5B] md:text-5xl">{heading}</h2>
          </div>
          <Link
            href={copy.href}
            className="hidden shrink-0 items-center gap-2 text-sm font-extrabold uppercase tracking-[0.12em] text-[#0A2D5B] transition-colors hover:text-[#F37021] md:inline-flex"
          >
            {copy.cta}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
      <Reveal>
        {loading ? (
          <div className="mx-auto grid max-w-[1160px] grid-cols-1 gap-4 px-4 sm:grid-cols-2 md:px-6 lg:grid-cols-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="h-[360px] animate-pulse bg-[#0A2D5B]/6" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="mx-auto max-w-[1160px] px-4 md:px-6">
            <EmptyState />
          </div>
        ) : (
          <div
            className="relative overflow-hidden"
            onFocus={pause}
            onBlur={resume}
            onWheel={pauseUntilIdle}
            onTouchStart={pauseUntilIdle}
          >
            <div
              className={`film-track flex w-max gap-5 px-4 md:px-[2.5vw] ${paused || !canAutoScroll ? 'film-track-paused' : ''}`}
              style={{ animationDuration: duration }}
            >
              {filmGroups.map((group, groupIndex) => (
                <div
                  key={`group-${groupIndex}`}
                  className="flex shrink-0 gap-3 md:gap-4 lg:grid lg:w-[860px] lg:grid-cols-4 lg:auto-rows-[128px]"
                >
                  {group.map((post, index) => (
                    <PosterOverlayCard
                      key={`${post.id}-${groupIndex}-${index}`}
                      post={post}
                      href={getPostHref(post)}
                      formatDate={formatDate}
                      className={getFilmBrickClass(index)}
                      size={getFilmBrickSize(index)}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent" />
            <style jsx global>{`
              @keyframes blogdulich-film-scroll {
                from {
                  transform: translate3d(0, 0, 0);
                }
                to {
                  transform: translate3d(-50%, 0, 0);
                }
              }

              .film-track {
                animation-name: blogdulich-film-scroll;
                animation-timing-function: linear;
                animation-iteration-count: infinite;
                will-change: transform;
              }

              .film-track-paused {
                animation-play-state: paused;
              }

              @media (prefers-reduced-motion: reduce) {
                .film-track {
                  animation: none;
                  transform: none;
                }
              }
            `}</style>
          </div>
        )}
      </Reveal>
    </section>
  );
}

function buildMosaicGroups(posts: Post[]) {
  if (posts.length === 0) return [];
  const groupSize = 6;
  if (posts.length <= groupSize) {
    return [Array.from({ length: groupSize }, (_, index) => posts[index % posts.length])];
  }

  const groups: Post[][] = [];
  for (let index = 0; index < posts.length; index += groupSize) {
    const group = posts.slice(index, index + groupSize);
    if (group.length < groupSize) {
      groups.push([...group, ...posts.slice(0, groupSize - group.length)]);
    } else {
      groups.push(group);
    }
  }

  return groups;
}

function getFilmBrickClass(index: number) {
  const pattern = [
    'h-[260px] w-[78vw] sm:w-[320px] lg:h-auto lg:w-auto lg:col-span-2 lg:row-span-2',
    'h-[260px] w-[78vw] sm:w-[320px] lg:h-auto lg:w-auto lg:col-span-2 lg:row-span-1',
    'h-[260px] w-[78vw] sm:w-[320px] lg:h-auto lg:w-auto lg:col-span-1 lg:row-span-1',
    'h-[260px] w-[78vw] sm:w-[320px] lg:h-auto lg:w-auto lg:col-span-1 lg:row-span-1',
    'h-[260px] w-[78vw] sm:w-[320px] lg:h-auto lg:w-auto lg:col-span-2 lg:row-span-1',
    'h-[260px] w-[78vw] sm:w-[320px] lg:h-auto lg:w-auto lg:col-span-2 lg:row-span-1',
  ];

  return pattern[index % pattern.length];
}

function getFilmBrickSize(index: number): 'sm' | 'lg' {
  return index % 6 === 0 ? 'lg' : 'sm';
}

function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="reveal" data-shown={shown}>
      {children}
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  href,
  cta,
}: {
  title: ReactNode;
  subtitle: ReactNode;
  href: string;
  cta: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-3xl font-extrabold leading-tight text-[#0A2D5B] md:text-4xl">{title}</h2>
        <p className="mt-2 max-w-[620px] text-base leading-7 text-[#0A2D5B]/60">{subtitle}</p>
      </div>
      <Link
        href={href}
        className="group inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-[#0A2D5B] px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#0A2D5B]/90"
      >
        {cta}
        <ArrowUpRight size={16} className="text-[#F37021] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

const FALLBACK_BG = 'bg-gradient-to-br from-[#0A2D5B] to-[#F37021]';

// Category as a traditional seal/stamp (con dấu), placed like a postage stamp on the photo.
function Seal({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`relative inline-flex items-center rounded-[6px] bg-[#F37021] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white shadow-[0_2px_10px_rgba(0,0,0,0.28)] ring-1 ring-inset ring-white/45 before:pointer-events-none before:absolute before:inset-[3px] before:rounded-[3px] before:border before:border-white/30 before:content-[''] ${className}`}
    >
      {children}
    </span>
  );
}

function CardMeta({ post, formatDate, size = 'sm' }: { post: Post; formatDate: (d: string) => string; size?: 'sm' | 'lg' }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold uppercase tracking-[0.08em] text-[#0A2D5B]/45 ${
        size === 'lg' ? 'text-xs' : 'text-[11px]'
      }`}
    >
      {post.city?.name && (
        <span className="inline-flex items-center gap-1">
          <MapPin size={size === 'lg' ? 12 : 11} /> {post.city.name}
        </span>
      )}
      {post.city?.name && <span className="text-[#0A2D5B]/20">·</span>}
      <span>{formatDate(post.createdAt)}</span>
    </div>
  );
}

// Editorial card: clean mounted photo on top, content on paper below.
function ArticleCard({
  post,
  href,
  formatDate,
  compact = false,
}: {
  post: Post;
  href: string;
  formatDate: (d: string) => string;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-full flex-col overflow-hidden bg-white shadow-[0_18px_45px_rgba(10,45,91,0.12)] ring-1 ring-[#0A2D5B]/10 transition-transform duration-300 hover:-translate-y-1"
    >
      <div className={`relative overflow-hidden bg-[#0A2D5B]/5 ${compact ? 'aspect-[3/2]' : 'aspect-[4/3]'}`}>
        {post.thumbnail ? (
          <img
            src={post.thumbnail}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center ${FALLBACK_BG}`}>
            <BookOpen size={30} className="text-white/55" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5 pb-0">
        <div className={compact ? 'mb-3' : 'mb-5'}>
          <span className={`inline-flex bg-[#ddd6c7] font-semibold text-[#1d2738] ${compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm'}`}>
            {post.category?.name || 'Bài viết'}
          </span>
        </div>
        <h3
          className={`text-[#071f3d] transition-colors group-hover:text-[#F37021] ${
            compact
              ? 'line-clamp-2 text-[1.08rem] leading-[1.16] md:text-[1.16rem]'
              : 'line-clamp-3 text-[1.45rem] leading-[1.12] md:text-[1.6rem]'
          }`}
          style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}
        >
          {post.title}
        </h3>
        {!compact && post.excerpt && <p className="mt-3 line-clamp-2 text-sm font-medium leading-6 text-[#0A2D5B]/58">{post.excerpt}</p>}
        <div className={`${compact ? 'mt-3 space-y-1.5 pb-4 text-xs' : 'mt-5 space-y-2.5 pb-5 text-sm'} font-medium text-[#1d2738]/80`}>
          {post.city?.name && (
            <div className="flex items-center gap-3">
              <MapPin size={compact ? 15 : 18} className="shrink-0 fill-[#071f3d] text-[#071f3d]" />
              <span>{post.city.name}</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <CalendarDays size={compact ? 15 : 18} className="shrink-0 text-[#071f3d]" />
            <span>{formatDate(post.createdAt)}</span>
          </div>
        </div>
      </div>
      <div className={`mt-auto px-5 text-center text-xs font-extrabold uppercase tracking-[0.14em] text-[#0A2D5B] transition-colors group-hover:text-[#F37021] ${compact ? 'py-3' : 'py-3.5'}`}>
        Xem bài
      </div>
    </Link>
  );
}

function TallPosterCard({ post, href, formatDate }: { post: Post; href: string; formatDate: (d: string) => string }) {
  return (
    <Link
      href={href}
      className="group relative block h-[390px] w-[76vw] shrink-0 snap-start overflow-hidden bg-[#0A2D5B] shadow-[0_18px_38px_rgba(10,45,91,0.13)] sm:w-[310px] md:h-[430px] md:w-[360px] lg:h-[460px] lg:w-[370px]"
    >
      {post.thumbnail ? (
        <img
          src={post.thumbnail}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className={`absolute inset-0 flex items-center justify-center ${FALLBACK_BG}`}>
          <BookOpen size={30} className="text-white/60" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-[8px] font-extrabold uppercase tracking-[0.14em] text-white/65 md:text-[9px]">
          {post.city?.name && <span>{post.city.name}</span>}
          <span>{formatDate(post.createdAt)}</span>
        </div>
        <h3
          className="line-clamp-2 text-[1.25rem] leading-[1.08] text-white md:text-[1.42rem]"
          style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}
        >
          {post.title}
        </h3>
      </div>
    </Link>
  );
}

function PosterOverlayCard({
  post,
  href,
  formatDate,
  className = '',
  size = 'sm',
}: {
  post: Post;
  href: string;
  formatDate: (d: string) => string;
  className?: string;
  size?: 'sm' | 'lg';
}) {
  return (
    <Link
      href={href}
      className={`group relative block overflow-hidden bg-[#0A2D5B] shadow-[0_18px_38px_rgba(10,45,91,0.13)] ${className}`}
    >
      {post.thumbnail ? (
        <img
          src={post.thumbnail}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className={`absolute inset-0 flex items-center justify-center ${FALLBACK_BG}`}>
          <BookOpen size={30} className="text-white/60" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-3.5 md:p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-[8px] font-extrabold uppercase tracking-[0.14em] text-white/65 md:text-[9px]">
          {post.city?.name && <span>{post.city.name}</span>}
          <span>{formatDate(post.createdAt)}</span>
        </div>
        <h3
          className={`line-clamp-3 leading-[1.08] text-white ${
            size === 'lg' ? 'text-[1.45rem] md:text-[1.72rem]' : 'text-[1.02rem] md:text-[1.16rem]'
          }`}
          style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}
        >
          {post.title}
        </h3>
      </div>
    </Link>
  );
}

function ReviewIndexCard({ post, href, formatDate }: { post: Post; href: string; formatDate: (d: string) => string }) {
  return (
    <Link href={href} className="group grid min-h-full overflow-hidden bg-white shadow-[0_14px_36px_rgba(10,45,91,0.10)] ring-1 ring-[#0A2D5B]/10 md:grid-cols-[0.92fr_1fr]">
      <div className="relative min-h-[210px] bg-[#0A2D5B]/5">
        {post.thumbnail ? (
          <img src={post.thumbnail} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className={`absolute inset-0 flex items-center justify-center ${FALLBACK_BG}`}>
            <BookOpen size={28} className="text-white/60" />
          </div>
        )}
      </div>
      <div className="flex flex-col p-5">
        <span className="mb-4 w-fit bg-[#ddd6c7] px-3 py-1.5 text-xs font-semibold text-[#1d2738]">
          {post.category?.name || 'Review'}
        </span>
        <h3
          className="line-clamp-4 text-2xl leading-[1.12] text-[#071f3d] transition-colors group-hover:text-[#F37021]"
          style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}
        >
          {post.title}
        </h3>
        <div className="mt-auto space-y-2 pt-5 text-sm font-medium text-[#1d2738]/72">
          {post.city?.name && (
            <p className="flex items-center gap-2">
              <MapPin size={15} className="shrink-0 fill-[#071f3d] text-[#071f3d]" />
              {post.city.name}
            </p>
          )}
          <p className="flex items-center gap-2">
            <CalendarDays size={15} className="shrink-0 text-[#071f3d]" />
            {formatDate(post.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
}

function ExperienceNumberedList({
  posts,
  getPostHref,
  formatDate,
}: {
  posts: Post[];
  getPostHref: (post: Post) => string;
  formatDate: (date: string) => string;
}) {
  return (
    <ol>
      {posts.map((post, index) => (
        <li key={post.id}>
          <Link href={getPostHref(post)} className="group grid gap-4 py-4 md:grid-cols-[64px_140px_1fr_auto] md:items-center">
            <span className="text-3xl font-extrabold tabular-nums text-[#F37021]/80">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#0A2D5B]/5">
              {post.thumbnail ? (
                <img src={post.thumbnail} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <BookOpen size={24} className="text-[#0A2D5B]/25" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="mb-1.5 flex flex-wrap items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#0A2D5B]/42">
                <span>{post.category?.name || 'Kinh nghiệm'}</span>
                <span>{formatDate(post.createdAt)}</span>
              </div>
              <h3 className="line-clamp-2 text-xl font-extrabold leading-snug text-[#0A2D5B] transition-colors group-hover:text-[#F37021]">
                {post.title}
              </h3>
            </div>
            <ArrowUpRight size={18} className="hidden shrink-0 text-[#0A2D5B]/30 transition-colors group-hover:text-[#F37021] md:block" />
          </Link>
        </li>
      ))}
    </ol>
  );
}

function ExperienceList({
  posts,
  getPostHref,
  formatDate,
}: {
  posts: Post[];
  getPostHref: (post: Post) => string;
  formatDate: (date: string) => string;
}) {
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>
          <Link href={getPostHref(post)} className="group grid grid-cols-[88px_1fr] items-center gap-4 py-5 md:grid-cols-[160px_1fr_auto] md:gap-6">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#0A2D5B]/5">
              {post.thumbnail ? (
                <img src={post.thumbnail} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <BookOpen size={28} className="text-[#0A2D5B]/25" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-3 text-xs">
                <span className="relative inline-flex items-center rounded-[5px] border border-[#F37021]/45 bg-[#F37021]/[0.07] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#F37021] ring-1 ring-inset ring-[#F37021]/15">
                  {post.category?.name || 'Kinh nghiệm'}
                </span>
                <span className="text-[#0A2D5B]/45">{formatDate(post.createdAt)}</span>
              </div>
              <h3 className="line-clamp-2 text-lg font-extrabold leading-snug text-[#0A2D5B] transition-colors group-hover:text-[#F37021] md:text-xl">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="mt-1.5 line-clamp-1 text-sm leading-6 text-[#0A2D5B]/55 md:line-clamp-2">{post.excerpt}</p>
              )}
            </div>
            <ArrowUpRight size={18} className="hidden shrink-0 self-center text-[#0A2D5B]/30 transition-colors group-hover:text-[#F37021] md:block" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function GridSkeleton({ count = 3, cols = 'md:grid-cols-3' }: { count?: number; cols?: string }) {
  return (
    <div className={`grid gap-x-6 gap-y-9 ${cols}`}>
      {[...Array(count)].map((_, i) => (
        <div key={i}>
          <div className="aspect-[3/2] animate-pulse rounded-2xl bg-[#0A2D5B]/5" />
          <div className="mt-4 h-3 w-24 animate-pulse rounded bg-[#0A2D5B]/5" />
          <div className="mt-2 h-5 w-5/6 animate-pulse rounded bg-[#0A2D5B]/5" />
        </div>
      ))}
    </div>
  );
}

function RailSkeleton() {
  return (
    <div className="flex gap-6 overflow-hidden">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="w-[280px] shrink-0 md:w-[320px]">
          <div className="aspect-[3/2] animate-pulse rounded-2xl bg-[#0A2D5B]/5" />
          <div className="mt-4 h-5 w-5/6 animate-pulse rounded bg-[#0A2D5B]/5" />
        </div>
      ))}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div>
      {[...Array(4)].map((_, index) => (
        <div key={index} className="grid grid-cols-[88px_1fr] items-center gap-4 py-5 md:grid-cols-[160px_1fr] md:gap-6">
          <div className="aspect-[4/3] animate-pulse rounded-2xl bg-[#0A2D5B]/5" />
          <div className="space-y-2">
            <div className="h-3 w-24 animate-pulse rounded bg-[#0A2D5B]/5" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-[#0A2D5B]/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[24px] border border-dashed border-[#0A2D5B]/15 bg-white p-10 text-center text-[#0A2D5B]/55">
      Chưa có bài viết để hiển thị.
    </div>
  );
}
