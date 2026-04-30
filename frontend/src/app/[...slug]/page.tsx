'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import api from '@/lib/axios';

type ResolveResult =
  | { kind: 'city'; city: { id: string; name: string; slug: string } }
  | { kind: 'category'; city?: { id: string; name: string; slug: string } | null; category: any; chain: any[] }
  | { kind: 'post'; city?: { id: string; name: string; slug: string } | null; category?: any | null; chain: any[]; post: any }
  | { kind: 'not_found' };

type Category = { id: string; name: string; slug: string; type?: string; cityId?: string | null; parentId?: string | null };
type PostListItem = { id: string; title: string; slug: string; excerpt?: string; createdAt: string };

const formatPostContent = (content: string) => {
  if (!content) return '';
  const hasHtmlTag = /<[^>]+>/.test(content);
  return hasHtmlTag ? content : content.replace(/\n/g, '<br/>');
};

export default function CatchAllPage() {
  const params = useParams();
  const slugs = (params.slug as string[]) ?? [];

  const path = useMemo(() => slugs.join('/'), [slugs]);

  const [loading, setLoading] = useState(true);
  const [resolved, setResolved] = useState<ResolveResult | null>(null);
  const [children, setChildren] = useState<Category[]>([]);
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [thumbnailError, setThumbnailError] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setChildren([]);
    setPosts([]);
    setThumbnailError(false);

    api.get(`/taxonomy/resolve?path=${encodeURIComponent(path)}`)
      .then(async (r) => {
        if (!mounted) return;
        const data: ResolveResult = r.data;
        setResolved(data);

        if (data.kind === 'city') {
          // City landing: show top-level destination categories for this city (if any) + latest posts
          const [catsRes, postsRes] = await Promise.all([
            api.get(`/categories?cityId=${data.city.id}&parentId=`),
            api.get(`/posts?cityId=${data.city.id}&limit=12`),
          ]);
          if (!mounted) return;
          setChildren(catsRes.data ?? []);
          setPosts(postsRes.data.data ?? []);
        }

        if (data.kind === 'category') {
          const catId = data.category.id;
          const [catsRes, postsRes] = await Promise.all([
            api.get(`/categories?parentId=${catId}`),
            api.get(`/posts?categoryId=${catId}&limit=12`),
          ]);
          if (!mounted) return;
          setChildren(catsRes.data ?? []);
          setPosts(postsRes.data.data ?? []);
        }

        if (data.kind === 'post') {
          // Nothing extra
        }
      })
      .catch(() => mounted && setResolved({ kind: 'not_found' }))
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, [path]);

  const breadcrumb = useMemo(() => {
    if (!resolved || resolved.kind === 'not_found') return [];
    if (resolved.kind === 'city') return [{ label: resolved.city.name, href: `/${resolved.city.slug}` }];
    if (resolved.kind === 'category') {
      const items: { label: string; href: string }[] = [];
      if (resolved.city?.slug) items.push({ label: resolved.city.name, href: `/${resolved.city.slug}` });
      const base = resolved.city?.slug ? `/${resolved.city.slug}` : '';
      resolved.chain.forEach((c: any, idx: number) => {
        const href = `${base}/${resolved.chain.slice(0, idx + 1).map((x: any) => x.slug).join('/')}`;
        items.push({ label: c.name, href });
      });
      return items;
    }
    if (resolved.kind === 'post') {
      const items: { label: string; href: string }[] = [];
      if (resolved.city?.slug) items.push({ label: resolved.city.name, href: `/${resolved.city.slug}` });
      const base = resolved.city?.slug ? `/${resolved.city.slug}` : '';
      resolved.chain.forEach((c: any, idx: number) => {
        const href = `${base}/${resolved.chain.slice(0, idx + 1).map((x: any) => x.slug).join('/')}`;
        items.push({ label: c.name, href });
      });
      items.push({ label: resolved.post.title, href: `/${path}` });
      return items;
    }
    return [];
  }, [resolved, path]);

  const fullBreadcrumb = useMemo(
    () => [{ label: 'Trang chủ', href: '/' }, ...breadcrumb],
    [breadcrumb],
  );

  const breadcrumbJsonLd = useMemo(
    () =>
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: fullBreadcrumb.map((item, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: item.label,
          item: `https://blogdulich.vn${item.href}`,
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
        <Navbar />
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
                  <div key={b.href} className="flex items-center gap-2">
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
          </div>
        </div>
      </div>
    );
  }

  // City or Category landing
  const title =
    resolved.kind === 'city' ? resolved.city.name : resolved.category?.name;

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }} />
      <Navbar />
      <div className="pt-[72px]">
        <div className="max-w-[1100px] mx-auto px-6 py-10">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-4">
            {fullBreadcrumb.map((b, idx) => {
              const isLast = idx === fullBreadcrumb.length - 1;
              return (
                <div key={b.href} className="flex items-center gap-2">
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

          <h1 className="text-3xl font-extrabold text-gray-900 mb-2" style={{ letterSpacing: '-0.03em' }}>
            {title}
          </h1>
          <p className="text-gray-500 mb-8">
            URL: <code className="font-mono bg-gray-100 px-1 rounded">/{path}</code>
          </p>

          {children.length > 0 && (
            <>
              <h2 className="text-lg font-extrabold text-gray-900 mb-3">Mục con</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {children.map((c) => (
                  <Link
                    key={c.id}
                    href={`/${[...slugs, c.slug].join('/')}`}
                    className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all"
                  >
                    <p className="font-semibold text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-400 font-mono mt-1">/{[...slugs, c.slug].join('/')}</p>
                  </Link>
                ))}
              </div>
            </>
          )}

          <h2 className="text-lg font-extrabold text-gray-900 mb-3">Bài viết</h2>
          {posts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500">
              Chưa có bài viết cho mục này.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {posts.map((p) => (
                <Link
                  key={p.id}
                  href={`/${[...slugs, p.slug].join('/')}`}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all"
                >
                  <p className="font-semibold text-gray-900 line-clamp-2">{p.title}</p>
                  {p.excerpt && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{p.excerpt}</p>}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

