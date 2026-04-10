'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-400 tracking-widest">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs tracking-widest text-gray-400 uppercase mb-1">Dashboard</p>
          <h1 className="text-3xl font-light text-gray-800 tracking-wide">ダッシュボード</h1>
          <div className="w-12 h-px bg-gray-300 mx-auto mt-4 mb-3"></div>
          <p className="text-sm text-gray-400">{user?.user_metadata?.salon_name}</p>
        </div>

        <div className="bg-white border border-gray-200 p-8 mb-3">
          <div className="mb-6 pb-6 border-b border-gray-100">
            <p className="text-xs tracking-widest text-gray-400 uppercase mb-2">アカウント情報</p>
            <p className="text-sm text-gray-700">{user?.email}</p>
          </div>

          <div className="space-y-3">
            <a
              href="/admin"
              className="block w-full bg-gray-800 hover:bg-gray-900 text-white text-sm tracking-widest py-4 text-center transition"
            >
              レビュー管理画面へ ›
            </a>
            <a
              href="/"
              className="block w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm tracking-widest py-4 text-center transition"
            >
              アンケートページへ ›
            </a>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full text-xs tracking-widest text-gray-300 hover:text-gray-500 py-2 transition"
        >
          ログアウト ›
        </button>
      </div>
    </div>
  );
}
