import { NextRequest, NextResponse } from "next/server";
import { generateMultipleAIReviews } from "@/lib/aiReviewService";

// 用於驗證 cron 請求的密鑰
const CRON_SECRET = process.env.CRON_SECRET || process.env.NEXTAUTH_SECRET;

export async function GET(request: NextRequest) {
  try {
    // 驗證請求來源
    const authHeader = request.headers.get("authorization");
    const cronSecret = request.nextUrl.searchParams.get("secret");

    // 允許兩種驗證方式
    const isAuthorized =
      authHeader === `Bearer ${CRON_SECRET}` ||
      cronSecret === CRON_SECRET;

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 獲取要生成的評論數量（默認1條，最多5條）
    const countParam = request.nextUrl.searchParams.get("count");
    const count = Math.min(5, Math.max(1, parseInt(countParam || "1", 10)));

    // 生成 AI 評論
    const result = await generateMultipleAIReviews(count);

    return NextResponse.json({
      success: result.success,
      message: `成功生成 ${result.generated} 條 AI 評論`,
      generated: result.generated,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// 也支持 POST 請求
export async function POST(request: NextRequest) {
  return GET(request);
}
