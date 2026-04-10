import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import nodemailer from "nodemailer";

interface Review {
  id: string;
  staff_name: string;
  menu: string;
  rating: number;
  good_points: string;
  improvements?: string;
  review_text: string;
  type: "google" | "feedback";
  created_at: string;
  user_id: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { staffName, menu, rating, goodPoints, improvements, reviewText } = body;

    // Supabase Authからユーザー情報を取得
    const authHeader = request.headers.get("Authorization");
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    const review: Review = {
      id: Date.now().toString(),
      staff_name: staffName,
      menu,
      rating,
      good_points: goodPoints,
      improvements,
      review_text: reviewText,
      type: rating >= 4 ? "google" : "feedback",
      created_at: new Date().toISOString(),
      user_id: userId,
    };

    const { error } = await supabase.from("reviews").insert(review);

    if (error) throw error;

    if (rating <= 3) {
      await sendFeedbackEmail(review);
    }

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error("Error submitting review:", error);
    return NextResponse.json({ error: error.message || "レビュー送信に失敗しました" }, { status: 500 });
  }
}

async function sendFeedbackEmail(review: Review) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;
  const ownerEmail = process.env.OWNER_EMAIL;

  if (!gmailUser || !gmailPassword || !ownerEmail || gmailUser === "your_gmail@gmail.com") {
    console.log("メール設定が未完了のため、送信をスキップしました");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailPassword,
    },
  });

  const mailOptions = {
    from: gmailUser,
    to: ownerEmail,
    subject: `【改善フィードバック】満足度${review.rating}/5 - ${review.staff_name}`,
    html: `
      <h2>お客様からのフィードバック</h2>
      <p><strong>日時:</strong> ${new Date(review.created_at).toLocaleString("ja-JP")}</p>
      <p><strong>担当スタッフ:</strong> ${review.staff_name}</p>
      <p><strong>メニュー:</strong> ${review.menu}</p>
      <p><strong>満足度:</strong> ${review.rating}/5</p>
      <p><strong>良かった点:</strong><br>${review.good_points}</p>
      ${review.improvements ? `<p><strong>改善点:</strong><br>${review.improvements}</p>` : ""}
      <p><strong>生成された口コミ:</strong><br>${review.review_text}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function GET(request: NextRequest) {
  try {
    // ユーザー情報を取得
    const authHeader = request.headers.get("Authorization");
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // user_idがある場合はそのユーザーのレビューのみ取得
    const query = supabase.from("reviews").select("*").order("created_at", { ascending: false });

    if (userId) {
      query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const reviews = data.map((r) => ({
      id: r.id,
      staffName: r.staff_name,
      menu: r.menu,
      rating: r.rating,
      goodPoints: r.good_points,
      improvements: r.improvements,
      reviewText: r.review_text,
      type: r.type,
      createdAt: r.created_at,
    }));

    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json([]);
  }
}
