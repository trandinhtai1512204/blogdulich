'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import api from '@/lib/axios';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  thumbnail?: string;
  createdAt: string;
  city?: { name: string; slug: string };
  category?: { name: string; slug: string; type?: string };
  canonicalUrl?: string;
}

interface Meta {
  total: number;
  totalPages: number;
  page: number;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, totalPages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('page', String(page));
      params.set('limit', '9');
      const res = await api.get(`/posts?${params}`);
      setPosts(res.data.data);
      setMeta(res.data.meta);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

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
    <div className="min-h-screen bg-[#F6F3EE]">
      <Navbar />

      {/* Header */}
      <div className="bg-[#F6F3EE] border-b border-[#0A2D5B]/10 pt-[72px]">
        <div className="max-w-[1280px] mx-auto px-6 py-10 text-center">
          <p className="text-violet-600 text-sm font-bold uppercase tracking-wider mb-2">Blog du lịch</p>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3" style={{ letterSpacing: '-0.03em' }}>
            Khám phá Việt Nam qua từng câu chuyện
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto mb-6">
            Những bài viết hay về điểm đến, kinh nghiệm du lịch và gợi ý khách sạn tốt nhất
          </p>
          <form onSubmit={handleSearch} className="flex gap-3 max-w-md mx-auto">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm bài viết..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 bg-white"
              />
            </div>
            <button type="submit"
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors">
              Tìm
            </button>
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1280px] mx-auto px-6 py-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có bài viết nào</h3>
            <p className="text-gray-500">Hãy quay lại sau nhé!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, index) => (
                <Link key={post.id} href={getPostHref(post)}
                  className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group ${
                    index === 0 ? 'md:col-span-2 lg:col-span-1' : ''
                  }`}>
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    {post.thumbnail ? (
                      <img src={post.thumbnail} alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center">
                        <BookOpen size={40} className="text-white/50" />
                      </div>
                    )}
                    {post.category && (
                      <div className="absolute top-3 left-3 bg-violet-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        {post.category.name}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {formatDate(post.createdAt)}
                      </span>
                      {post.city && (
                        <>
                          <span>·</span>
                          <span>📍 {post.city.name}</span>
                        </>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2 group-hover:text-violet-600 transition-colors"
                      style={{ letterSpacing: '-0.01em' }}>
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3">{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-1 text-violet-600 text-sm font-semibold">
                      Đọc thêm <ArrowRight size={13} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {[...Array(meta.totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                      page === i + 1
                        ? 'bg-violet-600 text-white'
                        : 'border border-gray-200 bg-white text-gray-600 hover:border-violet-300'
                    }`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
