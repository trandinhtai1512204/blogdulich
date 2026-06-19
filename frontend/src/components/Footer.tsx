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
    <footer className="relative z-10 mt-10 bg-white">
      <div className="mx-auto max-w-[1160px] px-4 py-10 md:px-6 md:py-12">
        <div className="grid gap-9 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center">
              <Image src="/logo-color.png" alt="BlogDuLich.vn" width={623} height={120} className="h-8 w-auto object-contain" />
            </Link>
            <p className="mt-4 max-w-[300px] text-sm leading-6 text-[#0A2D5B]/65">
              Cẩm nang du lịch Việt Nam với điểm đến, lịch trình, review và kinh nghiệm thực tế cho từng chuyến đi.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['Việt Nam', 'Review thật', 'Lịch trình gọn'].map((item) => (
                <span key={item} className="rounded-full border border-[#0A2D5B]/15 px-3 py-1 text-xs font-medium text-[#0A2D5B]/70">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-bold text-[#0A2D5B]">Chuyên mục</p>
            <ul className="space-y-2.5">
              {[
                ['Điểm đến', '/diem-den'],
                ['Lịch trình', '/lich-trinh'],
                ['Review', '/review'],
                ['Kinh nghiệm', '/kinh-nghiem'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="inline-flex items-center gap-1 text-sm text-[#0A2D5B]/65 transition-colors hover:text-[#F37021]">
                    {label}
                    <ArrowUpRight size={13} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-bold text-[#0A2D5B]">Khám phá</p>
            <ul className="space-y-2.5">
              {exploreLinks.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-[#0A2D5B]/65 transition-colors hover:text-[#F37021]">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-bold text-[#0A2D5B]">Liên hệ</p>
            <div className="space-y-3 text-sm text-[#0A2D5B]/65">
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

        <div className="mt-9 flex flex-col gap-3 pt-5 text-xs text-[#0A2D5B]/55 md:flex-row md:items-center md:justify-between">
          <p>© 2026 BlogDuLich.vn. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {/* TODO: trang Chính sách / Điều khoản chưa tồn tại - nối route khi có. */}
            <a href="#" className="transition-colors hover:text-[#0A2D5B]">Chính sách bảo mật</a>
            <a href="#" className="transition-colors hover:text-[#0A2D5B]">Điều khoản</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
