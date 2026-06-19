'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpRight, Clock, BookOpen, MapPin, ChevronRight, Star, CalendarDays, Lightbulb } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { FaqSection, type FaqModule } from '@/components/FaqSection';
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
  destination: { label: 'Điểm đến', href: '/diem-den' },
  itinerary: { label: 'Lịch trình du lịch', href: '/lich-trinh' },
  review: { label: 'Review', href: '/review' },
  experience: { label: 'Kinh nghiệm', href: '/kinh-nghiem' },
};
const SYSTEM_ROOT_SLUGS = new Set([
  'diem-den', 'lich-trinh-du-lich', 'review', 'kinh-nghiem',
]);


type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  type?: string;
  level?: string;
  cityId?: string | null;
  parentId?: string | null;
  parent?: CategoryNode | null;
};
type CityNode = { id: string; name: string; slug: string };

type PostListItem = {
  id: string; title: string; slug: string; excerpt?: string; createdAt: string; thumbnail?: string;
  category?: CategoryNode;
  categoryId?: string | null;
  canonicalUrl?: string;
  viewCount?: number;
};

type PostDetail = PostListItem & {
  content?: string;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

type ResolveResult =
  | { kind: 'city'; city: CityNode; canonicalPath: string }
  | { kind: 'category'; city: CityNode | null; category: CategoryNode; chain: CategoryNode[]; canonicalPath: string }
  | { kind: 'post'; city: CityNode | null; category: CategoryNode | null; chain: CategoryNode[]; post: PostDetail; canonicalPath: string }
  | { kind: 'not_found' };

type DestinationCitySection = {
  key: string;
  title: string;
  href?: string;
  posts: PostListItem[];
  order: number;
};

type CityFeaturedData = {
  destination: PostListItem[];
  itinerary: PostListItem[];
  experience: PostListItem[];
  review: {
    groups: Array<{ slug: string; name: string; posts: PostListItem[] }>;
    posts: PostListItem[];
  };
};

const REVIEW_PUBLIC_SLUG: Record<string, string> = {
  'review-tour': 'tour',
  'review-khach-san': 'khach-san',
  'review-combo': 'combo',
  'review-resort': 'resort',
  'review-du-thuyen': 'du-thuyen',
  'review-nha-hang': 'nha-hang',
};

const DESTINATION_CITY_ORDER = [
  'dia-diem-tham-quan',
  'dia-diem-vui-choi',
  'di-tich-lich-su',
  'bao-tang',
  'an-gi',
  'o-dau',
];

const PUBLIC_CATEGORY_LABEL: Record<string, string> = {
  'diem-den': 'Điểm đến',
  'lich-trinh-du-lich': 'Lịch trình du lịch',
  'kinh-nghiem': 'Kinh nghiệm du lịch',
  review: 'Review',
  'review-tour': 'Tour du lịch',
  'review-khach-san': 'Khách sạn',
  'review-combo': 'Combo',
  'review-resort': 'Resort',
  'review-du-thuyen': 'Du thuyền',
  'review-nha-hang': 'Nhà hàng',
};

const publicCategorySegment = (category: Pick<CategoryNode, 'slug' | 'type' | 'level'>) => {
  if (category.slug === 'lich-trinh-du-lich') return 'lich-trinh';
  if (category.slug === 'review') return 'review';
  if (category.slug === 'kinh-nghiem') return 'kinh-nghiem';
  if (category.slug === 'diem-den') return 'diem-den';
  if (category.type === 'itinerary' && category.level === 'CITY') {
    return category.slug.replace(/^lich-trinh-du-lich-/, '');
  }
  if (category.type === 'experience' && category.level === 'CITY') {
    return category.slug.replace(/^kinh-nghiem-du-lich-/, '');
  }
  return REVIEW_PUBLIC_SLUG[category.slug] ?? category.slug;
};

const publicCategoryLabel = (category: Pick<CategoryNode, 'name' | 'slug'>) =>
  PUBLIC_CATEGORY_LABEL[category.slug] ?? category.name;

const HANOI_INTRO = [
  'Hà Nội là điểm đến mở đầu đầy cảm xúc cho hành trình khám phá miền Bắc, nơi nhịp sống hiện đại đan xen cùng chiều sâu văn hóa nghìn năm. Thành phố hấp dẫn du khách bằng hồ Gươm, phố cổ, Văn Miếu - Quốc Tử Giám, những con phố rợp bóng cây và các khu chợ, quán ăn lưu giữ hương vị rất riêng của đất kinh kỳ.',
  'Du lịch Hà Nội phù hợp với nhiều kiểu hành trình: cuối tuần ngắn ngày, chuyến đi gia đình, lịch trình tự túc hoặc điểm dừng trước khi tiếp tục tới Ninh Bình, Hạ Long, Sa Pa. Ban ngày, du khách có thể tham quan di tích, bảo tàng, làng nghề ven đô; buổi tối là thời gian lý tưởng để dạo phố cổ, thưởng thức phở, bún chả, cà phê trứng và cảm nhận không khí sôi động quanh hồ Hoàn Kiếm.',
  'Trên BlogDuLich.vn, chuyên trang Hà Nội tổng hợp các điểm tham quan nổi bật, lịch trình gợi ý, kinh nghiệm thực tế và review dịch vụ du lịch liên quan để bạn dễ chọn nội dung phù hợp trước khi lên đường.',
].join(' ');

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
  const [cityFeatured, setCityFeatured] = useState<CityFeaturedData | null>(null);
  const [cityFeaturedLoading, setCityFeaturedLoading] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setChildren([]);
    setCityPills([]);
    setPosts([]);
    setCityFeatured(null);
    setThumbnailError(false);

    api.get(`/taxonomy/page?path=${encodeURIComponent(path)}`)
      .then((r) => {
        if (!mounted) return;
        const { resolved, children, cityPills, posts } = r.data;
        setResolved(resolved);
        setChildren(children ?? []);
        setCityPills(cityPills ?? []);
        setPosts(posts ?? []);
      })
      .catch(() => mounted && setResolved({ kind: 'not_found' }))
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, [path]);

  useEffect(() => {
    if (!resolved || resolved.kind !== 'city') {
      setCityFeatured(null);
      setCityFeaturedLoading(false);
      return;
    }

    let mounted = true;
    setCityFeaturedLoading(true);
    api.get(`/posts/city-featured/${resolved.city.slug}`)
      .then((r) => {
        if (!mounted) return;
        setCityFeatured(r.data ?? null);
      })
      .catch(() => mounted && setCityFeatured(null))
      .finally(() => mounted && setCityFeaturedLoading(false));

    return () => { mounted = false; };
  }, [resolved]);

  useEffect(() => {
    if (!resolved || resolved.kind !== 'post' || !resolved.post?.id) return;
    const storageKey = `viewed-post:${resolved.post.id}`;
    if (typeof window !== 'undefined' && window.sessionStorage.getItem(storageKey)) return;
    if (typeof window !== 'undefined') window.sessionStorage.setItem(storageKey, '1');
    api.post(`/posts/${resolved.post.id}/view`).catch(() => null);
  }, [resolved]);

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
      if (chainIdx < chain.length && slug === publicCategorySegment(chain[chainIdx])) {
        items.push({ label: publicCategoryLabel(chain[chainIdx]), href: cumulative });
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
                [&_img]:my-6 [&_img]:mx-auto [&_img]:block [&_img]:w-full [&_img]:h-auto [&_img]:rounded-2xl
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

            <FaqSection
              targetType="post"
              targetId={resolved.post.id}
              module={(resolved.post.category?.type ?? 'destination') as FaqModule}
              heading={`Câu hỏi thường gặp về ${resolved.post.title}`}
              className="px-0"
            />
          </div>
        </div>
      </div>
    );
  }

  // City or Category landing
  const isCity = resolved.kind === 'city';
  const categoryType: string = isCity ? 'destination' : resolved.category.type ?? 'destination';
  const citySlug = isCity ? resolved.city.slug : resolved.city?.slug;
  const heroImage = citySlug ? (CITY_IMAGES[citySlug] ?? DEFAULT_HERO) : DEFAULT_HERO;
  const heroTitle = isCity ? resolved.city.name : resolved.category.name;

  const TYPE_CONFIG: Record<string, { badge: string | null; badgeBg: string; badgeText: string; accent: string; postLabel: string }> = {
    destination: { badge: null,          badgeBg: '',                     badgeText: '',              accent: 'violet', postLabel: 'Bài viết' },
    review:      { badge: 'Review',      badgeBg: 'bg-amber-500/80',      badgeText: 'text-white',    accent: 'amber',  postLabel: 'Review mới nhất' },
    itinerary:   { badge: 'Lịch trình',  badgeBg: 'bg-sky-500/80',        badgeText: 'text-white',    accent: 'sky',    postLabel: 'Lịch trình mới nhất' },
    experience:  { badge: 'Kinh nghiệm', badgeBg: 'bg-emerald-500/80',    badgeText: 'text-white',    accent: 'emerald',postLabel: 'Bài viết mới nhất' },
  };
  const typeCfg = TYPE_CONFIG[categoryType] ?? TYPE_CONFIG.destination;

  // Child link: descend from the current public URL, not internal category slugs.
  const buildChildHref = (child: CategoryNode) => `/${path}/${publicCategorySegment(child)}`;

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

  const uniquePosts = (items: PostListItem[]) => {
    const seen = new Set<string>();
    return items.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  };

  const destinationSectionOrder = (slug: string, fallback: number) => {
    const index = DESTINATION_CITY_ORDER.indexOf(slug);
    return index >= 0 ? index : DESTINATION_CITY_ORDER.length + fallback;
  };

  const destinationSectionTitle = (name: string, cityName: string) => {
    const normalized = name.trim().toLowerCase();
    if (normalized === 'ở đâu' || normalized === 'o dau') return `Ở đâu tại ${cityName}`;
    if (normalized === 'ăn gì' || normalized === 'an gi') return `Ăn gì ở ${cityName}`;
    return `${name} ${cityName}`;
  };

  const directDestinationPostTitle = (post: PostListItem) => {
    const concise = post.title.split('?')[0]?.trim();
    return concise ? `${concise}?` : post.title;
  };

  const destinationCitySections: DestinationCitySection[] = (() => {
    if (!isCity || !citySlug) return [];

    const subCategories = children.filter(
      (child) => child.type === 'destination' && child.level === 'SUB',
    );
    const subCategoryIds = new Set(subCategories.map((child) => child.id));
    const destinationPosts = uniquePosts([
      ...(cityFeatured?.destination ?? []),
      ...posts.filter((post) => post.category?.type === 'destination'),
    ]);

    const postsByCategory = new Map<string, PostListItem[]>();
    destinationPosts.forEach((post) => {
      const categoryId = post.categoryId ?? post.category?.id;
      if (!categoryId) return;
      const list = postsByCategory.get(categoryId) ?? [];
      list.push(post);
      postsByCategory.set(categoryId, list);
    });

    const sections = subCategories.map((category, index) => ({
      key: category.id,
      title: destinationSectionTitle(category.name, heroTitle),
      href: `/diem-den/${citySlug}/${category.slug}`,
      posts: postsByCategory.get(category.id) ?? [],
      order: destinationSectionOrder(category.slug, index),
    }));

    destinationPosts
      .filter((post) => {
        const categoryId = post.categoryId ?? post.category?.id;
        return categoryId ? !subCategoryIds.has(categoryId) : false;
      })
      .forEach((post, index) => {
        sections.push({
          key: `direct-${post.id}`,
          title: directDestinationPostTitle(post),
          href: buildPostHref(post),
          posts: [post],
          order: destinationSectionOrder(post.slug, subCategories.length + index),
        });
      });

    return sections.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, 'vi'));
  })();

  const cityIntro = citySlug === 'ha-noi'
    ? HANOI_INTRO
    : `${heroTitle} là một trong những điểm đến đáng chú ý trên bản đồ du lịch Việt Nam, phù hợp cho du khách muốn tìm kiếm trải nghiệm văn hóa, ẩm thực và nghỉ dưỡng theo nhịp riêng. Tại đây, BlogDuLich.vn tổng hợp các điểm tham quan nổi bật, lịch trình gợi ý, kinh nghiệm thực tế và review dịch vụ liên quan để bạn dễ dàng lên kế hoạch trước chuyến đi.`;

  const renderCityPostCard = (post: PostListItem, accent: 'violet' | 'sky' | 'emerald' | 'amber') => {
    const accentClass = {
      violet: 'group-hover:text-violet-700 text-violet-600',
      sky: 'group-hover:text-sky-700 text-sky-600',
      emerald: 'group-hover:text-emerald-700 text-emerald-600',
      amber: 'group-hover:text-amber-700 text-amber-600',
    }[accent];

    return (
      <Link
        key={post.id}
        href={buildPostHref(post)}
        className="group grid min-h-[132px] grid-cols-[112px_1fr] overflow-hidden rounded-xl border border-gray-100 bg-white transition-all duration-200 hover:border-gray-200 hover:shadow-md"
      >
        <div className="bg-gray-100">
          {post.thumbnail ? (
            <img src={post.thumbnail} alt={post.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <BookOpen size={24} className="text-gray-300" />
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-col p-4">
          <p className={`line-clamp-2 text-sm font-bold leading-snug text-gray-900 transition-colors ${accentClass}`}>
            {post.title}
          </p>
          {post.excerpt && <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">{post.excerpt}</p>}
          <div className="mt-auto flex items-center justify-between pt-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Clock size={11} /> {formatDate(post.createdAt)}</span>
            <span className="flex items-center gap-1 font-semibold text-gray-500">{post.viewCount ?? 0} lượt xem</span>
          </div>
        </div>
      </Link>
    );
  };

  const renderCitySection = (
    title: string,
    items: PostListItem[] | undefined,
    accent: 'violet' | 'sky' | 'emerald' | 'amber',
    viewAllHref?: string,
  ) => (
    <section className="py-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-950">{title}</h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-gray-600 transition-colors hover:text-gray-950">
            Xem thêm <ArrowUpRight size={14} />
          </Link>
        )}
      </div>
      {cityFeaturedLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-[132px] animate-pulse rounded-xl bg-gray-100" />)}
        </div>
      ) : items && items.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.slice(0, 6).map((post) => renderCityPostCard(post, accent))}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-6 text-sm font-medium text-gray-500">
          Chưa có bài viết phù hợp cho mục này.
        </div>
      )}
    </section>
  );

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

            {typeCfg.badge && (
              <span className={`inline-block ${typeCfg.badgeBg} ${typeCfg.badgeText} text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm mb-2`}>
                {typeCfg.badge}
              </span>
            )}
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
        {!isCity && children.length > 0 && (
          <div className="pt-6 pb-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Chuyên mục
            </p>
            {children.length <= 6 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {children.map((c) => (
                  <Link
                    key={c.id}
                    href={buildChildHref(c)}
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
                      href={buildChildHref(c)}
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

        {isCity ? (
          <div className="py-8">
            <section className="border-b border-gray-100 pb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-3">
                Tổng quan điểm đến
              </p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-950 tracking-tight mb-4">
                Du lịch {heroTitle}
              </h2>
              <p className="max-w-[900px] text-base leading-8 text-gray-600">
                {cityIntro}
              </p>
            </section>

            {destinationCitySections.length > 0 ? (
              destinationCitySections.map((section) => (
                <div key={section.key}>
                  {renderCitySection(section.title, section.posts, 'violet', section.href)}
                </div>
              ))
            ) : (
              renderCitySection(
                `Điểm đến ${heroTitle}`,
                cityFeatured?.destination,
                'violet',
                `/diem-den/${citySlug}`,
              )
            )}

            {renderCitySection(
              `Lịch Trình Du Lịch ${heroTitle}`,
              cityFeatured?.itinerary,
              'sky',
              `/lich-trinh/${citySlug}`,
            )}

            {renderCitySection(
              `Kinh Nghiệm Du Lịch ${heroTitle}`,
              cityFeatured?.experience,
              'emerald',
              `/kinh-nghiem/${citySlug}`,
            )}

            <section className="py-8">
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="text-2xl font-extrabold tracking-tight text-gray-950">
                  Review Du Lịch {heroTitle}
                </h2>
                <Link href="/review" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-gray-600 transition-colors hover:text-gray-950">
                  Xem thêm <ArrowUpRight size={14} />
                </Link>
              </div>

              {cityFeaturedLoading ? (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {[...Array(4)].map((_, i) => <div key={i} className="h-52 animate-pulse rounded-xl bg-gray-100" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {(cityFeatured?.review.groups ?? []).map((group) => (
                    <div key={group.slug} className="rounded-xl border border-gray-100 bg-white p-5">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <h3 className="text-base font-extrabold text-gray-950">{group.name}</h3>
                        <Link href={`/review/${REVIEW_PUBLIC_SLUG[group.slug] ?? group.slug}/${citySlug}`} className="text-xs font-semibold text-amber-600 hover:text-amber-700">
                          Xem
                        </Link>
                      </div>
                      {group.posts.length > 0 ? (
                        <div className="space-y-3">
                          {group.posts.slice(0, 3).map((post) => (
                            <Link key={post.id} href={buildPostHref(post)} className="group flex gap-3">
                              <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                {post.thumbnail ? (
                                  <img src={post.thumbnail} alt={post.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <Star size={17} className="text-gray-300" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="line-clamp-2 text-sm font-bold leading-snug text-gray-900 transition-colors group-hover:text-amber-700">
                                  {post.title}
                                </p>
                                <p className="mt-1 text-xs text-gray-400">{post.viewCount ?? 0} lượt xem</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-gray-500">Chưa có bài viết phù hợp cho hạng mục này.</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <FaqSection
              targetType="city"
              targetId={resolved.city.id}
              module="destination"
              heading={`Những câu hỏi thường gặp khi đến với ${heroTitle}`}
              className="px-0"
            />
          </div>
        ) : (
        <div className="py-8">
          <div className="flex items-center justify-between mb-5">
            <p className="text-lg font-extrabold text-gray-900">
              {children.length > 0 ? typeCfg.postLabel : 'Bài viết'}
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-10 text-center">
              <p className="text-gray-600 font-semibold">Chưa có bài viết cho mục này.</p>
              <Link href="/" className="inline-flex mt-4 text-sm font-semibold text-violet-600 hover:text-violet-700">
                Về trang chủ
              </Link>
            </div>
          ) : categoryType === 'review' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map((p) => (
                <Link
                  key={p.id}
                  href={buildPostHref(p)}
                  className="group relative block overflow-hidden rounded-2xl aspect-[4/3] bg-gray-100"
                >
                  {p.thumbnail ? (
                    <img src={p.thumbnail} alt={p.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-700" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-bold text-amber-900">
                      <Star size={10} fill="currentColor" /> Review
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-xs text-white/60 mb-1 flex items-center gap-1">
                      <MapPin size={10} /> {p.category?.name ?? 'Review'}
                    </p>
                    <h3 className="font-bold text-white line-clamp-2 leading-snug text-sm">{p.title}</h3>
                    <p className="text-xs text-white/50 mt-1">{formatDate(p.createdAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : categoryType === 'itinerary' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map((p) => (
                <Link
                  key={p.id}
                  href={buildPostHref(p)}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-sky-200 transition-all duration-200"
                >
                  <div className="relative h-44 overflow-hidden bg-gray-100">
                    {p.thumbnail ? (
                      <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-sky-50">
                        <CalendarDays size={28} className="text-sky-200" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/80 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
                        <CalendarDays size={10} /> Lịch trình
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-gray-900 line-clamp-2 leading-snug mb-2 group-hover:text-sky-700 transition-colors">{p.title}</p>
                    {p.excerpt && <p className="text-xs text-gray-500 line-clamp-2 mb-3">{p.excerpt}</p>}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 flex items-center gap-1"><Clock size={11} /> {formatDate(p.createdAt)}</span>
                      <span className="inline-flex items-center gap-1 text-sky-600 font-semibold">Xem <ArrowUpRight size={12} /></span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : categoryType === 'experience' ? (
            <div className="flex flex-col gap-4">
              {posts.map((p) => (
                <Link
                  key={p.id}
                  href={buildPostHref(p)}
                  className="group flex gap-4 bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-emerald-200 transition-all duration-200 p-4"
                >
                  <div className="w-28 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                    {p.thumbnail ? (
                      <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-50">
                        <Lightbulb size={22} className="text-emerald-200" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold mb-1">
                      <Lightbulb size={10} /> Kinh nghiệm
                    </span>
                    <p className="font-bold text-gray-900 line-clamp-2 leading-snug mb-1 group-hover:text-emerald-700 transition-colors">{p.title}</p>
                    {p.excerpt && <p className="text-xs text-gray-500 line-clamp-2">{p.excerpt}</p>}
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Clock size={10} /> {formatDate(p.createdAt)}</p>
                  </div>
                  <ArrowUpRight size={16} className="text-gray-300 group-hover:text-emerald-500 shrink-0 mt-1 transition-colors" />
                </Link>
              ))}
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
                      <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={28} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-gray-900 line-clamp-2 leading-snug mb-2 group-hover:text-violet-700 transition-colors">{p.title}</p>
                    {p.excerpt && <p className="text-xs text-gray-500 line-clamp-2 mb-3">{p.excerpt}</p>}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 flex items-center gap-1"><Clock size={11} /> {formatDate(p.createdAt)}</span>
                      <span className="inline-flex items-center gap-1 text-violet-600 font-semibold">Đọc <ArrowUpRight size={12} /></span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <FaqSection
            targetType="category"
            targetId={resolved.category.id}
            module={categoryType as FaqModule}
            heading={`Câu hỏi thường gặp về ${heroTitle}`}
            className="px-0"
          />
        </div>
        )}
      </div>
    </div>
  );
}
