import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Mail, MapPin } from 'lucide-react';

export function Footer() {
  const exploreLinks: [string, string][] = [
    ['Bài mới nhất', '/posts'],
    ['Khách sạn', '/hotels'],
    ['Điểm đến nổi bật', '/diem-den'],
    ['Tất cả review', '/review'],
  ];

  return (
    <footer className="relative z-10 isolate overflow-hidden bg-[#142744] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[url('/footer-line-art-dragon.png')] bg-cover bg-no-repeat opacity-[0.28] blur-[1px] mix-blend-screen brightness-50 contrast-200 invert"
        style={{ backgroundPosition: 'center 35%' }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[#142744]/68" />

      <div className="mx-auto max-w-[1160px] px-4 pb-10 pt-8 md:px-6 md:pb-12 md:pt-10">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center">
              <Image src="/logo-white.png" alt="BlogDuLich.vn" width={623} height={120} className="h-9 w-auto object-contain" />
            </Link>
            <p className="mt-5 max-w-[360px] text-base font-medium leading-7 text-white/68">
              Cẩm nang du lịch Việt Nam với điểm đến, lịch trình, review và kinh nghiệm thực tế cho từng chuyến đi.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['Việt Nam', 'Review thật', 'Lịch trình gọn'].map((item) => (
                <span key={item} className="rounded-full border border-white/18 bg-white/[0.035] px-3.5 py-1.5 text-sm font-semibold text-white/72">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-4 text-base font-bold text-white">Chuyên mục</p>
            <ul className="space-y-3">
              {[
                ['Điểm đến', '/diem-den'],
                ['Lịch trình', '/lich-trinh'],
                ['Review', '/review'],
                ['Kinh nghiệm', '/kinh-nghiem'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="inline-flex items-center gap-1 text-base font-medium text-white/64 transition-colors hover:text-[#F37021]">
                    {label}
                    <ArrowUpRight size={13} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-base font-bold text-white">Khám phá</p>
            <ul className="space-y-3">
              {exploreLinks.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-base font-medium text-white/64 transition-colors hover:text-[#F37021]">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-base font-bold text-white">Liên hệ</p>
            <div className="space-y-3.5 text-base font-medium text-white/64">
              <p className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-[#F37021]" />
                Việt Nam
              </p>
              <a href="mailto:hello@blogdulich.vn" className="flex items-center gap-2 transition-colors hover:text-[#F37021]">
                <Mail size={16} className="shrink-0 text-[#F37021]" />
                hello@blogdulich.vn
              </a>
            </div>
          </div>
        </div>

        <div className="mt-9 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <p>© 2026 BlogDuLich.vn. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {/* TODO: trang Chính sách / Điều khoản chưa tồn tại - nối route khi có. */}
            <a href="#" className="transition-colors hover:text-white">Chính sách bảo mật</a>
            <a href="#" className="transition-colors hover:text-white">Điều khoản</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
