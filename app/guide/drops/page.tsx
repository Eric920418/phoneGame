import { Search, MapPin, Star, Filter, ChevronDown } from "lucide-react";

/**
 * 掉落查詢頁面
 * 提供遊戲內物品掉落資訊查詢
 */

// 掉落資訊模擬數據
const dropData = [
  {
    id: 1,
    itemName: "赤兔馬",
    itemType: "坐騎",
    rarity: "傳說",
    rarityColor: "#ff6b00",
    sources: [
      { location: "虎牢關副本", boss: "呂布", dropRate: "0.5%" },
      { location: "傳說寶箱", boss: "-", dropRate: "1%" },
    ],
  },
  {
    id: 2,
    itemName: "青龍偃月刀",
    itemType: "武器",
    rarity: "史詩",
    rarityColor: "#a855f7",
    sources: [
      { location: "樊城副本", boss: "關羽影", dropRate: "2%" },
      { location: "鍛造系統", boss: "-", dropRate: "100% (需材料)" },
    ],
  },
  {
    id: 3,
    itemName: "諸葛錦囊",
    itemType: "道具",
    rarity: "稀有",
    rarityColor: "#3b82f6",
    sources: [
      { location: "臥龍崗", boss: "任意怪物", dropRate: "5%" },
      { location: "每日任務", boss: "-", dropRate: "100%" },
    ],
  },
  {
    id: 4,
    itemName: "鎧甲碎片",
    itemType: "材料",
    rarity: "普通",
    rarityColor: "#6b7280",
    sources: [
      { location: "各地副本", boss: "普通怪物", dropRate: "15%" },
      { location: "世界 BOSS", boss: "各世界 BOSS", dropRate: "30%" },
    ],
  },
  {
    id: 5,
    itemName: "虎符",
    itemType: "道具",
    rarity: "史詩",
    rarityColor: "#a855f7",
    sources: [
      { location: "國戰獎勵", boss: "-", dropRate: "前三名公會" },
      { location: "競技場", boss: "-", dropRate: "賽季獎勵" },
    ],
  },
  {
    id: 6,
    itemName: "五虎將令牌",
    itemType: "材料",
    rarity: "傳說",
    rarityColor: "#ff6b00",
    sources: [
      { location: "五虎將副本", boss: "各五虎將", dropRate: "1%" },
      { location: "限時活動", boss: "-", dropRate: "活動獎勵" },
    ],
  },
];

// 物品類型篩選
const itemTypes = ["全部", "武器", "防具", "坐騎", "道具", "材料"];

// 稀有度篩選
const rarities = ["全部", "傳說", "史詩", "稀有", "普通"];

export default function DropsPage() {
  return (
    <div className="space-y-8">
      {/* 頁面標題 */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-orange-500/20 flex items-center justify-center">
          <Search className="w-7 h-7 text-orange-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">掉落查詢</h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            查詢裝備道具的掉落來源與機率
          </p>
        </div>
      </div>

      {/* 搜尋與篩選 */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 搜尋框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-dark)]" />
            <input
              type="text"
              placeholder="搜尋物品名稱..."
              className="input pl-10"
            />
          </div>

          {/* 類型篩選 */}
          <div className="relative">
            <select className="input pr-10 appearance-none cursor-pointer min-w-[120px]">
              {itemTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-dark)] pointer-events-none" />
          </div>

          {/* 稀有度篩選 */}
          <div className="relative">
            <select className="input pr-10 appearance-none cursor-pointer min-w-[120px]">
              {rarities.map((rarity) => (
                <option key={rarity} value={rarity}>
                  {rarity}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-dark)] pointer-events-none" />
          </div>

          {/* 篩選按鈕 */}
          <button className="btn-primary flex items-center gap-2">
            <Filter className="w-4 h-4" />
            篩選
          </button>
        </div>
      </div>

      {/* 掉落列表 */}
      <div className="space-y-4">
        {dropData.map((item) => (
          <div
            key={item.id}
            className="card p-6 hover:border-orange-500/30 transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              {/* 物品資訊 */}
              <div className="md:w-1/3">
                <div className="flex items-center gap-3 mb-2">
                  <h3
                    className="text-lg font-bold"
                    style={{ color: item.rarityColor }}
                  >
                    {item.itemName}
                  </h3>
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: `${item.rarityColor}20`,
                      color: item.rarityColor,
                    }}
                  >
                    {item.rarity}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                  <Star className="w-4 h-4" />
                  {item.itemType}
                </div>
              </div>

              {/* 掉落來源 */}
              <div className="md:flex-1">
                <h4 className="text-sm font-medium text-[var(--color-text)] mb-3">
                  掉落來源
                </h4>
                <div className="space-y-2">
                  {item.sources.map((source, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--color-bg-darker)]"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
                        <div>
                          <div className="text-sm text-[var(--color-text)]">
                            {source.location}
                          </div>
                          {source.boss !== "-" && (
                            <div className="text-xs text-[var(--color-text-muted)]">
                              BOSS: {source.boss}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-[var(--color-primary)]">
                        {source.dropRate}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 說明 */}
      <div className="card p-6 bg-[var(--color-bg-darker)]">
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">
          📋 查詢說明
        </h3>
        <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
          <li>• 掉落機率為預估數值，實際掉落可能因版本更新而調整</li>
          <li>• 部分物品有多種獲取途徑，建議選擇效率最高的方式</li>
          <li>• 傳說級物品通常需要較長時間刷取，請耐心嘗試</li>
          <li>• 活動限定物品僅在特定活動期間可獲得</li>
        </ul>
      </div>
    </div>
  );
}

