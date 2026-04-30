'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Clock, MapPin, ArrowLeft, BookOpen } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import api from '@/lib/axios';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  thumbnail?: string;
  createdAt: string;
  city?: { id: string; name: string; slug: string };
  category?: { name: string; slug: string };
}

const formatPostContent = (content: string) => {
  if (!content) return '';
  const hasHtmlTag = /<[^>]+>/.test(content);
  return hasHtmlTag ? content : content.replace(/\n/g, '<br/>');
};

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [thumbnailError, setThumbnailError] = useState(false);

  useEffect(() => {
    setThumbnailError(false);
    api.get(`/posts/${slug}`)
      .then((r) => setPost(r.data))
      .catch(() => router.push('/posts'))
      .finally(() => setLoading(false));
  }, [slug]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' });

  if (loading) return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-[780px] mx-auto px-6 pt-[100px] animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
        <div className="h-64 bg-gray-200 rounded-2xl" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-4 bg-gray-100 rounded" />)}
        </div>
      </div>
    </div>
  );

  if (!post) return null;

  const breadcrumb = [
    { label: 'Trang chủ', href: '/' },
    ...(post.city ? [{ label: post.city.name, href: `/${post.city.slug}` }] : []),
    ...(post.category
      ? [{
          label: post.category.name,
          href: post.city ? `/${post.city.slug}/${post.category.slug}` : `/${post.category.slug}`,
        }]
      : []),
    { label: post.title, href: `/posts/${post.slug}` },
  ];

  const breadcrumbJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumb.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.label,
      item: `https://blogdulich.vn${item.href}`,
    })),
  });

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }} />
      <Navbar />
      <div className="pt-[72px]">
        {/* Hero thumbnail */}
        {post.thumbnail && !thumbnailError && (
          <div className="px-4 md:px-6 pt-6">
            <div className="relative max-w-[1200px] mx-auto overflow-hidden rounded-3xl bg-gray-100 shadow-sm">
              <img
                src={post.thumbnail}
                alt={post.title}
                className="w-full h-[260px] md:h-[420px] object-cover"
                onError={() => setThumbnailError(true)}
              />
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/15 via-transparent to-transparent" />
            </div>
          </div>
        )}

        <div className="max-w-[780px] mx-auto px-6 py-10">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-5">
            {breadcrumb.map((b, idx) => {
              const isLast = idx === breadcrumb.length - 1;
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

          {/* Back */}
          <Link href="/posts"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-violet-600 transition-colors mb-6">
            <ArrowLeft size={14} /> Quay lại blog
          </Link>

          {/* Meta */}
          <div className="flex items-center gap-3 mb-4">
            {post.category && (
              <span className="bg-violet-100 text-violet-700 text-xs font-bold px-3 py-1 rounded-full">
                {post.category.name}
              </span>
            )}
            {post.city && (
              <span className="flex items-center gap-1 text-gray-400 text-xs">
                <MapPin size={11} /> {post.city.name}
              </span>
            )}
            <span className="flex items-center gap-1 text-gray-400 text-xs">
              <Clock size={11} /> {formatDate(post.createdAt)}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4 leading-tight"
            style={{ letterSpacing: '-0.03em' }}>
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg text-gray-500 mb-8 pb-8 border-b border-gray-100 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Content */}
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
            dangerouslySetInnerHTML={{ __html: formatPostContent(post.content) }}
          />

          {/* CTA */}
          {post.city && (
            <div className="mt-12 p-6 bg-violet-50 rounded-2xl border border-violet-100 text-center">
              <p className="text-violet-800 font-bold text-lg mb-2">
                Muốn khám phá {post.city.name}?
              </p>
              <p className="text-violet-600 text-sm mb-4">
                Tìm và đặt phòng khách sạn tốt nhất tại {post.city.name}
              </p>
              <Link href={`/hotels?cityId=${post.city.id}`}
                className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors">
                Xem khách sạn tại {post.city.name}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}