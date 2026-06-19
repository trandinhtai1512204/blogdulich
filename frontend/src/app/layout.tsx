import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import { Footer } from '@/components/Footer';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-be-vietnam-pro',
});

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
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
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png' }],
    other: [
      { rel: 'manifest', url: '/site.webmanifest' },
    ],
  },
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
    <html lang="vi" className={beVietnamPro.variable}>
      <body className="font-[family-name:var(--font-be-vietnam-pro)]">
        <Providers>
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
