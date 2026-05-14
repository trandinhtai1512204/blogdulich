'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, ChevronLeft, ChevronRight, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import api from '@/lib/axios';

type CategoryType = 'destination' | 'itinerary' | 'review' | 'experience';

interface Category {
  id: string;
  type?: CategoryType;
}

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

const MAIN_CATEGORIES: Array<{
  type: CategoryType;
  label: string;
  href: string;
  description: string;
  emoji: string;
}> = [
  {
    type: 'destination',
    label: 'Điểm đến hấp dẫn',
    href: '/diem-den',
    description: 'Khám phá điểm đến theo tỉnh thành và chủ đề.',
    emoji: '🗺️',
  },
  {
    type: 'itinerary',
    label: 'Lịch trình du lịch',
    href: '/lich-trinh-du-lich',
    description: 'Gợi ý lịch trình theo ngày cho từng nơi.',
    emoji: '🧭',
  },
  {
    type: 'review',
    label: 'Review',
    href: '/review',
    description: 'Tổng hợp review tour, khách sạn, resort, du thuyền.',
    emoji: '⭐',
  },
  {
    type: 'experience',
    label: 'Kinh nghiệm du lịch',
    href: '/kinh-nghiem',
    description: 'Kinh nghiệm thực tế, mẹo đi tự túc theo mùa.',
    emoji: '🎒',
  },
];

export default function HomePage() {
  const [typeCounts, setTypeCounts] = useState<Record<CategoryType, number>>({
    destination: 0,
    itinerary: 0,
    review: 0,
    experience: 0,
  });
  const [loading, setLoading] = useState(true);
  const [postsByType, setPostsByType] = useState<Record<CategoryType, Post[]>>({
    destination: [],
    itinerary: [],
    review: [],
    experience: [],
  });
  const rowRefs = useRef<Record<CategoryType, HTMLDivElement | null>>({
    destination: null,
    itinerary: null,
    review: null,
    experience: null,
  });

  useEffect(() => {
    const types: CategoryType[] = ['destination', 'itinerary', 'review', 'experience'];
    Promise.all([
      api.get('/categories'),
      ...types.map((t) => api.get(`/posts?type=${t}&limit=10`)),
    ])
      .then(([catRes, ...postResults]) => {
        const rows: Category[] = catRes.data ?? [];
        const counts: Record<CategoryType, number> = {
          destination: 0, itinerary: 0, review: 0, experience: 0,
        };
        rows.forEach((cat) => { if (cat.type) counts[cat.type] += 1; });
        setTypeCounts(counts);

        const grouped = {} as Record<CategoryType, Post[]>;
        types.forEach((t, i) => {
          grouped[t] = postResults[i].data?.data ?? [];
        });
        setPostsByType(grouped);
      })
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const scrollRow = (type: CategoryType, dir: 'left' | 'right') => {
    rowRefs.current[type]?.scrollBy({ left: dir === 'left' ? -360 : 360, behavior: 'smooth' });
  };

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <HeroSection />

      {/* ── 5 DANH MỤC CHÍNH (KHÔNG HIỂN THỊ ABOUT) ── */}
      <section className="pt-8 md:pt-10 pb-6 px-3 md:px-4 max-w-[1000px] mx-auto ">
        <div className="space-y-5">
          {MAIN_CATEGORIES.map((item) => {
            const posts = postsByType[item.type];
            return (
              <div key={item.type} className="py-2">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div>
                    <p className="text-xl md:text-lg font-bold text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{typeCounts[item.type]} chuyên mục</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => scrollRow(item.type, 'left')}
                      className="w-8 h-8 rounded-full border border-gray-200 bg-white hover:border-violet-400 flex items-center justify-center transition-all shadow-sm"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollRow(item.type, 'right')}
                      className="w-8 h-8 rounded-full border border-gray-200 bg-white hover:border-violet-400 flex items-center justify-center transition-all shadow-sm"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-gray-50 rounded-xl animate-pulse" />)}
                  </div>
                ) : posts.length === 0 ? (
                  <div className="border border-dashed border-gray-200 rounded-xl p-7 text-center text-gray-500 text-sm">
                    Chưa có bài viết trong mục này.
                  </div>
                ) : (
                  <div
                    ref={(el) => { rowRefs.current[item.type] = el; }}
                    className="flex gap-3 md:gap-3 overflow-x-auto scrollbar-hide pb-1"
                    style={{ scrollSnapType: 'x mandatory' }}
                  >
                    {posts.map((post) => (
                      <Link
                        key={post.id}
                        href={post.canonicalUrl ?? (post.category?.slug ? `/${post.category.slug}/${post.slug}` : `/posts/${post.slug}`)}
                        className="shrink-0 w-[88vw] max-w-[340px] rounded-2xl overflow-hidden border border-gray-200 hover:shadow-sm transition-all bg-white"
                        style={{ scrollSnapAlign: 'start' }}
                      >
                        <div className="flex h-[132px] md:h-[140px]">
                          <div className="flex-1 min-w-0 p-3 md:p-4 flex flex-col justify-between">
                            <div>
                              <p className="font-bold text-gray-900 text-lg md:text-xl leading-tight line-clamp-2">{post.title}</p>
                              {post.excerpt && <p className="text-gray-500 text-sm mt-1 line-clamp-2">{post.excerpt}</p>}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="inline-flex items-center gap-1"><Clock size={11} />{formatDate(post.createdAt)}</span>
                              <span className="hidden sm:inline-flex items-center gap-1"><BookOpen size={11} />{post.category?.name || item.label}</span>
                            </div>
                          </div>
                          <div className="w-[140px] md:w-[150px] h-full shrink-0 bg-gray-100">
                            {post.thumbnail ? (
                              <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-4xl">
                                {item.emoji}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                <div className="mt-3">
                  <Link href={item.href} className="text-xs text-violet-600 hover:text-violet-700 font-semibold">
                    Xem trang {item.label.toLowerCase()}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-10 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-[1160px] px-4 py-10 md:px-6 md:py-12">
          <div className="grid gap-9 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 group">
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-sky-500 to-blue-700 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform select-none">
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
                    <Link href={href} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-sky-700 transition-colors">
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
                    <a href="#" className="text-sm text-gray-600 hover:text-sky-700 transition-colors">{item}</a>
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
                <a href="mailto:hello@blogdulich.vn" className="flex items-center gap-2 hover:text-sky-700 transition-colors">
                  <Mail size={16} className="shrink-0 text-sky-700" />
                  hello@blogdulich.vn
                </a>
                <a href="tel:+84000000000" className="flex items-center gap-2 hover:text-sky-700 transition-colors">
                  <Phone size={16} className="shrink-0 text-sky-700" />
                  +84 000 000 000
                </a>
              </div>
            </div>
          </div>

          <div className="mt-9 flex flex-col gap-3 border-t border-gray-200 pt-5 text-xs text-gray-500 md:flex-row md:items-center md:justify-between">
            <p>© 2026 BlogDuLich.vn. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-gray-900 transition-colors">Chính sách bảo mật</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Điều khoản</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
