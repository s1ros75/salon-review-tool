import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { staffName, menu, rating, goodPoints, improvements } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    // モックモード
    if (!apiKey || apiKey === "your_api_key_here") {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return NextResponse.json({
        reviewText:
          "担当していただいたスタッフの方がとても丁寧で、仕上がりにも大満足です！カラーの色味もイメージ通りで、居心地の良い空間でリラックスして施術を受けられました。また必ず来ます！",
      });
    }

    const prompt = `以下の情報をもとに、Googleマップに投稿する自然な口コミ文を生成してください。

担当スタッフ: ${staffName}
利用メニュー: ${menu}
満足度: ${rating}/5
良かった点: ${goodPoints}
${improvements ? `改善点: ${improvements}` : ""}

条件:
- 100文字以内
- 自然で親しみやすい文体
- 具体的な体験を含める`;

    // Gemini API呼び出し
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 500 },
        }),
      },
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Gemini APIエラー");
    }

    const data = await response.json();
    const reviewText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return NextResponse.json({ reviewText });
  } catch (error: any) {
    console.error("Error generating review:", error);
    return NextResponse.json({ error: error.message || "レビュー生成に失敗しました" }, { status: 500 });
  }
}
