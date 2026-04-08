'use client';

import { useState, useEffect } from 'react';

interface Review {
  id: string;
  staffName: string;
  menu: string;
  rating: number;
  goodPoints: string;
  improvements?: string;
  reviewText: string;
  type: 'google' | 'feedback';
  createdAt: string;
}

export default function AdminPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/submit-review');
      const data = await response.json();
      setReviews(data.reverse()); // 新しい順
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = filter === 'all'
    ? reviews
    : reviews.filter(r => r.rating === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto pt-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">レビュー管理</h1>
          <p className="text-gray-600">全 {reviews.length} 件のレビュー</p>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              全て ({reviews.length})
            </button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => setFilter(rating)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === rating ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                ⭐ {rating} ({reviews.filter((r) => r.rating === rating).length})
              </button>
            ))}
          </div>
        </div>

        {/* レビュー一覧 */}
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">レビューがありません</div>
          ) : (
            filteredReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{"⭐".repeat(review.rating)}</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          review.type === "google" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {review.type === "google" ? "Google投稿" : "フィードバック"}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{new Date(review.createdAt).toLocaleString("ja-JP")}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">担当スタッフ</p>
                    <p className="font-semibold text-gray-800">{review.staffName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">メニュー</p>
                    <p className="font-semibold text-gray-800">{review.menu}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">生成された口コミ文</p>
                  <p className="bg-gray-50 p-3 rounded-lg text-gray-800">{review.reviewText}</p>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-500 mb-1">良かった点</p>
                  <p className="text-gray-700">{review.goodPoints}</p>
                </div>

                {review.improvements && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">改善点</p>
                    <p className="text-gray-700">{review.improvements}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* ホームへ戻るボタン */}
        <div className="mt-8 text-center">
          
            href="/"
            className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-xl transition">
            アンケートページへ戻る
          </a>
        </div>
    </div>
  );
}
