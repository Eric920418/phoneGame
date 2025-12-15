import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for Excel files

// 預期的 Excel 格式：BOSS, 出生地點, 物品
interface DropItemData {
  boss: string;
  location: string;
  drops: { name: string; type: string }[];
}

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

    // 檢查檔案類型
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
      return NextResponse.json(
        { error: "只支援 .xlsx 或 .xls 格式的 Excel 檔案" },
        { status: 400 }
      );
    }

    // 檢查檔案大小限制
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "檔案大小超過限制，最大允許 5MB" },
        { status: 413 }
      );
    }

    // 讀取 Excel 檔案
    const bytes = await file.arrayBuffer();
    const workbook = XLSX.read(bytes, { type: "array" });

    // 取得第一個工作表
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return NextResponse.json(
        { error: "Excel 檔案沒有工作表" },
        { status: 400 }
      );
    }

    const sheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });

    // 檢查資料格式
    if (rawData.length < 2) {
      return NextResponse.json(
        { error: "Excel 檔案至少需要標題行和一筆資料" },
        { status: 400 }
      );
    }

    // 驗證標題行格式
    const header = rawData[0];
    if (!header || header.length < 3) {
      return NextResponse.json(
        { error: "標題行格式錯誤，需要至少三個欄位：BOSS, 出生地點, 物品" },
        { status: 400 }
      );
    }

    // 檢查標題是否符合預期格式
    const expectedHeaders = ["BOSS", "出生地點", "物品"];
    const headerMatch = expectedHeaders.every((expected, index) => {
      const actual = String(header[index] || "").trim();
      return actual === expected;
    });

    if (!headerMatch) {
      return NextResponse.json(
        {
          error: `標題行格式不符合，預期格式：${expectedHeaders.join(", ")}，實際格式：${header.slice(0, 3).join(", ")}`,
          expectedFormat: expectedHeaders,
          actualFormat: header.slice(0, 3)
        },
        { status: 400 }
      );
    }

    // 解析資料行
    const dropItems: DropItemData[] = [];
    const errors: string[] = [];

    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || row.length === 0) continue; // 跳過空行

      const boss = String(row[0] || "").trim();
      const location = String(row[1] || "").trim();
      const itemsStr = String(row[2] || "").trim();

      // 驗證必填欄位
      if (!boss) {
        errors.push(`第 ${i + 1} 行：BOSS 名稱不能為空`);
        continue;
      }

      // 解析物品列表（空格分隔）
      const drops = itemsStr
        .split(/\s+/)
        .filter(Boolean)
        .map(name => ({ name: name.trim(), type: "" }));

      dropItems.push({
        boss,
        location,
        drops
      });
    }

    if (dropItems.length === 0) {
      return NextResponse.json(
        {
          error: "沒有解析到有效資料",
          parseErrors: errors.length > 0 ? errors : undefined
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: dropItems,
      totalRows: dropItems.length,
      parseErrors: errors.length > 0 ? errors : undefined,
      message: `成功解析 ${dropItems.length} 筆 BOSS 掉落資料`
    });

  } catch (error) {
    console.error("解析 Excel 錯誤:", error);
    const errorMessage = error instanceof Error ? error.message : "解析失敗";
    return NextResponse.json(
      { error: `解析 Excel 失敗：${errorMessage}` },
      { status: 500 }
    );
  }
}
