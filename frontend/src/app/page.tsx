'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
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
    api.get('/posts/home')
      .then((res) => {
        const data = res.data ?? {};
        const grouped = {
          destination: sortPostsByHotness(data.destination ?? []),
          itinerary: sortPostsByHotness(data.itinerary ?? []),
          review: sortPostsByHotness(data.review ?? []),
          experience: sortPostsByHotness(data.experience ?? []),
        } satisfies Record<CategoryType, Post[]>;

        setRegionalPosts(grouped.destination);
        setPostsByType(grouped);
      })
      .catch(() => {
        setRegionalPosts([]);
        setPostsByType({ destination: [], itinerary: [], review: [], experience: [] });
      })
      .finally(() => setLoading(false));
  }, []);

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
    <div className="relative isolate min-h-[100dvh] overflow-hidden bg-[#F6F3EE] text-[#0A2D5B]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(HOME_JSON_LD) }} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[url('/blogdulich-bg-linework-1440.png')] bg-[length:100%_auto] bg-top bg-repeat-y opacity-[0.34]"
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

        <TallPosterStripSection
          loading={loading}
          posts={postsByType.experience.slice(0, 16)}
          copy={SECTION_COPY.experience}
          eyebrow="Kinh nghiệm nổi bật"
          heading="Mẹo hay trước mỗi chuyến đi"
          getPostHref={getPostHref}
          formatDate={formatDate}
        />
      </main>

    </div>
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
  const mosaicGroups = buildMosaicGroups(posts);

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
          <div className="relative overflow-hidden">
            <div
              className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 scrollbar-hide md:px-[2.5vw]"
            >
              {mosaicGroups.map((group, groupIndex) => (
                <div
                  key={`group-${groupIndex}`}
                  className="flex shrink-0 snap-start gap-3 md:gap-4 lg:grid lg:w-[860px] lg:grid-cols-4 lg:auto-rows-[128px]"
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
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#F6F3EE] to-transparent" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#F6F3EE] to-transparent" />
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
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

const FALLBACK_BG = 'bg-gradient-to-br from-[#0A2D5B] to-[#F37021]';
const PAPER_CARD =
  'bg-white shadow-none transition-transform duration-300 hover:-translate-y-0.5';
const WARM_IMAGE_OVERLAY = 'pointer-events-none absolute inset-0 bg-[#F37021]/[0.07] mix-blend-soft-light';

function TallPosterCard({ post, href, formatDate }: { post: Post; href: string; formatDate: (d: string) => string }) {
  return (
    <Link
      href={href}
      className={`group relative block h-[390px] w-[76vw] shrink-0 snap-start overflow-hidden sm:w-[310px] md:h-[430px] md:w-[360px] lg:h-[460px] lg:w-[370px] ${PAPER_CARD}`}
    >
      <div className="relative h-full overflow-hidden bg-[#0A2D5B]">
        {post.thumbnail ? (
          <>
            <img
              src={post.thumbnail}
              alt={post.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className={WARM_IMAGE_OVERLAY} />
          </>
        ) : (
          <div className={`absolute inset-0 flex items-center justify-center ${FALLBACK_BG}`}>
            <BookOpen size={30} className="text-white/60" />
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#061B34]/92 via-[#061B34]/18 to-transparent" />
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
      className={`group relative block overflow-hidden ${PAPER_CARD} ${className}`}
    >
      <div className="relative h-full overflow-hidden bg-[#0A2D5B]">
        {post.thumbnail ? (
          <>
            <img
              src={post.thumbnail}
              alt={post.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className={WARM_IMAGE_OVERLAY} />
          </>
        ) : (
          <div className={`absolute inset-0 flex items-center justify-center ${FALLBACK_BG}`}>
            <BookOpen size={30} className="text-white/60" />
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#061B34]/92 via-[#061B34]/18 to-transparent" />
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

function EmptyState() {
  return (
    <div className="rounded-[24px] border border-dashed border-[#0A2D5B]/15 bg-white p-10 text-center text-[#0A2D5B]/55">
      Chưa có bài viết để hiển thị.
    </div>
  );
}
