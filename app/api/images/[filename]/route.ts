import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const filepath = path.join(process.cwd(), "uploads/images", filename);

    if (!existsSync(filepath)) {
      return NextResponse.json(
        { error: "文件不存在" },
        { status: 404 }
      );
    }

    const file = await readFile(filepath);

    // 根據擴展名設置 Content-Type
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
    };

    const contentType = mimeTypes[ext] || "application/octet-stream";

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("讀取圖片錯誤:", error);
    return NextResponse.json(
      { error: "讀取文件失敗" },
      { status: 500 }
    );
  }
}
