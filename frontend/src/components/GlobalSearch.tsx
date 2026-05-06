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
  hotel: { icon: Hotel,    label: 'Khách sạn', color: 'text-violet-500', bg: 'bg-violet-50' },
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

    Promise.all([
      api.get('/cities'),
      api.get(`/hotels?search=${q}&limit=4`),
      api.get(`/posts?search=${q}&limit=3`),
    ]).then(([citiesRes, hotelsRes, postsRes]) => {
      const cities = (citiesRes.data as any[])
        .filter((c) => c.name.toLowerCase().includes(debouncedQuery.toLowerCase()))
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
  <div ref={wrapperRef} className={`relative w-full flex justify-center ${className}`}>
    <form onSubmit={handleSubmit} className="w-full max-w-[640px]">
      
      {/* INPUT GLASS */}
      <div className="relative group">
        <Search
          size={iconSize}
          className="absolute left-5 top-1/2 -translate-y-1/2 text-white/60 group-hover:text-white transition"
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
          className={`
            w-full ${sizeClass} pr-12
            
            bg-white/10
            backdrop-blur-xl
            
            border border-white/20
            rounded-full
            
            text-white
            placeholder:text-white/50
            
            shadow-[0_8px_30px_rgba(0,0,0,0.35)]
            
            focus:outline-none
            focus:bg-white/15
            focus:border-white/30
            
            transition-all duration-300
          `}
        />

        {/* RIGHT ICON */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {loading && (
            <Loader2 size={14} className="text-white/60 animate-spin" />
          )}

          {query && !loading && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
                setOpen(false);
              }}
              className="p-1 rounded-full hover:bg-white/20 transition"
            >
              <X size={14} className="text-white/70" />
            </button>
          )}
        </div>
      </div>
    </form>

    {/* DROPDOWN GLASS */}
    {open && (
      <div
        className="
        absolute top-full mt-3
        w-full max-w-[640px]
        bg-white/10
        backdrop-blur-2xl
        border border-white/20
        rounded-2xl
        shadow-[0_20px_60px_rgba(0,0,0,0.5)]
        z-[100]
        overflow-hidden
      "
      >
        {/* Scrollable results area */}
        <div
          className="max-h-[340px] overflow-y-auto"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.25) transparent' }}
        >
          {(Object.entries(grouped) as Array<[SearchResult['type'], SearchResult[]]>)
            .filter(([, items]) => items.length > 0)
            .map(([type, items]) => {
              const cfg = TYPE_CONFIG[type];
              const Icon = cfg.icon;

              return (
                <div key={type}>
                  {/* HEADER — sticky within scroll */}
                  <div className="sticky top-0 flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border-b border-white/10">
                    <Icon size={12} className="text-white/70" />
                    <span className="text-xs font-semibold text-white/60 uppercase">
                      {cfg.label}
                    </span>
                  </div>

                  {/* ITEMS */}
                  {items.map((result) => {
                    globalIdx++;
                    const idx = globalIdx;
                    const isActive = activeIdx === idx;

                    return (
                      <button
                        key={result.id}
                        onMouseEnter={() => setActiveIdx(idx)}
                        onClick={() => handleSelect(result)}
                        className={`
                          w-full flex items-center gap-3 px-4 py-3 text-left
                          transition-all
                          ${isActive ? 'bg-white/20' : 'hover:bg-white/10'}
                        `}
                      >
                        {/* IMAGE */}
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
                          {result.image ? (
                            <img
                              src={result.image}
                              alt={result.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Icon size={15} className="text-white/70" />
                          )}
                        </div>

                        {/* TEXT */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {result.name}
                          </p>
                          {result.sub && (
                            <p className="text-xs text-white/60 flex items-center gap-1">
                              <MapPin size={10} /> {result.sub}
                            </p>
                          )}
                        </div>

                        <ArrowRight
                          size={13}
                          className={`transition ${
                            isActive ? 'opacity-100 text-white' : 'opacity-0'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              );
            })}
        </div>

        {/* FOOTER — nằm ngoài scroll, luôn hiện */}
        <div className="border-t border-white/10 px-4 py-2">
          <button
            onClick={handleSubmit as any}
            className="w-full text-xs text-white/70 hover:text-white font-medium py-1"
          >
            Xem tất cả kết quả cho "{query}"
          </button>
        </div>
      </div>
    )}

    {/* EMPTY */}
    {open && query.length >= 2 && !loading && results.length === 0 && (
      <div
        className="
        absolute top-full mt-3
        w-full max-w-[640px]
        
        bg-white/10 backdrop-blur-xl
        border border-white/20
        rounded-2xl
        shadow-xl
        
        px-4 py-6 text-center
      "
      >
        <p className="text-white/80 text-sm font-medium">
          Không tìm thấy "{query}"
        </p>
        <p className="text-white/50 text-xs mt-1">
          Thử từ khoá khác
        </p>
      </div>
    )}
  </div>
);
}
