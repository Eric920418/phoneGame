import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
const UPLOAD_TIMEOUT = 30000; // 30 秒上傳超時

// 帶超時的 Promise 封裝
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ]);
}

export async function POST(request: NextRequest) {
  try {
    // 添加超時控制讀取 formData
    const formData = await withTimeout(
      request.formData(),
      UPLOAD_TIMEOUT,
      '讀取上傳數據超時'
    );
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "沒有上傳文件" },
        { status: 400 }
      );
    }

    // 檢查檔案大小限制 (1MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "檔案大小超過限制，最大允許 1MB" },
        { status: 413 }
      );
    }

    // 添加超時控制讀取文件內容
    const bytes = await withTimeout(
      file.arrayBuffer(),
      UPLOAD_TIMEOUT,
      '讀取文件內容超時'
    );
    const buffer = Buffer.from(bytes);

    // 確保上傳目錄存在
    const uploadDir = path.join(process.cwd(), "uploads/images");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}-${originalName}`;
    const filepath = path.join(uploadDir, filename);

    // 寫入文件（帶超時）
    await withTimeout(
      writeFile(filepath, buffer),
      UPLOAD_TIMEOUT,
      '寫入文件超時'
    );

    // 返回 API 路徑
    const url = `/api/images/${filename}`;

    return NextResponse.json({ url, filename });
  } catch (error) {
    console.error("上傳錯誤:", error);
    const errorMessage = error instanceof Error ? error.message : "上傳失敗";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
