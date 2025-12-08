import { Gift, Star, Sparkles, Package, Percent } from "lucide-react";
import { graphqlFetch } from "@/lib/apolloClient";

// 強制動態渲染
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * 寶箱福袋內容頁面
 * 展示各種寶箱的獎勵內容與機率
 */

interface TreasureItem {
  name: string;
  rate: string;
  rarity: string;
}

interface Treasure {
  id: number;
  name: string;
  rarity: string;
  color: string;
  description: string;
  obtainMethod: string;
  items: TreasureItem[];
}

interface ContentBlock {
  key: string;
  payload: Treasure[];
}

// 獲取稀有度顏色
function getRarityColor(rarity: string): string {
  switch (rarity) {
    case "傳說":
      return "#ff6b00";
    case "史詩":
      return "#a855f7";
    case "稀有":
      return "#3b82f6";
    default:
      return "#6b7280";
  }
}

async function getTreasureData(): Promise<Treasure[]> {
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
  const treasures = await getTreasureData();

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
            各類寶箱獎勵明細與掉落機率
          </p>
        </div>
      </div>

      {/* 機率說明 */}
      <div className="card p-4 border-yellow-500/20">
        <div className="flex items-start gap-3">
          <Percent className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--color-text-muted)]">
            以下機率為官方公布數據，實際掉落以遊戲內為準。開啟寶箱時將隨機獲得其中一項獎勵。
          </p>
        </div>
      </div>

      {/* 寶箱列表 */}
      {treasures.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {treasures.map((treasure) => (
            <div
              key={treasure.id}
              className="card p-6 hover:scale-[1.01] transition-all"
              style={{ borderColor: `${treasure.color}30` }}
            >
              {/* 寶箱標題 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${treasure.color}20` }}
                  >
                    <Package className="w-6 h-6" style={{ color: treasure.color }} />
                  </div>
                  <div>
                    <h3
                      className="text-lg font-bold"
                      style={{ color: treasure.color }}
                    >
                      {treasure.name}
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {treasure.description}
                    </p>
                  </div>
                </div>
                <span
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: `${treasure.color}20`,
                    color: treasure.color,
                  }}
                >
                  {treasure.rarity}
                </span>
              </div>

              {/* 獲取方式 */}
              <div className="mb-4 pb-4 border-b border-[var(--color-border)]">
                <span className="text-xs text-[var(--color-text-dark)]">獲取方式：</span>
                <span className="text-sm text-[var(--color-text-muted)] ml-2">
                  {treasure.obtainMethod}
                </span>
              </div>

              {/* 獎勵內容 */}
              <div>
                <h4 className="text-sm font-medium text-[var(--color-text)] mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  可能獲得
                </h4>
                <div className="space-y-2">
                  {(treasure.items || []).map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--color-bg-darker)]"
                    >
                      <div className="flex items-center gap-2">
                        <Star
                          className="w-3 h-3"
                          style={{ color: getRarityColor(item.rarity) }}
                        />
                        <span
                          className="text-sm"
                          style={{ color: getRarityColor(item.rarity) }}
                        >
                          {item.name}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-[var(--color-text-muted)]">
                        {item.rate}
                      </span>
                    </div>
                  ))}
                </div>
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

      {/* 小提示 */}
      <div className="card p-6 bg-[var(--color-bg-darker)]">
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">
          🎁 開箱小技巧
        </h3>
        <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
          <li>• 累積多個寶箱一起開啟，可以享受連抽加成</li>
          <li>• 活動期間開箱可能有額外獎勵加成</li>
          <li>• 傳說寶箱建議在幸運值較高時開啟</li>
          <li>• 部分寶箱可在商城購買或活動獲得</li>
        </ul>
      </div>
    </div>
  );
}
