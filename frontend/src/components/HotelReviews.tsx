'use client';

import { useEffect, useState } from 'react';
import { Star, ThumbsUp, Send, User } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/axios';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: { id: string; name?: string; email: string };
}

interface ReviewData {
  reviews: Review[];
  total: number;
  avg: number;
  distribution: Array<{ star: number; count: number }>;
}

interface Props {
  hotelId: string;
  hotelName: string;
}

function StarRating({ value, onChange, size = 20 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
          disabled={!onChange}
        >
          <Star
            size={size}
            className={`transition-colors ${
              star <= (hover || value)
                ? 'text-amber-400 fill-amber-400'
                : 'text-gray-200 fill-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function HotelReviews({ hotelId, hotelName }: Props) {
  const { user } = useAuthStore();
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/hotel/${hotelId}`);
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, [hotelId]);

  const handleSubmit = async () => {
    if (rating === 0) { setError('Vui lòng chọn số sao'); return; }
    setSubmitting(true); setError(''); setSuccess('');
    try {
      await api.post(`/reviews/hotel/${hotelId}`, { rating, comment });
      setSuccess('Cảm ơn bạn đã đánh giá!');
      setRating(0); setComment('');
      fetchReviews();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Gửi đánh giá thất bại');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Xoá đánh giá này?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      fetchReviews();
    } catch {}
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-6 bg-gray-200 rounded w-40" />
        <div className="h-20 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  const { reviews = [], total = 0, avg = 0, distribution = [] } = data || {};

  return (
    <div>
      <h2 className="text-gray-900 font-bold text-lg mb-5" style={{ letterSpacing: '-0.02em' }}>
        Đánh giá của khách
      </h2>

      {/* Summary */}
      {total > 0 && (
        <div className="flex items-start gap-8 p-5 bg-gray-50 rounded-2xl border border-gray-100 mb-6">
          {/* Average */}
          <div className="text-center flex-shrink-0">
            <p className="text-5xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.04em' }}>{avg}</p>
            <StarRating value={Math.round(avg)} size={16} />
            <p className="text-xs text-gray-400 mt-1">{total} đánh giá</p>
          </div>
          {/* Distribution */}
          <div className="flex-1 space-y-1.5">
            {distribution.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-4 text-right">{star}</span>
                <Star size={10} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-6 text-left">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write review */}
      {user ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
          <h3 className="font-semibold text-gray-800 text-sm mb-3">
            Viết đánh giá của bạn
          </h3>

          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1.5">Xếp hạng *</p>
            <StarRating value={rating} onChange={setRating} size={24} />
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={`Chia sẻ trải nghiệm của bạn tại ${hotelName}...`}
            rows={3}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
          />

          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          {success && <p className="text-green-600 text-xs mt-1">{success}</p>}

          <button onClick={handleSubmit} disabled={submitting || rating === 0}
            className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50">
            <Send size={13} />
            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </div>
      ) : (
        <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 mb-6 text-center">
          <p className="text-sm text-violet-600 font-medium">
            <a href="/login" className="underline">Đăng nhập</a> để viết đánh giá
          </p>
        </div>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
          <ThumbsUp size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">
                      {(review.user.name || review.user.email)[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {review.user.name || review.user.email.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating value={review.rating} size={13} />
                  {user?.id === review.user.id && (
                    <button onClick={() => handleDelete(review.id)}
                      className="text-xs text-red-400 hover:text-red-600 ml-2">
                      Xoá
                    </button>
                  )}
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-gray-600 leading-relaxed mt-2">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
