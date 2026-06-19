'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Hotel, FileText, X, ArrowRight, Loader2 } from 'lucide-react';
import api from '@/lib/axios';


interface SearchResult {
  type: 'city' | 'hotel' | 'post';
  id: string;
  name: string;
  slug: string;
  sub?: string;
  image?: string;
  categorySlug?: string;
}

let citiesCache: any[] | null = null;

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const TYPE_CONFIG = {
  city:  { icon: MapPin,   label: 'Thành phố', color: 'text-blue-500',   bg: 'bg-blue-50' },
  hotel: { icon: Hotel,    label: 'Khách sạn', color: 'text-[#F37021]', bg: 'bg-[#F37021]/10' },
  post:  { icon: FileText, label: 'Bài viết',  color: 'text-green-500',  bg: 'bg-green-50' },
};

interface Props {
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function GlobalSearch({ placeholder = 'Tìm kiếm thành phố, khách sạn...', className = '', size = 'md' }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    const q = encodeURIComponent(debouncedQuery);
    const lq = debouncedQuery.toLowerCase();

    const fetchCities = citiesCache
      ? Promise.resolve(citiesCache)
      : api.get('/cities').then((r) => { citiesCache = r.data as any[]; return citiesCache; });

    Promise.all([
      fetchCities,
      api.get(`/hotels?search=${q}&limit=4`),
      api.get(`/posts?search=${q}&limit=3`),
    ]).then(([allCities, hotelsRes, postsRes]) => {
      const cities = (allCities as any[])
        .filter((c) => c.name.toLowerCase().includes(lq))
        .slice(0, 3)
        .map((c) => ({ type: 'city' as const, id: c.id, name: c.name, slug: c.slug, sub: c.country, image: c.image }));

      const hotels = (hotelsRes.data.data as any[]).slice(0, 4).map((h) => ({
        type: 'hotel' as const, id: h.id, name: h.name, slug: h.slug, sub: h.city?.name, image: h.images?.[0],
      }));

      const posts = (postsRes.data.data as any[]).slice(0, 3).map((p) => ({
        type: 'post' as const, id: p.id, name: p.title, slug: p.slug, sub: p.city?.name, image: p.thumbnail,
        categorySlug: p.category?.slug as string | undefined,
      }));

      const combined = [...cities, ...hotels, ...posts];
      setResults(combined);
      setOpen(combined.length > 0);
    }).finally(() => setLoading(false));
  }, [debouncedQuery]);

  const getHref = (r: SearchResult) => {
    if (r.type === 'city') return `/${r.slug}`;
    if (r.type === 'hotel') return `/hotels/${r.slug}`;
    return r.categorySlug ? `/${r.categorySlug}/${r.slug}` : `/posts/${r.slug}`;
  };

  const handleSelect = (result: SearchResult) => {
    setQuery('');
    setOpen(false);
    router.push(getHref(result));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, -1)); }
    else if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); handleSelect(results[activeIdx]); }
    else if (e.key === 'Escape') { setOpen(false); setActiveIdx(-1); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setOpen(false);
    router.push(`/hotels?search=${encodeURIComponent(query)}`);
  };

  const grouped: Record<SearchResult['type'], SearchResult[]> = { city: [], hotel: [], post: [] };
  results.forEach((r) => grouped[r.type].push(r));

  const sizeClass = size === 'lg' ? 'py-4 text-base pl-12' : size === 'sm' ? 'py-2 text-sm pl-10' : 'py-3 text-sm pl-11';
  const iconSize = size === 'lg' ? 18 : 15;

  let globalIdx = -1;

  return (
    <div ref={wrapperRef} className={`relative flex w-full justify-center ${className}`}>
      <form onSubmit={handleSubmit} className="w-full max-w-[640px]">
        <div className="group relative">
          <Search
            size={iconSize}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-[#0A2D5B]/40 transition group-focus-within:text-[#0A2D5B]/70"
          />

          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIdx(-1);
            }}
            onFocus={() => results.length > 0 && setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full ${sizeClass} rounded-full border border-[#0A2D5B]/12 bg-white pr-12 text-[#0A2D5B] shadow-[0_18px_60px_rgba(10,45,91,0.12)] transition-all duration-300 placeholder:text-[#0A2D5B]/45 focus:border-[#F37021]/50 focus:outline-none`}
          />

          <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2">
            {loading && <Loader2 size={14} className="animate-spin text-[#0A2D5B]/45" />}

            {query && !loading && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setOpen(false);
                }}
                className="rounded-full p-1 transition hover:bg-[#0A2D5B]/8"
              >
                <X size={14} className="text-[#0A2D5B]/55" />
              </button>
            )}
          </div>
        </div>
      </form>

      {open && (
        <div className="absolute top-full z-[100] mt-3 w-full max-w-[640px] overflow-hidden rounded-2xl border border-[#0A2D5B]/10 bg-white shadow-[0_24px_70px_rgba(10,45,91,0.20)]">
          <div
            className="max-h-[340px] overflow-y-auto"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(10,45,91,0.25) transparent' }}
          >
            {(Object.entries(grouped) as Array<[SearchResult['type'], SearchResult[]]>)
              .filter(([, items]) => items.length > 0)
              .map(([type, items]) => {
                const cfg = TYPE_CONFIG[type];
                const Icon = cfg.icon;

                return (
                  <div key={type}>
                    <div className="sticky top-0 flex items-center gap-2 border-b border-[#0A2D5B]/8 bg-[#0A2D5B]/[0.03] px-4 py-2 backdrop-blur-sm">
                      <Icon size={12} className="text-[#0A2D5B]/55" />
                      <span className="text-xs font-semibold uppercase text-[#0A2D5B]/55">
                        {cfg.label}
                      </span>
                    </div>

                    {items.map((result) => {
                      globalIdx++;
                      const idx = globalIdx;
                      const isActive = activeIdx === idx;

                      return (
                        <button
                          key={result.id}
                          onMouseEnter={() => setActiveIdx(idx)}
                          onClick={() => handleSelect(result)}
                          className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-all ${isActive ? 'bg-[#F37021]/10' : 'hover:bg-[#0A2D5B]/[0.04]'}`}
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0A2D5B]/5">
                            {result.image ? (
                              <img
                                src={result.image}
                                alt={result.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Icon size={15} className="text-[#0A2D5B]/45" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[#0A2D5B]">
                              {result.name}
                            </p>
                            {result.sub && (
                              <p className="flex items-center gap-1 text-xs text-[#0A2D5B]/55">
                                <MapPin size={10} /> {result.sub}
                              </p>
                            )}
                          </div>

                          <ArrowRight
                            size={13}
                            className={`transition ${isActive ? 'text-[#F37021] opacity-100' : 'opacity-0'}`}
                          />
                        </button>
                      );
                    })}
                  </div>
                );
              })}
          </div>

          <div className="border-t border-[#0A2D5B]/8 px-4 py-2">
            <button
              onClick={handleSubmit as any}
              className="w-full py-1 text-xs font-medium text-[#0A2D5B]/60 transition-colors hover:text-[#F37021]"
            >
              Xem tất cả kết quả cho &quot;{query}&quot;
            </button>
          </div>
        </div>
      )}

      {open && query.length >= 2 && !loading && results.length === 0 && (
        <div className="absolute top-full mt-3 w-full max-w-[640px] rounded-2xl border border-[#0A2D5B]/10 bg-white px-4 py-6 text-center shadow-[0_24px_70px_rgba(10,45,91,0.20)]">
          <p className="text-sm font-medium text-[#0A2D5B]">
            Không tìm thấy &quot;{query}&quot;
          </p>
          <p className="mt-1 text-xs text-[#0A2D5B]/50">
            Thử từ khoá khác
          </p>
        </div>
      )}
    </div>
  );
}
