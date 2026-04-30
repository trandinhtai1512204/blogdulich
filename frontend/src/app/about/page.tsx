'use client';

import Link from 'next/link';
import { Navbar } from '@/components/Navbar';

const ABOUT_LINKS = [
  { label: 'Hồ sơ năng lực Fab Travel', href: '/about/ho-so-nang-luc-fab-travel' },
  { label: 'Quy chế hoạt động', href: '/about/quy-che-hoat-dong' },
  { label: 'Fab Travel với báo chí', href: '/about/fab-travel-voi-bao-chi' },
  { label: 'Cam kết của Fab Travel', href: '/about/cam-ket-cua-fab-travel' },
  { label: 'Fab Travel tuyển dụng', href: '/about/fab-travel-tuyen-dung' },
  { label: 'Câu hỏi thường gặp', href: '/about/cau-hoi-thuong-gap' },
  { label: 'Hình thức thanh toán', href: '/about/hinh-thuc-thanh-toan' },
  { label: 'Liên hệ với Fab Travel', href: '/about/lien-he-voi-fab-travel' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-[72px]">
        <div className="max-w-[1100px] mx-auto px-6 py-10">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2" style={{ letterSpacing: '-0.03em' }}>
            Giới thiệu
          </h1>
          <p className="text-gray-500 mb-8">
            Trang tổng hợp các nội dung giới thiệu và thông tin doanh nghiệp.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ABOUT_LINKS.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all"
              >
                <p className="font-semibold text-gray-900">{i.label}</p>
                <p className="text-xs text-gray-400 font-mono mt-1">{i.href}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

