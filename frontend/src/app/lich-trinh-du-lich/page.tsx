'use client';

import { Navbar } from '@/components/Navbar';
import Link from 'next/link';

export default function ItinerariesIndexPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-[72px]">
        <div className="max-w-[1100px] mx-auto px-6 py-10">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2" style={{ letterSpacing: '-0.03em' }}>
            Lịch trình du lịch
          </h1>
          <p className="text-gray-500 mb-8">
            Trang index theo cấu trúc bạn đưa. Các tỉnh/thành sẽ hiển thị theo URL dạng{' '}
            <code className="font-mono bg-gray-100 px-1 rounded">/lich-trinh-du-lich-ha-noi</code> hoặc
            lọc theo <code className="font-mono bg-gray-100 px-1 rounded">/{'{citySlug}'}</code>.
          </p>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="font-semibold text-gray-900 mb-2">Đi nhanh</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/diem-den" className="px-4 py-2 rounded-full bg-violet-50 text-violet-700 text-sm font-semibold">
                Chọn điểm đến
              </Link>
              <Link href="/kinh-nghiem" className="px-4 py-2 rounded-full bg-violet-50 text-violet-700 text-sm font-semibold">
                Kinh nghiệm du lịch
              </Link>
              <Link href="/review" className="px-4 py-2 rounded-full bg-violet-50 text-violet-700 text-sm font-semibold">
                Review
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

