import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { staffName, menu, rating, goodPoints, improvements } = body;

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // モックモード
    if (!apiKey || apiKey === "your_api_key_here") {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return NextResponse.json({
        reviewText:
          "担当していただいたスタッフの方がとても丁寧で、仕上がりにも大満足です！カラーの色味もイメージ通りで、居心地の良い空間でリラックスして施術を受けられました。また必ず来ます！",
      });
    }

    // 実際のAPI呼び出し
    const client = new Anthropic({ apiKey });

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

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    const reviewText = message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ reviewText });
  } catch (error: any) {
    console.error("Error generating review:", error);
    return NextResponse.json({ error: error.message || "レビュー生成に失敗しました" }, { status: 500 });
  }
}
