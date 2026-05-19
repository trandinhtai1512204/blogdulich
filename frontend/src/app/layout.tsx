import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Blog du lịch Việt Nam - BlogDuLich.vn | Kinh nghiệm, review, lịch trình',
  description: 'Blog du lịch Việt Nam chia sẻ điểm đến hấp dẫn, lịch trình, chi phí, review và kinh nghiệm du lịch khắp Việt Nam.',
  keywords: [
    'blog du lịch',
    'blog du lich',
    'BlogDuLich.vn',
    'blogdulich',
    'kinh nghiệm du lịch',
    'review du lịch',
    'lịch trình du lịch',
    'điểm đến Việt Nam',
  ],
  openGraph: {
    title: 'Blog du lịch Việt Nam - BlogDuLich.vn',
    description: 'Kinh nghiệm du lịch, review điểm đến và lịch trình khám phá Việt Nam.',
    url: 'https://blogdulich.vn',
    siteName: 'BlogDuLich.vn',
    locale: 'vi_VN',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
