import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'BlogDuLich.vn - Blog du lịch Việt Nam',
  description: 'Điểm đến hấp dẫn, lịch trình, chi phí, review và kinh nghiệm du lịch khắp Việt Nam',
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
