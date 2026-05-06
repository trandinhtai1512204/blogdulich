'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, BookOpen, Clock } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import api from '@/lib/axios';

type CategoryType = 'destination' | 'itinerary' | 'review' | 'experience';

interface Category {
  id: string;
  type?: CategoryType | 'about';
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
    Promise.all([api.get('/categories'), api.get('/posts?limit=200')])
      .then(([catRes, postRes]) => {
        const rows: Category[] = catRes.data ?? [];
        const posts: Post[] = postRes.data?.data ?? [];
        const counts: Record<CategoryType, number> = {
          destination: 0,
          itinerary: 0,
          review: 0,
          experience: 0,
        };
        const categoryTypeById = new Map<string, CategoryType>();
        rows.forEach((cat) => {
          if (!cat.type || cat.type === 'about') return;
          counts[cat.type] += 1;
          categoryTypeById.set(cat.id, cat.type);
        });
        setTypeCounts(counts);

        const grouped: Record<CategoryType, Post[]> = {
          destination: [],
          itinerary: [],
          review: [],
          experience: [],
        };
        posts.forEach((post) => {
          const type = post.category?.id ? categoryTypeById.get(post.category.id) : undefined;
          if (!type) return;
          grouped[type].push(post);
        });
        (Object.keys(grouped) as CategoryType[]).forEach((type) => {
          grouped[type].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
          grouped[type] = grouped[type].slice(0, 10);
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
                        href={post.category?.slug ? `/${post.category.slug}/${post.slug}` : `/posts/${post.slug}`}
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
                              <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
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

      {/* ── FOOTER ── */}
      <footer className="mt-8 bg-gray-950 text-white/70">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-10 md:py-14">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-7 md:gap-12 mb-8 md:mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-violet-500 to-purple-700 flex items-center justify-center">
                  <span className="text-white text-sm">✈</span>
                </div>
                <span className="text-white text-lg font-bold">tripviet</span>
              </div>
              <p className="text-sm leading-relaxed max-w-[220px]">Cách thông minh để khám phá Việt Nam.</p>
            </div>
            {Object.entries({
              'Công ty': ['Về chúng tôi', 'Tuyển dụng', 'Blog', 'Liên hệ'],
              'Chuyên mục': ['Điểm đến', 'Lịch trình', 'Review', 'Kinh nghiệm'],
              'Hỗ trợ': ['Trung tâm hỗ trợ', 'Chính sách hủy', 'An toàn', 'Liên hệ'],
              'Pháp lý': ['Chính sách BM', 'Điều khoản', 'Cookie', 'Trợ năng'],
            }).map(([section, links]) => (
              <div key={section}>
                <p className="text-white text-sm mb-4 font-semibold">{section}</p>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link}><a href="#" className="text-sm hover:text-white transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-5 md:pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
            <p className="text-xs">© 2026 BlogDuLich.vn. All rights reserved.</p>
            <p className="text-xs">Việt Nam · VND</p>
          </div>
        </div>
      </footer>
    </div>
  );
}