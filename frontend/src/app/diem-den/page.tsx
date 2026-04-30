'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import api from '@/lib/axios';

type City = { id: string; name: string; slug: string; country: string; image?: string };

export default function DestinationsIndexPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/cities')
      .then((r) => setCities(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-[72px]">
        <div className="max-w-[1200px] mx-auto px-6 py-10">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2" style={{ letterSpacing: '-0.03em' }}>
            Điểm đến hấp dẫn
          </h1>
          <p className="text-gray-500 mb-8">
            Chọn một tỉnh/thành để xem bài viết theo đúng URL dạng <code className="font-mono bg-gray-100 px-1 rounded">/ha-noi</code>.
          </p>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {cities.map((c) => (
                <Link
                  key={c.id}
                  href={`/${c.slug}`}
                  className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-all"
                >
                  <p className="font-semibold text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{c.country}</p>
                  <p className="text-xs text-gray-400 font-mono mt-2">/{c.slug}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

