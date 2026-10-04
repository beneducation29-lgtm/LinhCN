import React, { useState } from 'react';
import { LogIn, UserPlus, Loader2, Sparkles, Eye, EyeOff } from 'lucide-react';

type AuthMode = 'login' | 'register';

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthScreenProps {
  onAuthenticated: (user: AuthUser) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Không thể đăng nhập lúc này.');
      onAuthenticated(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FBFF] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-7">
          <div className="mx-auto w-16 h-16 rounded-3xl bg-[#3F6FF5] text-white flex items-center justify-center shadow-lg shadow-[#3F6FF5]/25">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-[#183B78]">Linh · AI Tutor</h1>
          <p className="mt-1.5 text-sm text-[#6B83AD]">Phòng luyện nói tiếng Trung cá nhân</p>
        </div>

        <div className="bg-white border border-[#E8EEF8] rounded-3xl shadow-[0_18px_60px_rgba(24,59,120,0.10)] p-6 sm:p-7">
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#F0F6FF] rounded-2xl mb-6">
            <button type="button" onClick={() => { setMode('login'); setError(''); }} className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === 'login' ? 'bg-white text-[#183B78] shadow-sm' : 'text-[#6B83AD]'}`}>
              Đăng nhập
            </button>
            <button type="button" onClick={() => { setMode('register'); setError(''); }} className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === 'register' ? 'bg-white text-[#183B78] shadow-sm' : 'text-[#6B83AD]'}`}>
              Đăng ký
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <label className="block">
                <span className="text-xs font-semibold text-[#183B78]">Tên hiển thị</span>
                <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} className="mt-1.5 w-full rounded-xl border border-[#DDE8F8] px-3.5 py-3 text-sm text-[#183B78] outline-none focus:border-[#3F6FF5] focus:ring-2 focus:ring-[#3F6FF5]/10" placeholder="Tên của bạn" />
              </label>
            )}
            <label className="block">
              <span className="text-xs font-semibold text-[#183B78]">Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="mt-1.5 w-full rounded-xl border border-[#DDE8F8] px-3.5 py-3 text-sm text-[#183B78] outline-none focus:border-[#3F6FF5] focus:ring-2 focus:ring-[#3F6FF5]/10" placeholder="you@example.com" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-[#183B78]">Mật khẩu</span>
              <div className="relative mt-1.5">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className="w-full rounded-xl border border-[#DDE8F8] px-3.5 py-3 pr-11 text-sm text-[#183B78] outline-none focus:border-[#3F6FF5] focus:ring-2 focus:ring-[#3F6FF5]/10" placeholder="Tối thiểu 8 ký tự" />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B83AD]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </label>

            {error && <div className="rounded-xl bg-red-50 border border-red-100 px-3.5 py-3 text-xs text-red-600">{error}</div>}

            <button disabled={loading} className="w-full rounded-xl bg-[#3F6FF5] hover:bg-[#3261e4] disabled:opacity-60 text-white py-3 font-semibold text-sm flex items-center justify-center gap-2 transition-all">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
            </button>
          </form>

          <p className="mt-5 text-[11px] leading-relaxed text-center text-[#8AA0C2]">
            Mỗi tài khoản có phiên đăng nhập và dữ liệu học tập riêng.
          </p>
        </div>
      </div>
    </div>
  );
};
