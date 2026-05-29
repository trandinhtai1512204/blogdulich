'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, Clock, Mail, MapPin, Phone, Star } from 'lucide-react';
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
  category?: { id: string; name: string; slug: string };
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
    href: '/lich-trinh-du-lich',
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

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [postsByType, setPostsByType] = useState<Record<CategoryType, Post[]>>({
    destination: [],
    itinerary: [],
    review: [],
    experience: [],
  });

  useEffect(() => {
    Promise.all([
      ...TYPE_ORDER.map((type) => api.get(`/posts?type=${type}&limit=10`)),
    ])
      .then((postResults) => {
        const grouped = {} as Record<CategoryType, Post[]>;
        TYPE_ORDER.forEach((type, index) => {
          grouped[type] = postResults[index].data?.data ?? [];
        });
        setPostsByType(grouped);
      })
      .finally(() => setLoading(false));
  }, []);

  const latestPosts = useMemo(() => {
    const seen = new Set<string>();
    return Object.values(postsByType)
      .flat()
      .filter((post) => {
        if (seen.has(post.id)) return false;
        seen.add(post.id);
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }, [postsByType]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const getPostHref = (post: Post) =>
    post.canonicalUrl ?? (post.category?.slug ? `/${post.category.slug}/${post.slug}` : `/posts/${post.slug}`);

  return (
    <div className="min-h-screen bg-white text-gray-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(HOME_JSON_LD) }} />
      <Navbar />

      <main>
        <HeroSection />

        <section className="px-4 pb-16 pt-10 md:px-6 md:pb-20 md:pt-14">
          <div className="mx-auto max-w-[1224px]">
            <SectionHeader
              title={<>Mới từ cộng đồng</>}
              subtitle={<>Ba bài viết gần nhất để thử layout editorial trên trang chủ.</>}
              href="/posts"
              cta={<>Xem thêm bài viết</>}
            />

            {loading ? (
              <FeaturedSkeleton />
            ) : latestPosts.length > 0 ? (
              <FeaturedLayout posts={latestPosts} getPostHref={getPostHref} formatDate={formatDate} />
            ) : (
              <EmptyState />
            )}
          </div>
        </section>

        <PostSection
          type="destination"
          posts={postsByType.destination.slice(0, 3)}
          loading={loading}
          getPostHref={getPostHref}
          formatDate={formatDate}
        />

        <PostSection
          type="itinerary"
          posts={postsByType.itinerary.slice(0, 3)}
          loading={loading}
          getPostHref={getPostHref}
          formatDate={formatDate}
          variant="itinerary"
        />

        <ReviewSection
          posts={postsByType.review.slice(0, 3)}
          loading={loading}
          getPostHref={getPostHref}
          formatDate={formatDate}
        />

        <PostSection
          type="experience"
          posts={postsByType.experience.slice(0, 3)}
          loading={loading}
          getPostHref={getPostHref}
          formatDate={formatDate}
          variant="feature"
        />
      </main>

      <Footer />
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
    <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-3xl font-extrabold leading-tight text-gray-950 md:text-4xl">{title}</h2>
        <p className="mt-3 max-w-[620px] text-base leading-7 text-gray-500">{subtitle}</p>
      </div>
      <Link
        href={href}
        className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-violet-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-violet-700"
      >
        {cta} <ArrowUpRight size={16} />
      </Link>
    </div>
  );
}

function FeaturedLayout({
  posts,
  getPostHref,
  formatDate,
}: {
  posts: Post[];
  getPostHref: (post: Post) => string;
  formatDate: (date: string) => string;
}) {
  const main = posts[0];
  const sidePosts = posts.slice(1, 3);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start">
      <LargePostCard post={main} href={getPostHref(main)} formatDate={formatDate} />
      <div className="space-y-6">
        {sidePosts.map((post) => (
          <CompactPostCard key={post.id} post={post} href={getPostHref(post)} formatDate={formatDate} />
        ))}
      </div>
    </div>
  );
}

function PostSection({
  type,
  posts,
  loading,
  getPostHref,
  formatDate,
  variant = 'grid',
}: {
  type: CategoryType;
  posts: Post[];
  loading: boolean;
  getPostHref: (post: Post) => string;
  formatDate: (date: string) => string;
  variant?: 'grid' | 'itinerary' | 'feature';
}) {
  const copy = SECTION_COPY[type];
  const bgMap: Record<CategoryType, string> = {
    destination: 'bg-white',
    itinerary: 'bg-slate-50',
    review: 'bg-white',
    experience: 'bg-violet-50/40',
  };

  return (
    <section className={`px-4 py-14 md:px-6 md:py-16 ${bgMap[type]}`}>
      <div className="mx-auto max-w-[1224px]">
        <SectionHeader title={copy.title} subtitle={copy.subtitle} href={copy.href} cta={copy.cta} />

        {loading ? (
          <CardGridSkeleton />
        ) : posts.length === 0 ? (
          <EmptyState />
        ) : variant === 'feature' ? (
          <FeaturedLayout posts={posts} getPostHref={getPostHref} formatDate={formatDate} />
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                href={getPostHref(post)}
                formatDate={formatDate}
                variant={variant}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ReviewSection({
  posts,
  loading,
  getPostHref,
  formatDate,
}: {
  posts: Post[];
  loading: boolean;
  getPostHref: (post: Post) => string;
  formatDate: (date: string) => string;
}) {
  const copy = SECTION_COPY.review;

  return (
    <section className="bg-slate-50 px-4 py-14 md:px-6 md:py-16">
      <div className="mx-auto max-w-[1224px]">
        <SectionHeader title={copy.title} subtitle={copy.subtitle} href={copy.href} cta={copy.cta} />

        {loading ? (
          <CardGridSkeleton />
        ) : posts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {posts.map((post, index) => (
              <Link
                key={post.id}
                href={getPostHref(post)}
                className="group relative block overflow-hidden rounded-[32px] aspect-[4/5]"
              >
                {post.thumbnail ? (
                  <img src={post.thumbnail} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-violet-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1.5 text-xs font-bold text-amber-900">
                    <Star size={11} fill="currentColor" /> 5.0
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="mb-3 flex items-center gap-2.5">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-extrabold text-white">
                      {post.city?.name?.slice(0, 2).toUpperCase() || `R${index + 1}`}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{post.city?.name || post.category?.name || 'Việt Nam'}</p>
                      <p className="text-xs text-white/55">{formatDate(post.createdAt)}</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-extrabold leading-snug text-white line-clamp-2">{post.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function LargePostCard({
  post,
  href,
}: {
  post: Post;
  href: string;
  formatDate: (date: string) => string;
}) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-[32px] h-[420px] md:h-[500px]"
    >
      {post.thumbnail ? (
        <img src={post.thumbnail} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="eager" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-violet-900" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-7 md:p-8">
        <span className="inline-block rounded-full bg-violet-500/80 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white backdrop-blur-sm mb-3">
          {post.category?.name || 'Blogdulich'}
        </span>
        <h3 className="text-2xl font-extrabold leading-tight text-white md:text-3xl">{post.title}</h3>
        {post.excerpt && <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/70">{post.excerpt}</p>}
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white/90">
          Đọc bài <ArrowUpRight size={14} />
        </span>
      </div>
    </Link>
  );
}

function CompactPostCard({
  post,
  href,
}: {
  post: Post;
  href: string;
  formatDate: (date: string) => string;
}) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-[28px] h-[210px]"
    >
      {post.thumbnail ? (
        <img src={post.thumbnail} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-violet-900" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <p className="text-xs font-semibold text-white/60 mb-1">{post.category?.name || 'Blogdulich'}</p>
        <h3 className="text-base font-bold leading-snug text-white line-clamp-2">{post.title}</h3>
        {post.city && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-white/60">
            <MapPin size={11} /> {post.city.name}
          </p>
        )}
      </div>
    </Link>
  );
}

function PostCard({
  post,
  href,
  variant,
}: {
  post: Post;
  href: string;
  formatDate: (date: string) => string;
  variant: 'grid' | 'itinerary';
}) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-[32px] aspect-[3/4]"
    >
      {post.thumbnail ? (
        <img src={post.thumbnail} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-violet-900" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

      {variant === 'itinerary' && (
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            <Clock size={11} /> Lịch trình gợi ý
          </span>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-6">
        <span className="inline-block rounded-full bg-violet-500/80 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white backdrop-blur-sm mb-3">
          {post.category?.name || 'Blogdulich'}
        </span>
        <h3 className="text-xl font-extrabold leading-snug text-white line-clamp-2">{post.title}</h3>
        {post.city && (
          <p className="mt-2 flex items-center gap-1 text-sm text-white/65">
            <MapPin size={12} /> {post.city.name}
          </p>
        )}
      </div>
    </Link>
  );
}

function ImageBlock({ post, heightClass }: { post: Post; heightClass: string }) {
  return (
    <div className={`${heightClass} relative overflow-hidden bg-gray-100`}>
      {post.thumbnail ? (
        <img
          src={post.thumbnail}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <BookOpen size={36} className="text-gray-300" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
    </div>
  );
}

function MetaRow({
  post,
  formatDate,
  compact = false,
}: {
  post: Post;
  formatDate: (date: string) => string;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${compact ? 'text-xs' : 'text-sm'}`}>
      <span className="rounded-full bg-violet-100 px-3 py-1 font-bold uppercase text-violet-700">
        {post.category?.name || 'Blogdulich'}
      </span>
      <span className="text-gray-400">{formatDate(post.createdAt)}</span>
    </div>
  );
}

function FeaturedSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="h-[520px] animate-pulse rounded-[32px] border border-gray-200 bg-gray-100" />
      <div className="space-y-6">
        <div className="h-[150px] animate-pulse rounded-[32px] border border-gray-200 bg-gray-100" />
        <div className="h-[150px] animate-pulse rounded-[32px] border border-gray-200 bg-gray-100" />
      </div>
    </div>
  );
}

function CardGridSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="h-[430px] animate-pulse rounded-[32px] border border-gray-200 bg-gray-100" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[32px] border border-dashed border-gray-200 bg-white p-10 text-center text-gray-500">
      Chưa có bài viết để hiển thị.
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-10 border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-[1160px] px-4 py-10 md:px-6 md:py-12">
        <div className="grid gap-9 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="flex size-9 items-center justify-center rounded-full bg-linear-to-br from-sky-500 to-blue-700 shadow-md">
                <span style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: 700, color: 'white', fontStyle: 'italic', lineHeight: 1 }}>B</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-950">blogdulich</span>
            </Link>
            <p className="mt-4 max-w-[300px] text-sm leading-6 text-gray-600">
              Cẩm nang du lịch Việt Nam với điểm đến, lịch trình, review và kinh nghiệm thực tế cho từng chuyến đi.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['Việt Nam', 'Review thật', 'Lịch trình gọn'].map((item) => (
                <span key={item} className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-bold text-gray-950">Chuyên mục</p>
            <ul className="space-y-2.5">
              {[
                ['Điểm đến', '/diem-den'],
                ['Lịch trình', '/lich-trinh-du-lich'],
                ['Review', '/review'],
                ['Kinh nghiệm', '/kinh-nghiem'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="inline-flex items-center gap-1 text-sm text-gray-600 transition-colors hover:text-sky-700">
                    {label}
                    <ArrowUpRight size={13} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-bold text-gray-950">Khám phá</p>
            <ul className="space-y-2.5">
              {['Bài mới nhất', 'Cẩm nang theo mùa', 'Gợi ý cuối tuần', 'Địa điểm nổi bật'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-600 transition-colors hover:text-sky-700">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-bold text-gray-950">Liên hệ</p>
            <div className="space-y-3 text-sm text-gray-600">
              <p className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-sky-700" />
                Việt Nam
              </p>
              <a href="mailto:hello@blogdulich.vn" className="flex items-center gap-2 transition-colors hover:text-sky-700">
                <Mail size={16} className="shrink-0 text-sky-700" />
                hello@blogdulich.vn
              </a>
              <a href="tel:+84000000000" className="flex items-center gap-2 transition-colors hover:text-sky-700">
                <Phone size={16} className="shrink-0 text-sky-700" />
                +84 000 000 000
              </a>
            </div>
          </div>
        </div>

        <div className="mt-9 flex flex-col gap-3 border-t border-gray-200 pt-5 text-xs text-gray-500 md:flex-row md:items-center md:justify-between">
          <p>© 2026 BlogDuLich.vn. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="transition-colors hover:text-gray-900">Chính sách bảo mật</a>
            <a href="#" className="transition-colors hover:text-gray-900">Điều khoản</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
