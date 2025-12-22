import { Download, Monitor, FileDown, UserPlus, ChevronRight } from "lucide-react";
import { graphqlFetch } from "@/lib/apolloClient";
import Link from "next/link";

// 強制動態渲染
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * 下載專區頁面
 * 提供遊戲主程式與更新檔下載連結，以及註冊步驟教學
 */

interface StepItem {
  step: number;
  title: string;
  desc: string;
  image?: string;
  images?: string[];
  content?: string;
}

interface DownloadData {
  mainProgram?: { name: string; downloadUrl: string };
  updateFile?: { name: string; downloadUrl: string };
  launcher?: { name: string; downloadUrl: string };
  registrationSteps?: StepItem[];
}

interface ContentBlock {
  key: string;
  payload: DownloadData;
}

async function getDownloadData(): Promise<DownloadData> {
  try {
    const data = await graphqlFetch<{ contentBlock: ContentBlock | null }>(`
      query {
        contentBlock(key: "downloadCenter") {
          key
          payload
        }
      }
    `, undefined, { skipCache: true });

    if (data.contentBlock?.payload) {
      return data.contentBlock.payload;
    }
    return {};
  } catch (error) {
    console.error("獲取下載資料失敗:", error);
    return {};
  }
}

export default async function DownloadPage() {
  const downloadData = await getDownloadData();

  const hasMainProgram = downloadData.mainProgram?.downloadUrl;
  const hasUpdateFile = downloadData.updateFile?.downloadUrl;
  const hasLauncher = downloadData.launcher?.downloadUrl;
  const hasAnyDownload = hasMainProgram || hasUpdateFile || hasLauncher;
  const registrationSteps = downloadData.registrationSteps || [];

  return (
    <div className="space-y-8">
      {/* 頁面標題 */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
          <Download className="w-7 h-7 text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">下載專區</h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            遊戲主程式與更新檔下載
          </p>
        </div>
      </div>

      {/* 下載區域 */}
      {hasAnyDownload ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 主程式下載 */}
          {hasMainProgram && (
            <div className="card p-6 hover:border-blue-500/30 transition-all">
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#0078d420" }}
                >
                  <Monitor className="w-7 h-7" style={{ color: "#0078d4" }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">
                    {downloadData.mainProgram?.name || "遊戲主程式"}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] mb-4">
                    下載完整遊戲主程式安裝檔
                  </p>
                  <a
                    href={downloadData.mainProgram?.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2 w-fit"
                  >
                    <FileDown className="w-4 h-4" />
                    立即下載
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* 更新檔下載 */}
          {hasUpdateFile && (
            <div className="card p-6 hover:border-green-500/30 transition-all">
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#22c55e20" }}
                >
                  <FileDown className="w-7 h-7" style={{ color: "#22c55e" }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">
                    {downloadData.updateFile?.name || "更新檔"}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] mb-4">
                    下載最新遊戲更新檔案
                  </p>
                  <a
                    href={downloadData.updateFile?.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2 w-fit bg-green-600 hover:bg-green-500"
                  >
                    <FileDown className="w-4 h-4" />
                    立即下載
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* 登入器下載 */}
          {hasLauncher && (
            <div className="card p-6 hover:border-purple-500/30 transition-all">
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#a855f720" }}
                >
                  <Download className="w-7 h-7" style={{ color: "#a855f7" }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">
                    {downloadData.launcher?.name || "登入器"}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] mb-4">
                    下載遊戲登入器
                  </p>
                  <a
                    href={downloadData.launcher?.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2 w-fit bg-purple-600 hover:bg-purple-500"
                  >
                    <FileDown className="w-4 h-4" />
                    立即下載
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Download className="w-16 h-16 text-[var(--color-text-dark)] mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)]">下載連結尚未設定</p>
        </div>
      )}

      {/* 註冊步驟區域 */}
      {registrationSteps.length > 0 && (
        <>
          {/* 註冊步驟標題 */}
          <div className="flex items-center gap-4 pt-4">
            <div className="w-14 h-14 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <UserPlus className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text)]">註冊步驟</h2>
              <p className="text-[var(--color-text-muted)] mt-1">
                完整的帳號註冊流程教學
              </p>
            </div>
          </div>

          {/* 步驟列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {registrationSteps.map((step, index) => {
              const coverImage = step.images?.[0] || step.image;

              return (
                <Link
                  key={index}
                  href={`/guide/register/${step.step}`}
                  className="card overflow-hidden hover:border-cyan-500/30 transition-all group"
                >
                  {/* 步驟圖片 */}
                  {coverImage ? (
                    <div className="relative overflow-hidden">
                      <img
                        src={coverImage}
                        alt={step.title}
                        className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-cyan-500/80 text-white">
                          第 {step.step} 步
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-48 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 flex items-center justify-center">
                      <UserPlus className="w-16 h-16 text-cyan-500/40" />
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-cyan-500/80 text-white">
                          第 {step.step} 步
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 步驟內容 */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-[var(--color-text)] mb-2 group-hover:text-cyan-400 transition-colors flex items-center justify-between">
                      {step.title}
                      <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)] line-clamp-2">
                      {step.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
