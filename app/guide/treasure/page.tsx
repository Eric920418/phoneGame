import { Gift, Star } from "lucide-react";
import { graphqlFetch } from "@/lib/apolloClient";

// 強制動態渲染
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * 寶箱福袋內容頁面
 * 展示各種寶箱的內容物
 */

interface TreasureBox {
  name: string;
  items: string[];
}

interface ContentBlock {
  key: string;
  payload: TreasureBox[];
}

async function getTreasureBoxes(): Promise<TreasureBox[]> {
  try {
    const data = await graphqlFetch<{ contentBlock: ContentBlock | null }>(`
      query {
        contentBlock(key: "treasureBoxes") {
          key
          payload
        }
      }
    `, undefined, { skipCache: true });

    if (data.contentBlock?.payload && Array.isArray(data.contentBlock.payload)) {
      return data.contentBlock.payload;
    }
    return [];
  } catch (error) {
    console.error("獲取寶箱資料失敗:", error);
    return [];
  }
}

export default async function TreasurePage() {
  const boxes = await getTreasureBoxes();

  return (
    <div className="space-y-8">
      {/* 頁面標題 */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-yellow-500/20 flex items-center justify-center">
          <Gift className="w-7 h-7 text-yellow-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">寶箱福袋內容</h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            各類寶箱福袋的內容物一覽
          </p>
        </div>
      </div>

      {/* 寶箱列表 */}
      {boxes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {boxes.map((box, index) => (
            <div key={index} className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-yellow-400" />
                </div>
                <h2 className="text-xl font-bold text-[var(--color-text)]">{box.name}</h2>
              </div>

              <div className="space-y-2">
                {(box.items || []).map((item, i) => {
                  const displayText = typeof item === 'string' ? item : (item as { name?: string }).name || '';
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[var(--color-bg-darker)]"
                    >
                      <Star className="w-4 h-4 text-yellow-400 shrink-0" />
                      <span className="text-[var(--color-text)]">{displayText}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Gift className="w-16 h-16 text-[var(--color-text-dark)] mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)]">暫無寶箱資料</p>
        </div>
      )}
    </div>
  );
}
