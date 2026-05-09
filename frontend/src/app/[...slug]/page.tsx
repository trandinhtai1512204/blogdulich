'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpRight, Clock, BookOpen, MapPin, ChevronRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { PostLocationMap } from '@/components/PostLocationMap';
import api from '@/lib/axios';

const CITY_IMAGES: Record<string, string> = {
  'ha-noi': 'https://images.unsplash.com/photo-1601108644994-1e450e786d3d?w=1200&q=80',
  'sai-gon': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&q=80',
  'hoi-an': 'https://images.unsplash.com/photo-1660562925534-3f6948ac654f?w=1200&q=80',
  'da-nang': 'https://images.unsplash.com/photo-1696993545232-2b2717676c40?w=1200&q=80',
  'nha-trang': 'https://images.unsplash.com/photo-1508009603885-50cf7c8dd0d5?w=1200&q=80',
  'phu-quoc': 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=1200&q=80',
  'sa-pa': 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80',
  'ha-long': 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80',
  'vung-tau': 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=1200&q=80',
};
const DEFAULT_HERO = 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80';

const SITE_ORIGIN = 'https://blogdulich.vn';

// Virtual breadcrumb root mapped from category root type.
// Display layer only — does NOT affect URL structure.
const VIRTUAL_ROOT: Record<string, { label: string; href: string }> = {
  destination: { label: 'Điểm đến hấp dẫn', href: '/diem-den' },
  itinerary: { label: 'Lịch trình', href: '/lich-trinh-du-lich' },
  review: { label: 'Review', href: '/review' },
  experience: { label: 'Kinh nghiệm', href: '/kinh-nghiem' },
};
const SYSTEM_ROOT_SLUGS = new Set([
  'diem-den', 'lich-trinh-du-lich', 'review', 'kinh-nghiem',
]);

// Per sitemap, the L2 review subtype landing pages list CITIES (L3), not
// child categories. Detect these to switch the listing UI to city pills.
const REVIEW_SUBTYPE_SLUGS = new Set([
  'review-tour', 'review-khach-san', 'review-combo',
  'review-resort', 'review-du-thuyen', 'review-nha-hang',
]);

type CategoryNode = { id: string; name: string; slug: string; type?: string; cityId?: string | null; parentId?: string | null };
type CityNode = { id: string; name: string; slug: string };
type ResolveResult =
  | { kind: 'city'; city: CityNode; canonicalPath: string }
  | { kind: 'category'; city: CityNode | null; category: CategoryNode; chain: CategoryNode[]; canonicalPath: string }
  | { kind: 'post'; city: CityNode | null; category: CategoryNode | null; chain: CategoryNode[]; post: any; canonicalPath: string }
  | { kind: 'not_found' };

type PostListItem = {
  id: string; title: string; slug: string; excerpt?: string; createdAt: string; thumbnail?: string;
  category?: { id: string; name: string; slug: string };
  canonicalUrl?: string;
};

const formatPostContent = (content: string) => {
  if (!content) return '';
  const hasHtmlTag = /<[^>]+>/.test(content);
  return hasHtmlTag ? content : content.replace(/\n/g, '<br/>');
};

export default function CatchAllPage() {
  const params = useParams();
  const slugs = useMemo(() => (params.slug as string[]) ?? [], [params.slug]);
  const path = useMemo(() => slugs.join('/'), [slugs]);

  const [loading, setLoading] = useState(true);
  const [resolved, setResolved] = useState<ResolveResult | null>(null);
  const [children, setChildren] = useState<CategoryNode[]>([]);
  const [cityPills, setCityPills] = useState<CityNode[]>([]);
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [thumbnailError, setThumbnailError] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setChildren([]);
    setCityPills([]);
    setPosts([]);
    setThumbnailError(false);

    api.get(`/taxonomy/resolve?path=${encodeURIComponent(path)}`)
      .then(async (r) => {
        if (!mounted) return;
        const data: ResolveResult = r.data;
        setResolved(data);

        if (data.kind === 'city') {
          const [catsRes, postsRes] = await Promise.all([
            api.get(`/categories?cityId=${data.city.id}`),
            api.get(`/posts?cityId=${data.city.id}&limit=100`),
          ]);
          if (!mounted) return;
          const allCats: CategoryNode[] = catsRes.data ?? [];
          const navCats = allCats.filter((c) => c.type === 'destination');
          const destCatIds = new Set(navCats.map((c) => c.id));
          const allPosts: PostListItem[] = postsRes.data.data ?? [];
          const destPosts = allPosts
            .filter((p) => p.category?.id && destCatIds.has(p.category.id))
            .slice(0, 12);
          setChildren(navCats);
          setPosts(destPosts);
        }

        if (data.kind === 'category') {
          const catId = data.category.id;
          const cityId = data.city?.id;
          const citySlug = data.city?.slug;

          // L2 review subtype landing (no city scope): list cities as primary nav
          // per sitemap convention (L2 → L3 = subtype → city).
          const isReviewSubtypeL2 =
            REVIEW_SUBTYPE_SLUGS.has(data.category.slug) && !data.city;

          if (isReviewSubtypeL2) {
            const [citiesRes, postsRes] = await Promise.all([
              api.get('/cities'),
              api.get(`/posts?categoryId=${catId}&limit=12`),
            ]);
            if (!mounted) return;
            setCityPills(citiesRes.data ?? []);
            setChildren([]);
            setPosts(postsRes.data.data ?? []);
            return;
          }

          const postsUrl = cityId
            ? `/posts?categoryId=${catId}&cityId=${cityId}&limit=12`
            : `/posts?categoryId=${catId}&limit=12`;
          const [catsRes, postsRes] = await Promise.all([
            api.get(`/categories?parentId=${catId}`),
            api.get(postsUrl),
          ]);
          if (!mounted) return;
          // City-scoped landing: only show children either un-scoped or scoped to current city.
          // Drop child whose slug == city slug (it's the city marker, not a real subcat).
          const allChildren: CategoryNode[] = catsRes.data ?? [];
          const filteredChildren = cityId
            ? allChildren.filter(
                (c) => (c.cityId == null || c.cityId === cityId) && c.slug !== citySlug,
              )
            : allChildren;
          setChildren(filteredChildren);
          setPosts(postsRes.data.data ?? []);
        }
      })
      .catch(() => mounted && setResolved({ kind: 'not_found' }))
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, [path]);

  const canonicalPath = (resolved && resolved.kind !== 'not_found') ? resolved.canonicalPath : `/${path}`;

  // Set <title>, <meta description>, canonical in <head>
  useEffect(() => {
    if (!canonicalPath) return;
    const href = `${SITE_ORIGIN}${canonicalPath}`;
    let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!el) {
      el = document.createElement('link');
      el.rel = 'canonical';
      document.head.appendChild(el);
    }
    el.href = href;
  }, [canonicalPath]);

  useEffect(() => {
    if (!resolved || resolved.kind === 'not_found') return;
    const name =
      resolved.kind === 'post'
        ? resolved.post.title
        : resolved.kind === 'city'
        ? resolved.city.name
        : resolved.category.name;
    document.title = `${name} | BlogDuLich.vn`;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    const desc =
      resolved.kind === 'post' && resolved.post.excerpt
        ? resolved.post.excerpt
        : `Khám phá ${name} trên BlogDuLich.vn`;
    meta.content = desc.slice(0, 160);
  }, [resolved]);

  // Build breadcrumb by walking the URL slugs and matching against resolved entities.
  // URL is the source of truth; breadcrumb is pure display.
  const fullBreadcrumb = useMemo(() => {
    const home = { label: 'Trang chủ', href: '/' };
    if (!resolved || resolved.kind === 'not_found') return [home];

    const items: { label: string; href: string }[] = [home];

    const chain = resolved.kind === 'city' ? [] : resolved.chain ?? [];
    const city = resolved.kind === 'city' ? resolved.city : resolved.city;

    // Inject virtual root (display only)
    let virtualType: string | null = null;
    if (chain.length > 0 && !SYSTEM_ROOT_SLUGS.has(chain[0].slug)) {
      virtualType = chain[0].type ?? null;
    } else if (resolved.kind === 'city') {
      virtualType = 'destination';
    }
    if (virtualType && VIRTUAL_ROOT[virtualType]) {
      items.push(VIRTUAL_ROOT[virtualType]);
    }

    // Walk URL segments, matching each to chain/city/post
    let chainIdx = 0;
    let cumulative = '';
    for (let i = 0; i < slugs.length; i++) {
      const slug = slugs[i];
      cumulative += '/' + slug;

      if (city && slug === city.slug) {
        items.push({ label: city.name, href: cumulative });
        continue;
      }
      if (chainIdx < chain.length && slug === chain[chainIdx].slug) {
        items.push({ label: chain[chainIdx].name, href: cumulative });
        chainIdx++;
        continue;
      }
      if (resolved.kind === 'post' && i === slugs.length - 1) {
        items.push({ label: resolved.post.title, href: cumulative });
        continue;
      }
    }

    return items;
  }, [resolved, slugs]);

  const breadcrumbJsonLd = useMemo(
    () =>
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: fullBreadcrumb.map((item, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: item.label,
          item: `${SITE_ORIGIN}${item.href}`,
        })),
      }),
    [fullBreadcrumb],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-[1100px] mx-auto px-6 pt-[100px] animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-100 rounded w-2/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!resolved || resolved.kind === 'not_found') {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-[900px] mx-auto px-6 pt-[100px]">
          <h1 className="text-2xl font-extrabold text-gray-900">Không tìm thấy trang</h1>
          <p className="text-gray-500 mt-2">Đường dẫn: <code className="font-mono bg-gray-100 px-1 rounded">/{path}</code></p>
          <Link href="/" className="inline-block mt-6 text-violet-600 font-semibold">← Về trang chủ</Link>
        </div>
      </div>
    );
  }

  if (resolved.kind === 'post') {
    return (
      <div className="min-h-screen bg-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }} />
        <Navbar opaque />
        <div className="pt-[72px]">
          {resolved.post.thumbnail && !thumbnailError && (
            <div className="px-4 md:px-6 pt-6">
              <div className="relative max-w-[1200px] mx-auto overflow-hidden rounded-3xl bg-gray-100 shadow-sm">
                <img
                  src={resolved.post.thumbnail}
                  alt={resolved.post.title}
                  className="w-full h-[260px] md:h-[420px] object-cover"
                  onError={() => setThumbnailError(true)}
                />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/15 via-transparent to-transparent" />
              </div>
            </div>
          )}

          <div className="max-w-[900px] mx-auto px-6 py-10">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-6">
              {fullBreadcrumb.map((b, idx) => {
                const isLast = idx === fullBreadcrumb.length - 1;
                return (
                  <div key={`${b.href}-${idx}`} className="flex items-center gap-2">
                    {!isLast ? (
                      <Link href={b.href} className="hover:text-violet-600 transition-colors">
                        {b.label}
                      </Link>
                    ) : (
                      <span className="text-gray-700 font-medium">{b.label}</span>
                    )}
                    {!isLast && <span className="text-gray-300">/</span>}
                  </div>
                );
              })}
            </nav>

            <h1 className="text-3xl font-extrabold text-gray-900 mb-4 leading-tight" style={{ letterSpacing: '-0.03em' }}>
              {resolved.post.title}
            </h1>
            {resolved.post.excerpt && (
              <p className="text-lg text-gray-500 mb-8 pb-8 border-b border-gray-100 leading-relaxed">
                {resolved.post.excerpt}
              </p>
            )}

            <div
              className="max-w-none text-gray-700 leading-relaxed
                [&_p]:my-4 [&_p]:leading-8
                [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900
                [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-gray-900
                [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6
                [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6
                [&_li]:my-2
                [&_a]:text-violet-600 [&_a]:underline-offset-2 hover:[&_a]:underline
                [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-violet-200 [&_blockquote]:pl-4 [&_blockquote]:text-gray-600
                [&_figure]:my-8
                [&_img]:my-6 [&_img]:mx-auto [&_img]:block [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-2xl
                [&_table]:w-full [&_table]:my-6 [&_table]:border-collapse
                [&_th]:border [&_th]:border-gray-200 [&_th]:bg-gray-50 [&_th]:px-3 [&_th]:py-2
                [&_td]:border [&_td]:border-gray-200 [&_td]:px-3 [&_td]:py-2"
              style={{ lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: formatPostContent(String(resolved.post.content || '')) }}
            />

            <PostLocationMap
              title={resolved.post.title}
              location={resolved.post.location}
              latitude={resolved.post.latitude}
              longitude={resolved.post.longitude}
            />
          </div>
        </div>
      </div>
    );
  }

  // City or Category landing
  const isCity = resolved.kind === 'city';
  const citySlug = isCity ? resolved.city.slug : resolved.city?.slug;
  const heroImage = citySlug ? (CITY_IMAGES[citySlug] ?? DEFAULT_HERO) : DEFAULT_HERO;
  const heroTitle = isCity ? resolved.city.name : resolved.category.name;

  // Child link: descend from current canonical URL.
  const buildChildHref = (childSlug: string) => `/${path}/${childSlug}`;

  // Post link: use the canonicalUrl returned by the posts API (computed from
  // sitemap URL convention based on category type + city scope). This avoids
  // cumulative path nesting bugs when navigating deep category trees.
  const buildPostHref = (p: PostListItem) => {
    if (p.canonicalUrl) return p.canonicalUrl;
    // Fallback (post API didn't return canonicalUrl, e.g. legacy):
    if (isCity) {
      return p.category?.slug ? `/${path}/${p.category.slug}/${p.slug}` : `/posts/${p.slug}`;
    }
    return `/${path}/${p.slug}`;
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }} />
      <Navbar />

      <div className="bg-white px-3 pt-3 pb-0">
        <section
          className="relative w-full flex flex-col justify-end overflow-hidden"
          style={{ height: '42vh', minHeight: 300, borderRadius: 20 }}
        >
          <img
            src={heroImage}
            alt={heroTitle}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/30 to-black/15" />

          <div className="relative z-10 px-6 md:px-10 pb-7">
            <nav className="flex flex-wrap items-center gap-1.5 text-white/65 text-xs mb-3">
              {fullBreadcrumb.map((b, idx) => {
                const isLast = idx === fullBreadcrumb.length - 1;
                return (
                  <span key={`${b.href}-${idx}`} className="flex items-center gap-1.5">
                    {!isLast ? (
                      <Link href={b.href} className="hover:text-white transition-colors">{b.label}</Link>
                    ) : (
                      <span className="text-white/90 font-medium">{b.label}</span>
                    )}
                    {!isLast && <ChevronRight size={11} className="text-white/40" />}
                  </span>
                );
              })}
            </nav>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
              {heroTitle}
            </h1>
            <div className="flex items-center gap-3 text-white/65 text-xs">
              {children.length > 0 && (
                <span className="flex items-center gap-1"><MapPin size={11} /> {children.length} chuyên mục</span>
              )}
              {children.length > 0 && posts.length > 0 && <span>•</span>}
              {posts.length > 0 && (
                <span className="flex items-center gap-1"><BookOpen size={11} /> {posts.length} bài viết</span>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="max-w-[1180px] mx-auto px-4 md:px-6">
        {cityPills.length > 0 && (
          <div className="pt-6 pb-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Chọn tỉnh thành
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {cityPills.map((c) => (
                <Link
                  key={c.id}
                  href={`/${path}/${c.slug}`}
                  className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50 transition-all"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}
        {children.length > 0 && (
          <div className="pt-6 pb-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Chuyên mục
            </p>
            {children.length <= 6 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {children.map((c) => (
                  <Link
                    key={c.id}
                    href={buildChildHref(c.slug)}
                    className="group flex items-center justify-between gap-2 bg-gray-50 hover:bg-violet-50 border border-gray-100 hover:border-violet-200 rounded-xl px-4 py-3 transition-all"
                  >
                    <span className="font-medium text-gray-800 text-sm group-hover:text-violet-700 transition-colors line-clamp-1">
                      {c.name}
                    </span>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-violet-400 shrink-0 transition-colors" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="relative">
                <div className="flex gap-2 overflow-x-auto pb-2"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {children.map((c) => (
                    <Link
                      key={c.id}
                      href={buildChildHref(c.slug)}
                      className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50 transition-all"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
                <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-12 bg-linear-to-l from-white to-transparent" />
              </div>
            )}
          </div>
        )}

        <div className="py-8">
          <div className="flex items-center justify-between mb-5">
            <p className="text-lg font-extrabold text-gray-900">
              {children.length > 0 ? 'Bài viết mới nhất' : 'Bài viết'}
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-10 text-center">
              <p className="text-gray-600 font-semibold">Chưa có bài viết cho mục này.</p>
              <Link href="/" className="inline-flex mt-4 text-sm font-semibold text-violet-600 hover:text-violet-700">
                Về trang chủ
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map((p) => (
                <Link
                  key={p.id}
                  href={buildPostHref(p)}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-violet-200 transition-all duration-200"
                >
                  <div className="h-44 overflow-hidden bg-gray-100">
                    {p.thumbnail ? (
                      <img
                        src={p.thumbnail}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={28} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-gray-900 line-clamp-2 leading-snug mb-2 group-hover:text-violet-700 transition-colors">
                      {p.title}
                    </p>
                    {p.excerpt && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{p.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Clock size={11} /> {formatDate(p.createdAt)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-violet-600 font-semibold">
                        Đọc <ArrowUpRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
