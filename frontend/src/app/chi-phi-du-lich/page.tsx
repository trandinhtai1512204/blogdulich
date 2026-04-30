'use client';

import { Navbar } from '@/components/Navbar';

export default function CostsIndexPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-[72px]">
        <div className="max-w-[1100px] mx-auto px-6 py-10">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2" style={{ letterSpacing: '-0.03em' }}>
            Chi phí du lịch
          </h1>
          <p className="text-gray-500">
            Trang index theo cấu trúc mới. Bước tiếp theo mình sẽ gắn nó với taxonomy (tỉnh/thành + tiểu mục)
            để ra đúng URL như <code className="font-mono bg-gray-100 px-1 rounded">/chi-phi-du-lich-ha-noi/...</code>.
          </p>
        </div>
      </div>
    </div>
  );
}

