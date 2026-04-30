'use client';

import Link from 'next/link';
import { Navbar } from '@/components/Navbar';

const REVIEW_TYPES = [
  { label: 'Review Tour Du Lịch', href: '/review-tour' },
  { label: 'Review Khách Sạn', href: '/review-khach-san' },
  { label: 'Review Combo', href: '/review-combo' },
  { label: 'Review Resort', href: '/review-resort' },
  { label: 'Review Du Thuyền', href: '/review-du-thuyen' },
  { label: 'Review Nhà Hàng', href: '/review-nha-hang' },
];

export default function ReviewIndexPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-[72px]">
        <div className="max-w-[1100px] mx-auto px-6 py-10">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2" style={{ letterSpacing: '-0.03em' }}>
            Review
          </h1>
          <p className="text-gray-500 mb-8">Chọn nhóm review theo đúng URL bạn yêu cầu.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REVIEW_TYPES.map((t) => (
              <Link key={t.href} href={t.href} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
                <p className="font-semibold text-gray-900">{t.label}</p>
                <p className="text-xs text-gray-400 font-mono mt-1">{t.href}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

