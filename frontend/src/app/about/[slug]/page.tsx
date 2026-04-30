'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';

export default function AboutDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-[72px]">
        <div className="max-w-[900px] mx-auto px-6 py-10">
          <Link href="/about" className="text-sm text-gray-500 hover:text-violet-600 transition-colors">
            ← Quay lại Giới thiệu
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-4" style={{ letterSpacing: '-0.03em' }}>
            {slug.replace(/-/g, ' ')}
          </h1>
          <p className="text-gray-500 mt-3">
            Đây là trang nội dung tĩnh theo cấu trúc <code className="font-mono bg-gray-100 px-1 rounded">/about/[slug]</code>.
            Bước tiếp theo sẽ là đưa nội dung thật (hoặc kéo từ CMS).
          </p>
        </div>
      </div>
    </div>
  );
}

