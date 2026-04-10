"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

interface Review {
  id: string;
  staffName: string;
  menu: string;
  rating: number;
  goodPoints: string;
  improvements?: string;
  reviewText: string;
  type: "google" | "feedback";
  createdAt: string;
}

export default function AdminPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<number | "all">("all");
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepLogin, setKeepLogin] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = localStorage.getItem("admin_auth") || sessionStorage.getItem("admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchReviews();
  }, [isAuthenticated]);

  const handleExportCSV = () => {
    const headers = ["日時", "スタッフ名", "メニュー", "満足度", "種別", "良かった点", "改善点", "口コミ文"];
    const rows = reviews.map((r) => [
      new Date(r.createdAt).toLocaleString("ja-JP"),
      r.staffName,
      r.menu,
      r.rating,
      r.type === "google" ? "Google投稿" : "フィードバック",
      r.goodPoints,
      r.improvements || "",
      r.reviewText,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reviews_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 平均評価
  const averageRating =
    reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "0";

  // 評価別件数
  const ratingData = [5, 4, 3, 2, 1].map((rating) => ({
    rating: `${rating}★`,
    件数: reviews.filter((r) => r.rating === rating).length,
  }));

  // 月別件数
  const monthlyData = reviews
    .reduce(
      (acc, r) => {
        const month = new Date(r.createdAt).toLocaleDateString("ja-JP", { year: "numeric", month: "short" });
        const existing = acc.find((d) => d.month === month);
        if (existing) {
          existing.件数++;
        } else {
          acc.push({ month, 件数: 1 });
        }
        return acc;
      },
      [] as { month: string; 件数: number }[],
    )
    .slice(-6);

  // スタッフ別集計
  const staffData = reviews
    .reduce(
      (acc, r) => {
        const existing = acc.find((d) => d.name === r.staffName);
        if (existing) {
          existing.件数++;
          existing.合計評価 += r.rating;
          existing.平均評価 = parseFloat((existing.合計評価 / existing.件数).toFixed(1));
        } else {
          acc.push({ name: r.staffName, 件数: 1, 合計評価: r.rating, 平均評価: r.rating });
        }
        return acc;
      },
      [] as { name: string; 件数: number; 合計評価: number; 平均評価: number }[],
    )
    .sort((a, b) => b.平均評価 - a.平均評価);

  const handleLogin = async () => {
    const res = await fetch("/api/admin-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: adminId, password }),
    });
    if (res.ok) {
      if (keepLogin) {
        localStorage.setItem("admin_auth", "true");
      } else {
        sessionStorage.setItem("admin_auth", "true");
      }
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("IDまたはパスワードが間違っています");
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/submit-review");
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = filter === "all" ? reviews : reviews.filter((r) => r.rating === filter);

  if (isAuthenticated === null) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <p className="text-xs tracking-widest text-gray-400 uppercase mb-1">Admin</p>
            <h1 className="text-2xl font-light text-gray-800 tracking-wide">管理者ログイン</h1>
            <div className="w-12 h-px bg-gray-300 mx-auto mt-4"></div>
          </div>

          <div className="bg-white border border-gray-200 p-8 mb-2">
            {/* ID */}
            <div className="mb-6">
              <label className="block text-sm text-gray-700 font-medium mb-2">管理者ID</label>
              <input
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="w-full px-3 py-3 border border-gray-200 focus:outline-none focus:border-gray-500 text-gray-700 text-sm bg-white placeholder-gray-300 transition"
              />
            </div>

            {/* パスワード */}
            <div className="mb-6">
              <label className="block text-sm text-gray-700 font-medium mb-2">パスワード（半角英数）</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="w-full px-3 py-3 border border-gray-200 focus:outline-none focus:border-gray-500 text-gray-700 text-sm bg-white placeholder-gray-300 transition pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* ログイン状態を維持する */}
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="keepLogin"
                checked={keepLogin}
                onChange={(e) => setKeepLogin(e.target.checked)}
                className="w-4 h-4 border-gray-300"
              />
              <label htmlFor="keepLogin" className="text-sm text-gray-600">
                ログイン状態を維持する
              </label>
            </div>

            {error && <p className="text-red-400 text-xs mt-4 tracking-wide">{error}</p>}
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-gray-200 hover:bg-gray-800 hover:text-white text-gray-600 text-sm tracking-widest py-4 transition"
          >
            ログイン ›
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-400 tracking-widest">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-10">
          <p className="text-xs tracking-widest text-gray-400 uppercase mb-1">Admin</p>
          <h1 className="text-3xl font-light text-gray-800 tracking-wide">レビュー管理</h1>
          <div className="w-12 h-px bg-gray-300 mx-auto mt-4 mb-3"></div>
          <p className="text-sm text-gray-400 tracking-wide">全 {reviews.length} 件のレビュー</p>
          <button
            onClick={() => {
              localStorage.removeItem("admin_auth");
              sessionStorage.removeItem("admin_auth");
              setIsAuthenticated(false);
            }}
            className="mt-4 text-xs tracking-widest text-gray-300 hover:text-gray-500 transition"
          >
            ログアウト ›
          </button>
          <button
            onClick={handleExportCSV}
            className="mt-2 text-xs tracking-widest text-gray-300 hover:text-gray-500 transition"
          >
            CSVエクスポート ↓
          </button>
        </div>

        {/* フィルター */}
        <div className="bg-white border border-gray-200 p-4 mb-6">
          <div className="flex gap-2 flex-wrap justify-center">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 text-xs tracking-widest transition ${
                filter === "all"
                  ? "bg-gray-800 text-white"
                  : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              すべて ({reviews.length})
            </button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => setFilter(rating)}
                className={`px-4 py-2 text-xs tracking-widest transition ${
                  filter === rating
                    ? "bg-gray-800 text-white"
                    : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {"★".repeat(rating)} ({reviews.filter((r) => r.rating === rating).length})
              </button>
            ))}
          </div>
        </div>

        {/* 統計・グラフ */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white border border-gray-200 p-6 text-center">
            <p className="text-xs tracking-widest text-gray-400 uppercase mb-2">総レビュー数</p>
            <p className="text-3xl font-light text-gray-800">{reviews.length}</p>
          </div>
          <div className="bg-white border border-gray-200 p-6 text-center">
            <p className="text-xs tracking-widest text-gray-400 uppercase mb-2">平均評価</p>
            <p className="text-3xl font-light text-gray-800">
              {averageRating}
              <span className="text-sm text-gray-400"> / 5</span>
            </p>
          </div>
          <div className="bg-white border border-gray-200 p-6 text-center">
            <p className="text-xs tracking-widest text-gray-400 uppercase mb-2">Google投稿率</p>
            <p className="text-3xl font-light text-gray-800">
              {reviews.length > 0
                ? Math.round((reviews.filter((r) => r.type === "google").length / reviews.length) * 100)
                : 0}
              <span className="text-sm text-gray-400"> %</span>
            </p>
          </div>
        </div>

        {/* 評価別グラフ */}
        <div className="bg-white border border-gray-200 p-6 mb-6">
          <p className="text-xs tracking-widest text-gray-400 uppercase mb-6">評価別件数</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ratingData} barSize={32}>
              <XAxis
                dataKey="rating"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={{ stroke: "#f3f4f6" }}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ border: "1px solid #e5e7eb", borderRadius: 0, fontSize: 12 }}
                cursor={{ fill: "#f9fafb" }}
              />
              <Bar dataKey="件数" fill="#d1d5db" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 月別グラフ */}
        <div className="bg-white border border-gray-200 p-6 mb-6">
          <p className="text-xs tracking-widest text-gray-400 uppercase mb-6">月別レビュー数</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData}>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={{ stroke: "#f3f4f6" }}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ border: "1px solid #e5e7eb", borderRadius: 0, fontSize: 12 }}
                cursor={{ stroke: "#f3f4f6" }}
              />
              <Line
                type="monotone"
                dataKey="件数"
                stroke="#9ca3af"
                strokeWidth={1}
                dot={{ fill: "#6b7280", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 4, fill: "#374151" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* スタッフ別集計 */}
        <div className="bg-white border border-gray-200 p-6 mb-6">
          <p className="text-xs tracking-widest text-gray-400 uppercase mb-4">スタッフ別集計</p>
          {staffData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center">データがありません</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs tracking-widest text-gray-400 uppercase pb-3">スタッフ名</th>
                  <th className="text-center text-xs tracking-widest text-gray-400 uppercase pb-3">件数</th>
                  <th className="text-center text-xs tracking-widest text-gray-400 uppercase pb-3">平均評価</th>
                </tr>
              </thead>
              <tbody>
                {staffData.map((staff) => (
                  <tr key={staff.name} className="border-b border-gray-50">
                    <td className="py-3 text-sm text-gray-700">{staff.name}</td>
                    <td className="py-3 text-sm text-gray-700 text-center">{staff.件数}</td>
                    <td className="py-3 text-sm text-gray-700 text-center">
                      {"★".repeat(Math.round(staff.平均評価))} {staff.平均評価}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* レビュー一覧 */}
        <div className="space-y-3">
          {filteredReviews.length === 0 ? (
            <div className="bg-white border border-gray-200 p-12 text-center">
              <p className="text-sm text-gray-400 tracking-wide">レビューがありません</p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div key={review.id} className="bg-white border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-yellow-500 tracking-widest">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs tracking-widest ${
                        review.type === "google" ? "bg-blue-50 text-blue-400" : "bg-orange-50 text-orange-400"
                      }`}
                    >
                      {review.type === "google" ? "Google投稿" : "フィードバック"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300">{new Date(review.createdAt).toLocaleString("ja-JP")}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100">
                  <div>
                    <p className="text-xs tracking-widest text-gray-400 uppercase mb-1">Staff</p>
                    <p className="text-sm text-gray-700">{review.staffName}</p>
                  </div>
                  <div>
                    <p className="text-xs tracking-widest text-gray-400 uppercase mb-1">Menu</p>
                    <p className="text-sm text-gray-700">{review.menu}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs tracking-widest text-gray-400 uppercase mb-2">生成された口コミ文</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 leading-relaxed">{review.reviewText}</p>
                </div>

                <div className="mb-3">
                  <p className="text-xs tracking-widest text-gray-400 uppercase mb-2">良かった点</p>
                  <p className="text-sm text-gray-600">{review.goodPoints}</p>
                </div>

                {review.improvements && (
                  <div>
                    <p className="text-xs tracking-widest text-gray-400 uppercase mb-2">改善点</p>
                    <p className="text-sm text-gray-600">{review.improvements}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* ホームへ戻る */}
        <div className="mt-8 text-center">
          <a href="/" className="inline-block text-xs tracking-widest text-gray-400 hover:text-gray-600 transition">
            ← アンケートページへ戻る
          </a>
        </div>
      </div>
    </div>
  );
}
