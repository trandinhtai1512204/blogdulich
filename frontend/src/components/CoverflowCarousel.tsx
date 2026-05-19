'use client';

import { useCallback, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

export interface CoverflowItem {
  id: string;
  title: string;
  href: string;
  image?: string;
  province?: string;
  region?: string;
  tag?: string;
  description?: string;
  meta?: string;
}

interface CoverflowCarouselProps {
  items: CoverflowItem[];
  initialIndex?: number;
}

export function CoverflowCarousel({ items, initialIndex }: CoverflowCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex ?? Math.floor(items.length / 2));

  const prev = useCallback(() => setActiveIndex((i) => Math.max(0, i - 1)), []);
  const next = useCallback(
    () => setActiveIndex((i) => Math.min(items.length - 1, i + 1)),
    [items.length],
  );

  const getCardStyle = (index: number): CSSProperties => {
    const offset = index - activeIndex;
    const abs = Math.abs(offset);

    if (abs > 2) {
      return {
        opacity: 0,
        pointerEvents: 'none',
        zIndex: 0,
        transform: 'translate(-50%, -50%) scale(0.5)',
      };
    }

    const txMap = [0, 285, 525];
    const tx = offset < 0 ? -txMap[abs] : txMap[abs];
    const scale = [1, 0.81, 0.65][abs];
    const opacity = abs === 2 ? 0.34 : 1;
    const rotateY = -offset * 9;

    return {
      transform: `translate(calc(-50% + ${tx}px), -50%) scale(${scale}) rotateY(${rotateY}deg)`,
      opacity,
      zIndex: 10 - abs,
      transition:
        'transform 0.52s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.52s ease, box-shadow 0.52s ease',
      cursor: abs > 0 ? 'pointer' : 'default',
      pointerEvents: 'auto',
      boxShadow:
        abs === 0
          ? '0 32px 80px rgba(124, 58, 237, 0.18), 0 8px 24px rgba(0,0,0,0.12)'
          : abs === 1
            ? '0 12px 40px rgba(0,0,0,0.1)'
            : '0 4px 16px rgba(0,0,0,0.06)',
    };
  };

  if (items.length === 0) return null;

  return (
    <div className="relative select-none">
      <div className="sm:hidden">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group w-[82vw] shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
              style={{ scrollSnapAlign: 'start' }}
            >
              <CoverflowImage item={item} height={192} />
              <div className="p-4">
                <CoverflowMeta item={item} />
                <h3 className="line-clamp-2 text-lg font-extrabold leading-tight text-gray-950 group-hover:text-violet-700">
                  {item.title}
                </h3>
                {item.description && <p className="mt-2 line-clamp-2 text-sm text-gray-500">{item.description}</p>}
                {item.meta && (
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
                    <BookOpen size={12} /> {item.meta}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="relative hidden sm:block">
        <button
          type="button"
          onClick={prev}
          disabled={activeIndex === 0}
          className="absolute left-0 top-1/2 z-20 flex size-12 -translate-y-[calc(50%+24px)] items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-35"
          aria-label="Bai truoc"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          type="button"
          onClick={next}
          disabled={activeIndex === items.length - 1}
          className="absolute right-0 top-1/2 z-20 flex size-12 -translate-y-[calc(50%+24px)] items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-35"
          aria-label="Bai tiep theo"
        >
          <ChevronRight size={20} />
        </button>

        <div
          className="relative h-[520px] overflow-hidden"
          style={{ perspective: '1100px', perspectiveOrigin: '50% 50%' }}
        >
          {items.map((item, index) => {
            const offset = index - activeIndex;
            if (Math.abs(offset) > 2) return null;

            return (
              <Link
                key={item.id}
                href={item.href}
                className="absolute left-1/2 top-1/2 w-[380px] overflow-hidden rounded-3xl bg-white"
                style={getCardStyle(index)}
                onClick={(event) => {
                  if (Math.abs(offset) > 0) {
                    event.preventDefault();
                    setActiveIndex(index);
                  }
                }}
              >
                <CoverflowImage item={item} height={280} overlay />
                <div className="px-[22px] pb-[22px] pt-5">
                  {item.region && (
                    <div className="mb-1.5 text-[13px] font-bold uppercase tracking-[0.05em] text-violet-600">
                      {item.region}
                    </div>
                  )}
                  <h3 className="mb-2 text-xl font-bold leading-[1.3] tracking-tight text-gray-950">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="mb-4 line-clamp-2 text-[13px] leading-[1.6] text-gray-500">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    {item.meta && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <BookOpen size={13} />
                        {item.meta}
                      </div>
                    )}
                    <span className="flex items-center gap-1 text-[13px] font-semibold text-violet-600">
                      Kh&aacute;m ph&aacute; <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
                {Math.abs(offset) > 0 && (
                  <div
                    className="pointer-events-none absolute inset-0 bg-white"
                    style={{ opacity: Math.abs(offset) === 1 ? 0.28 : 0.55 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="mt-7 flex items-center justify-center gap-1.5">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Slide ${index + 1}`}
              className="h-2 rounded-full border-0 p-0 transition-all duration-300"
              style={{
                width: index === activeIndex ? 32 : 8,
                background: index === activeIndex ? '#7C3AED' : '#D1D5DB',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CoverflowImage({
  item,
  height,
  overlay = false,
}: {
  item: CoverflowItem;
  height: number;
  overlay?: boolean;
}) {
  return (
    <div className="relative overflow-hidden bg-violet-50" style={{ height }}>
      {item.image ? (
        <img src={item.image} alt={item.title} className="block h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <BookOpen size={34} className="text-violet-200" />
        </div>
      )}
      {overlay && <div className="absolute inset-0 bg-linear-to-t from-black/35 to-transparent" />}
      {item.province && (
        <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-gray-700 backdrop-blur">
          <MapPin size={10} className="text-violet-600" />
          {item.province}
        </div>
      )}
      {item.tag && (
        <div className="absolute bottom-3.5 left-4 rounded-full bg-violet-600 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white">
          {item.tag}
        </div>
      )}
    </div>
  );
}

function CoverflowMeta({ item }: { item: CoverflowItem }) {
  if (!item.province && !item.region) return null;

  return (
    <div className="mb-2 flex items-center gap-2">
      {item.province && (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600">
          <MapPin size={11} />
          {item.province}
        </span>
      )}
      {item.region && <span className="text-xs text-gray-400">{item.region}</span>}
    </div>
  );
}
