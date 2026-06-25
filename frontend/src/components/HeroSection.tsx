'use client';

import { Search } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { GlobalSearch } from '@/components/GlobalSearch';

export function HeroSection() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const enterTransition = {
    duration: 0.72,
    ease: [0.16, 1, 0.3, 1] as const,
  };

  return (
    <section className="relative flex min-h-[calc(100svh-86px)] w-full flex-col items-center justify-center px-4 pb-10 pt-24 md:min-h-[calc(100dvh-96px)] md:px-6 md:pb-14">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[55%] h-[58%] w-[76%] max-w-[980px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.36)_0%,rgba(255,255,255,0.18)_46%,rgba(255,255,255,0)_74%)]"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      />
      <div className="relative z-10 mx-auto w-full max-w-3xl text-center">
        <motion.p
          className="mb-4 text-xs font-extrabold uppercase tracking-[0.26em] text-[#F37021]"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...enterTransition, delay: 0.05 }}
        >
          Cẩm nang du lịch Việt Nam
        </motion.p>
        <motion.h1
          className="text-5xl font-extrabold leading-[1.05] tracking-tight text-[#0A2D5B] md:text-6xl lg:text-7xl"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...enterTransition, delay: 0.14 }}
        >
          Blog du lịch <span className="text-[#F37021]">Việt Nam</span>
        </motion.h1>
        <motion.p
          className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#0A2D5B]/75 md:text-lg"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...enterTransition, delay: 0.23 }}
        >
          Kinh nghiệm du lịch, review điểm đến và lịch trình khám phá Việt Nam từ BlogDuLich.vn.
        </motion.p>

        <motion.div
          className="relative mx-auto mt-9 w-full max-w-xl"
          initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...enterTransition, delay: 0.32 }}
        >
          <GlobalSearch
            size="lg"
            placeholder="Tìm thành phố, khách sạn..."
            className="w-full"
          />

          <button
            onClick={() => router.push('/hotels')}
            className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#0A2D5B] shadow-lg transition-all hover:scale-105 hover:bg-[#0A2D5B]/90 active:scale-95"
            aria-label="Tìm kiếm"
          >
            <Search size={20} className="text-white" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
