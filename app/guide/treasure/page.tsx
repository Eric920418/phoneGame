import { Gift, Star, Sparkles, Package, Percent } from "lucide-react";

/**
 * 寶箱內容頁面
 * 展示各種寶箱的獎勵內容與機率
 */

// 寶箱數據
const treasures = [
  {
    id: 1,
    name: "傳說寶箱",
    rarity: "傳說",
    color: "#ff6b00",
    description: "包含最稀有的傳說級獎勵",
    obtainMethod: "活動獎勵、儲值贈送",
    items: [
      { name: "赤兔馬", rate: "1%", rarity: "傳說" },
      { name: "傳說武器選擇箱", rate: "5%", rarity: "傳說" },
      { name: "傳說防具選擇箱", rate: "5%", rarity: "傳說" },
      { name: "神話材料 x5", rate: "10%", rarity: "史詩" },
      { name: "元寶 x1000", rate: "20%", rarity: "稀有" },
      { name: "經驗藥水 x10", rate: "59%", rarity: "普通" },
    ],
  },
  {
    id: 2,
    name: "史詩寶箱",
    rarity: "史詩",
    color: "#a855f7",
    description: "有機會獲得史詩級裝備",
    obtainMethod: "副本掉落、商城購買",
    items: [
      { name: "史詩武器隨機箱", rate: "3%", rarity: "史詩" },
      { name: "史詩防具隨機箱", rate: "5%", rarity: "史詩" },
      { name: "稀有材料 x10", rate: "15%", rarity: "稀有" },
      { name: "元寶 x500", rate: "20%", rarity: "稀有" },
      { name: "強化石 x5", rate: "25%", rarity: "普通" },
      { name: "銀幣 x10000", rate: "32%", rarity: "普通" },
    ],
  },
  {
    id: 3,
    name: "稀有寶箱",
    rarity: "稀有",
    color: "#3b82f6",
    description: "日常活動常見獎勵",
    obtainMethod: "每日任務、活動獎勵",
    items: [
      { name: "稀有裝備隨機箱", rate: "10%", rarity: "稀有" },
      { name: "普通材料 x20", rate: "20%", rarity: "普通" },
      { name: "元寶 x100", rate: "15%", rarity: "普通" },
      { name: "經驗藥水 x5", rate: "25%", rarity: "普通" },
      { name: "銀幣 x5000", rate: "30%", rarity: "普通" },
    ],
  },
  {
    id: 4,
    name: "普通寶箱",
    rarity: "普通",
    color: "#6b7280",
    description: "基礎獎勵寶箱",
    obtainMethod: "擊殺怪物、完成任務",
    items: [
      { name: "普通裝備", rate: "20%", rarity: "普通" },
      { name: "基礎材料 x10", rate: "30%", rarity: "普通" },
      { name: "銀幣 x1000", rate: "30%", rarity: "普通" },
      { name: "經驗藥水 x1", rate: "20%", rarity: "普通" },
    ],
  },
  {
    id: 5,
    name: "國戰寶箱",
    rarity: "史詩",
    color: "#ef4444",
    description: "國戰勝利專屬獎勵",
    obtainMethod: "國戰勝利獎勵",
    items: [
      { name: "虎符", rate: "5%", rarity: "史詩" },
      { name: "國戰專屬時裝", rate: "3%", rarity: "史詩" },
      { name: "史詩材料 x5", rate: "15%", rarity: "史詩" },
      { name: "元寶 x800", rate: "20%", rarity: "稀有" },
      { name: "榮譽點數 x500", rate: "30%", rarity: "普通" },
      { name: "銀幣 x20000", rate: "27%", rarity: "普通" },
    ],
  },
  {
    id: 6,
    name: "武魂寶箱",
    rarity: "史詩",
    color: "#f59e0b",
    description: "競技場排名獎勵",
    obtainMethod: "武魂擂台賽季獎勵",
    items: [
      { name: "武魂專屬武器", rate: "2%", rarity: "傳說" },
      { name: "競技專屬稱號", rate: "5%", rarity: "史詩" },
      { name: "技能書選擇箱", rate: "10%", rarity: "史詩" },
      { name: "元寶 x600", rate: "20%", rarity: "稀有" },
      { name: "競技點數 x300", rate: "30%", rarity: "普通" },
      { name: "強化石 x10", rate: "33%", rarity: "普通" },
    ],
  },
];

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

export default function TreasurePage() {
  return (
    <div className="space-y-8">
      {/* 頁面標題 */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-yellow-500/20 flex items-center justify-center">
          <Gift className="w-7 h-7 text-yellow-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">寶箱內容</h1>
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
                {treasure.items.map((item, index) => (
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

