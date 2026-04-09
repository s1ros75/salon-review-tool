"use client";

import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    staffName: "",
    menu: "",
    rating: 0,
    goodPoints: "",
    improvements: "",
  });
  const [generatedReview, setGeneratedReview] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setGeneratedReview(data.reviewText);
      setShowResult(true);
    } catch (error) {
      alert("口コミ生成に失敗しました");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/submit-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, reviewText: generatedReview }),
      });
      if (response.ok) {
        if (formData.rating >= 4) {
          // クリップボードにコピー
          await navigator.clipboard.writeText(generatedReview);
          alert("口コミ文をクリップボードにコピーしました！\nGoogleマップに貼り付けて投稿してください。");
          const googleUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_REVIEW_URL || "#";
          window.location.href = googleUrl;
        } else {
          alert("フィードバックを送信しました。ありがとうございます！");
          window.location.reload();
        }
      }
    } catch (error) {
      alert("送信に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showResult) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs tracking-widest text-gray-400 uppercase mb-1">Review</p>
            <h2 className="text-2xl font-light text-gray-800 tracking-wide">口コミ文が生成されました</h2>
            <div className="w-12 h-px bg-gray-300 mx-auto mt-4"></div>
          </div>

          <div className="bg-white border border-gray-200 p-6 mb-6">
            <textarea
              value={generatedReview}
              onChange={(e) => setGeneratedReview(e.target.value)}
              className="w-full min-h-[150px] p-3 border border-gray-200 resize-none text-gray-700 text-sm leading-relaxed focus:outline-none focus:border-gray-400"
            />
            <p className="text-xs text-gray-400 mt-2">内容は編集できます</p>
          </div>

          {formData.rating >= 4 ? (
            <div>
              <p className="text-sm text-gray-600 text-center mb-4">この内容でGoogleマップに投稿しますか？</p>
              <button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white text-sm tracking-widest py-4 transition disabled:opacity-50"
              >
                {isSubmitting ? "送信中..." : "Googleマップで投稿する ›"}
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 text-center mb-4">
                貴重なご意見をありがとうございます。オーナーに送信しますか？
              </p>
              <button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white text-sm tracking-widest py-4 transition disabled:opacity-50"
              >
                {isSubmitting ? "送信中..." : "フィードバックを送信 ›"}
              </button>
            </div>
          )}

          <button
            onClick={() => setShowResult(false)}
            className="w-full mt-4 text-sm text-gray-400 hover:text-gray-600 py-2 transition"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-10">
          <p className="text-xs tracking-widest text-gray-400 uppercase mb-1">Customer Survey</p>
          <h1 className="text-3xl font-light text-gray-800 tracking-wide">ご来店アンケート</h1>
          <div className="w-12 h-px bg-gray-300 mx-auto mt-4 mb-3"></div>
          <p className="text-sm text-gray-500 tracking-wide">ご感想をお聞かせください</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white border border-gray-200 p-8 mb-2">
            {/* 担当スタッフ */}
            <div className="mb-8">
              <label className="block text-xs tracking-widest text-gray-500 uppercase mb-3">
                担当スタッフ名 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.staffName}
                onChange={(e) => setFormData({ ...formData, staffName: e.target.value })}
                className="w-full px-0 py-2 border-0 border-b border-gray-200 focus:outline-none focus:border-gray-500 text-gray-700 text-sm bg-transparent placeholder-gray-300 transition"
                placeholder="例：山田 花子"
              />
            </div>

            {/* メニュー */}
            <div className="mb-8">
              <label className="block text-xs tracking-widest text-gray-500 uppercase mb-3">
                ご利用メニュー <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.menu}
                onChange={(e) => setFormData({ ...formData, menu: e.target.value })}
                className="w-full px-0 py-2 border-0 border-b border-gray-200 focus:outline-none focus:border-gray-500 text-gray-700 text-sm bg-transparent placeholder-gray-300 transition"
                placeholder="例：カット＋カラー"
              />
            </div>

            {/* 満足度 */}
            <div className="mb-8">
              <label className="block text-xs tracking-widest text-gray-500 uppercase mb-4">
                総合満足度 <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-3 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="text-3xl transition-transform hover:scale-110"
                  >
                    {star <= formData.rating ? "★" : "☆"}
                  </button>
                ))}
              </div>
              {formData.rating > 0 && (
                <p className="text-center text-xs text-gray-400 mt-2 tracking-widest">{formData.rating} / 5</p>
              )}
            </div>

            {/* 良かった点 */}
            <div className="mb-8">
              <label className="block text-xs tracking-widest text-gray-500 uppercase mb-3">
                良かった点 <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                value={formData.goodPoints}
                onChange={(e) => setFormData({ ...formData, goodPoints: e.target.value })}
                className="w-full px-0 py-2 border-0 border-b border-gray-200 focus:outline-none focus:border-gray-500 text-gray-700 text-sm bg-transparent placeholder-gray-300 resize-none transition"
                rows={3}
                placeholder="具体的に教えてください"
              />
            </div>

            {/* 改善点 */}
            <div className="mb-2">
              <label className="block text-xs tracking-widest text-gray-500 uppercase mb-3">
                改善点 <span className="text-xs text-gray-300 normal-case tracking-normal">（任意）</span>
              </label>
              <textarea
                value={formData.improvements}
                onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
                className="w-full px-0 py-2 border-0 border-b border-gray-200 focus:outline-none focus:border-gray-500 text-gray-700 text-sm bg-transparent placeholder-gray-300 resize-none transition"
                rows={3}
                placeholder="より良いサービスのために"
              />
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center mb-6 tracking-wide">
            ご入力いただいた情報は、サービス改善のために利用いたします。
          </p>

          <button
            type="submit"
            disabled={isGenerating || formData.rating === 0}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white text-sm tracking-widest py-4 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isGenerating ? "生成中..." : "口コミ文を生成する ›"}
          </button>
        </form>
      </div>
    </div>
  );
}
