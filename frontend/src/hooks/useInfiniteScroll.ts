import { useEffect, useRef, useState, useCallback } from 'react';
import api from '@/lib/axios';

interface UseInfiniteScrollOptions {
  endpoint: string;
  params?: Record<string, string>;
  limit?: number;
}

export function useInfiniteScroll<T>({ endpoint, params = {}, limit = 9 }: UseInfiniteScrollOptions) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const paramsKey = JSON.stringify(params);

  // Reset khi params thay đổi
  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setInitialLoading(true);
  }, [paramsKey]);

  const fetchPage = useCallback(async (pageNum: number, reset = false) => {
    if (loading) return;
    setLoading(true);

    try {
      const searchParams = new URLSearchParams({
        ...params,
        page: String(pageNum),
        limit: String(limit),
      });

      const res = await api.get(`${endpoint}?${searchParams}`);
      const data = res.data.data ?? res.data;
      const meta = res.data.meta;

      setItems((prev) => reset ? data : [...prev, ...data]);
      setTotal(meta?.total ?? data.length);

      if (meta) {
        setHasMore(pageNum < meta.totalPages);
      } else {
        setHasMore(data.length === limit);
      }
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [endpoint, paramsKey, limit]);

  // Initial load
  useEffect(() => {
    fetchPage(1, true);
  }, [paramsKey]);

  // Load more khi scroll tới sentinel
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !initialLoading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPage(nextPage);
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore, loading, initialLoading, page, fetchPage]);

  return { items, loading, initialLoading, hasMore, total, sentinelRef };
}
