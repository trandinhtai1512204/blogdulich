'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import api from '@/lib/axios';

export type FaqTargetType = 'global' | 'category' | 'city' | 'post';
export type FaqModule = 'destination' | 'itinerary' | 'review' | 'experience';

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

type FaqSectionProps = {
  targetType: FaqTargetType;
  targetId?: string | null;
  module?: FaqModule;
  heading?: string;
  eyebrow?: string;
  className?: string;
};

export function FaqSection({
  targetType,
  targetId,
  module,
  heading = 'Những câu hỏi thường gặp',
  eyebrow = 'Câu hỏi thường gặp',
  className = '',
}: FaqSectionProps) {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({ targetType });
    if (targetId) params.set('targetId', targetId);
    if (module) params.set('module', module);

    let mounted = true;
    api.get(`/faqs/resolve?${params.toString()}`)
      .then((res) => {
        if (!mounted) return;
        setItems(res.data ?? []);
        setOpenIndex(null);
      })
      .catch(() => {
        if (!mounted) return;
        setItems([]);
        setOpenIndex(null);
      });

    return () => { mounted = false; };
  }, [targetType, targetId, module]);

  const jsonLd = useMemo(() => {
    if (items.length === 0) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <section className={`relative z-10 mx-auto max-w-[880px] px-4 py-14 md:px-6 ${className}`}>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <div className="mb-8 text-center">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#F37021]">
          {eyebrow}
        </p>
        <h2 className="text-2xl font-extrabold tracking-tight text-[#0A2D5B] md:text-3xl">
          {heading}
        </h2>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={item.id}
              className="overflow-hidden rounded-2xl bg-white/92 shadow-[0_14px_38px_rgba(10,45,91,0.08)] ring-1 ring-[#0A2D5B]/5 backdrop-blur-sm"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-bold leading-snug text-[#0A2D5B] md:text-base">
                  {item.question}
                </span>
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-[#F37021] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-sm font-medium leading-7 text-[#0A2D5B]/68">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
