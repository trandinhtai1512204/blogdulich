'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import api from '@/lib/axios';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  useEffect(() => {
    api.get(`/posts/${slug}`)
      .then((r) => {
        const post = r.data;
        const url = post.category?.slug
          ? `/${post.category.slug}/${post.slug}`
          : '/';
        router.replace(url);
      })
      .catch(() => router.replace('/'));
  }, [slug]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex items-center justify-center pt-40 text-sm text-gray-400">
        Đang chuyển hướng...
      </div>
    </div>
  );
}
