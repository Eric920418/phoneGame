import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "沒有上傳文件" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
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

    // 寫入文件
    await writeFile(filepath, buffer);

    // 返回 API 路徑
    const url = `/api/images/${filename}`;

    return NextResponse.json({ url, filename });
  } catch (error) {
    console.error("上傳錯誤:", error);
    return NextResponse.json(
      { error: "上傳失敗" },
      { status: 500 }
    );
  }
}
