'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      setAuth(res.data.user, res.data.access_token);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — decorative */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #2d1b69 50%, #1a1040 100%)' }}>
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80"
            alt="Travel" className="w-full h-full object-cover opacity-20" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
              <span className="text-white text-sm">✈</span>
            </div>
            <span className="text-white text-xl font-bold">tripviet</span>
          </Link>
          <div>
            <h2 className="text-white text-4xl font-extrabold mb-4 leading-tight"
              style={{ letterSpacing: '-0.03em' }}>
              Bắt đầu hành trình<br />của bạn 🌏
            </h2>
            <p className="text-white/60 text-lg">
              Tạo tài khoản miễn phí và khám phá hàng trăm khách sạn tốt nhất Việt Nam.
            </p>
            <div className="mt-8 space-y-3">
              {[
                '✓ Đặt phòng nhanh chóng, thanh toán an toàn',
                '✓ Quản lý booking dễ dàng',
                '✓ Hỗ trợ 24/7',
              ].map((item) => (
                <p key={item} className="text-white/70 text-sm">{item}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
              <span className="text-white text-sm">✈</span>
            </div>
            <span className="text-gray-900 text-xl font-bold">tripviet</span>
          </Link>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-extrabold text-gray-900 mb-1"
                style={{ letterSpacing: '-0.03em' }}>Tạo tài khoản</h1>
              <p className="text-gray-500 text-sm">
                Đã có tài khoản?{' '}
                <Link href="/login" className="text-violet-600 font-semibold hover:underline">
                  Đăng nhập
                </Link>
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                <span>⚠</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Họ tên</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-colors"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-colors"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-colors"
                    placeholder="Tối thiểu 6 ký tự"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="relative my-5">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-gray-200" />
  </div>
  <div className="relative flex justify-center">
    <span className="bg-white px-3 text-xs text-gray-400">hoặc</span>
  </div>
</div>
 
<a href="http://localhost:3001/api/auth/google"
  className="flex items-center justify-center gap-3 w-full py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
    <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
    <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
    <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.31z"/>
  </svg>
  Tiếp tục với Google
</a>

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-90 active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <> Tạo tài khoản <ArrowRight size={14} /> </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400 mt-2">
                Bằng cách đăng ký, bạn đồng ý với{' '}
                <a href="#" className="text-violet-600 hover:underline">Điều khoản</a>
                {' '}và{' '}
                <a href="#" className="text-violet-600 hover:underline">Chính sách</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}