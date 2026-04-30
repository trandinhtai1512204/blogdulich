'use client';

import { Navbar } from '@/components/Navbar';

export default function ExperienceIndexPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-[72px]">
        <div className="max-w-[1100px] mx-auto px-6 py-10">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2" style={{ letterSpacing: '-0.03em' }}>
            Kinh nghiệm du lịch
          </h1>
          <p className="text-gray-500">
            Trang index theo cấu trúc mới. Bước tiếp theo mình sẽ gắn với tỉnh/thành và tiểu mục (tự túc, tháng 10, ...)
            để tạo đúng URL dạng <code className="font-mono bg-gray-100 px-1 rounded">/kinh-nghiem-du-lich-ha-noi/tu-tuc</code>.
          </p>
        </div>
      </div>
    </div>
  );
}

