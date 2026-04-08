'use client';

import { useState } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    staffName: '',
    menu: '',
    rating: 0,
    goodPoints: '',
    improvements: ''
  });
  const [generatedReview, setGeneratedReview] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      setGeneratedReview(data.reviewText);
      setShowResult(true);
    } catch (error) {
      alert('口コミ生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/submit-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          reviewText: generatedReview
        })
      });

      if (response.ok) {
        if (formData.rating >= 4) {
          // Googleマップへ遷移
          const googleUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_REVIEW_URL || '#';
          window.location.href = googleUrl;
        } else {
          alert('フィードバックを送信しました。ありがとうございます！');
          window.location.reload();
        }
      }
    } catch (error) {
      alert('送信に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              口コミ文が生成されました
            </h2>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <textarea
                value={generatedReview}
                onChange={(e) => setGeneratedReview(e.target.value)}
                className="w-full min-h-[150px] p-3 border border-gray-300 rounded-lg resize-none"
              />
              <p className="text-sm text-gray-500 mt-2">
                内容は編集できます
              </p>
            </div>

            {formData.rating >= 4 ? (
              <div>
                <p className="text-gray-700 mb-4">
                  この内容でGoogleマップに投稿しますか？
                </p>
                <button
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition disabled:opacity-50"
                >
                  {isSubmitting ? '送信中...' : 'Googleマップで投稿する'}
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-700 mb-4">
                  貴重なご意見をありがとうございます。オーナーに送信しますか？
                </p>
                <button
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl transition disabled:opacity-50"
                >
                  {isSubmitting ? '送信中...' : 'フィードバックを送信'}
                </button>
              </div>
            )}

            <button
              onClick={() => setShowResult(false)}
              className="w-full mt-4 text-gray-600 hover:text-gray-800 py-2"
            >
              戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            ご来店アンケート
          </h1>
          <p className="text-gray-600 text-center mb-6">
            ご感想をお聞かせください
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 担当スタッフ */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                担当スタッフ名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.staffName}
                onChange={(e) => setFormData({...formData, staffName: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="山田 太郎"
              />
            </div>

            {/* メニュー */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                ご利用メニュー <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.menu}
                onChange={(e) => setFormData({...formData, menu: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="カット＋カラー"
              />
            </div>

            {/* 満足度 */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                総合満足度 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({...formData, rating: star})}
                    className="text-4xl transition-transform hover:scale-110"
                  >
                    {star <= formData.rating ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
              {formData.rating > 0 && (
                <p className="text-center text-gray-600 mt-2">
                  {formData.rating}/5
                </p>
              )}
            </div>

            {/* 良かった点 */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                良かった点 <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.goodPoints}
                onChange={(e) => setFormData({...formData, goodPoints: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                rows={4}
                placeholder="具体的に教えてください"
              />
            </div>

            {/* 改善点 */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                改善点（任意）
              </label>
              <textarea
                value={formData.improvements}
                onChange={(e) => setFormData({...formData, improvements: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="より良いサービスのために"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating || formData.rating === 0}
