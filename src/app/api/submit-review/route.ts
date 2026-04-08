import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import nodemailer from "nodemailer";

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { staffName, menu, rating, goodPoints, improvements, reviewText } = body;

    const review: Review = {
      id: Date.now().toString(),
      staffName,
      menu,
      rating,
      goodPoints,
      improvements,
      reviewText,
      type: rating >= 4 ? "google" : "feedback",
      createdAt: new Date().toISOString(),
    };

    // reviews.jsonに保存
    const filePath = path.join(process.cwd(), "data", "reviews.json");
    let reviews: Review[] = [];

    try {
      const data = await fs.readFile(filePath, "utf-8");
      reviews = JSON.parse(data);
    } catch (error) {
      // ファイルが存在しない場合は空配列
      reviews = [];
    }

    reviews.push(review);
    await fs.writeFile(filePath, JSON.stringify(reviews, null, 2));

    // 低評価の場合はメール送信
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

  // メール設定が未設定の場合はスキップ
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
    subject: `【改善フィードバック】満足度${review.rating}/5 - ${review.staffName}`,
    html: `
      <h2>お客様からのフィードバック</h2>
      <p><strong>日時:</strong> ${new Date(review.createdAt).toLocaleString("ja-JP")}</p>
      <p><strong>担当スタッフ:</strong> ${review.staffName}</p>
      <p><strong>メニュー:</strong> ${review.menu}</p>
      <p><strong>満足度:</strong> ${review.rating}/5</p>
      <p><strong>良かった点:</strong><br>${review.goodPoints}</p>
      ${review.improvements ? `<p><strong>改善点:</strong><br>${review.improvements}</p>` : ""}
      <p><strong>生成された口コミ:</strong><br>${review.reviewText}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// 管理者ページ用のGET
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "reviews.json");
    const data = await fs.readFile(filePath, "utf-8");
    const reviews = JSON.parse(data);
    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json([]);
  }
}
