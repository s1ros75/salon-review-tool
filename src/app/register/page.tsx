'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [salonName, setSalonName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !salonName) {
      setError('すべての項目を入力してください');
      return;
    }
    setLoading(true);
    setError('');

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { salon_name: salonName },
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        setError("このメールアドレスはすでに登録されています");
      } else if (error.message.includes("password")) {
        setError("パスワードは6文字以上で入力してください");
      } else {
        setError("登録に失敗しました。もう一度お試しください");
      }
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-center mb-8">
            <p className="text-xs tracking-widest text-gray-400 uppercase mb-1">Complete</p>
            <h1 className="text-2xl font-light text-gray-800 tracking-wide">登録完了</h1>
            <div className="w-12 h-px bg-gray-300 mx-auto mt-4"></div>
          </div>
          <div className="bg-white border border-gray-200 p-8 mb-2">
            <p className="text-sm text-gray-600 leading-relaxed">
              確認メールを送信しました。<br />
              メール内のリンクをクリックして<br />
              登録を完了してください。
            </p>
          </div>
          <a
            href="/login"
            className="block w-full bg-gray-800 hover:bg-gray-900 text-white text-sm tracking-widest py-4 mt-2 transition text-center"
          >
            ログインへ ›
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-xs tracking-widest text-gray-400 uppercase mb-1">Register</p>
          <h1 className="text-2xl font-light text-gray-800 tracking-wide">新規登録</h1>
          <div className="w-12 h-px bg-gray-300 mx-auto mt-4"></div>
        </div>

        <div className="bg-white border border-gray-200 p-8 mb-2">
          {/* サロン名 */}
          <div className="mb-6">
            <label className="block text-sm text-gray-700 font-medium mb-2">サロン名</label>
            <input
              type="text"
              value={salonName}
              onChange={(e) => setSalonName(e.target.value)}
              className="w-full px-3 py-3 border border-gray-200 focus:outline-none focus:border-gray-500 text-gray-700 text-sm bg-white placeholder-gray-300 transition"
              placeholder="例：Hair Salon ABC"
            />
          </div>

          {/* メールアドレス */}
          <div className="mb-6">
            <label className="block text-sm text-gray-700 font-medium mb-2">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-3 border border-gray-200 focus:outline-none focus:border-gray-500 text-gray-700 text-sm bg-white placeholder-gray-300 transition"
              placeholder="例：owner@salon.com"
            />
          </div>

          {/* パスワード */}
          <div className="mb-2">
            <label className="block text-sm text-gray-700 font-medium mb-2">パスワード（半角英数）</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                className="w-full px-3 py-3 border border-gray-200 focus:outline-none focus:border-gray-500 text-gray-700 text-sm bg-white placeholder-gray-300 transition pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-xs mt-4 tracking-wide">{error}</p>}
        </div>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-gray-800 hover:bg-gray-900 text-white text-sm tracking-widest py-4 mt-2 transition disabled:opacity-50"
        >
          {loading ? '登録中...' : '新規登録 ›'}
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          すでにアカウントをお持ちの方は
          <a href="/login" className="text-gray-600 hover:text-gray-800 ml-1">ログイン ›</a>
        </p>
      </div>
    </div>
  );
}
