import api from '@/lib/axios';

export type City = { id: string; name: string; slug: string };
export type Category = { id: string; name: string; slug: string };
export type PostListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  thumbnail?: string;
  createdAt: string;
  city?: City;
  category?: Category;
};

export async function fetchCityBySlug(slug: string): Promise<City> {
  const res = await api.get(`/cities/${slug}`);
  return { id: res.data.id, name: res.data.name, slug: res.data.slug };
}

/**
 * Backend currently lacks a dedicated `/categories` endpoint.
 * For now, resolve categories by scanning posts payload.
 */
export async function resolveCategoryBySlug(slug: string): Promise<Category | null> {
  const res = await api.get('/posts?limit=200');
  const posts: PostListItem[] = res.data.data ?? [];
  for (const p of posts) {
    if (p.category?.slug === slug) return p.category;
  }
  return null;
}

export async function fetchPostsByCityAndCategory(params: {
  cityId?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}) {
  const sp = new URLSearchParams();
  if (params.cityId) sp.set('cityId', params.cityId);
  if (params.categoryId) sp.set('categoryId', params.categoryId);
  sp.set('page', String(params.page ?? 1));
  sp.set('limit', String(params.limit ?? 12));
  const res = await api.get(`/posts?${sp.toString()}`);
  return res.data as { data: PostListItem[]; meta: { total: number; totalPages: number; page: number; limit: number } };
}

