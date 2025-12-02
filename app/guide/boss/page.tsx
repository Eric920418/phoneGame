import { Skull, Swords, Shield, Heart, Zap, MapPin, Clock, Trophy } from "lucide-react";

/**
 * BOSS介紹頁面
 * 展示遊戲內各種 BOSS 的資訊與攻略
 */

// BOSS 數據
const bosses = [
  {
    id: 1,
    name: "呂布",
    title: "無雙戰神",
    location: "虎牢關",
    level: 60,
    type: "副本 BOSS",
    typeColor: "#ff6b00",
    hp: "50,000,000",
    difficulty: 5,
    skills: [
      { name: "天下無雙", description: "對範圍內敵人造成巨量傷害，需及時躲避" },
      { name: "方天畫戟", description: "連續三段攻擊，每段傷害遞增" },
      { name: "霸體狀態", description: "血量降至 50% 時進入霸體，免疫控制" },
    ],
    drops: ["赤兔馬碎片", "呂布方天戟", "無雙戰甲"],
    tips: "建議等級 60 以上，注意躲避天下無雙技能的紅圈提示。",
  },
  {
    id: 2,
    name: "曹操",
    title: "亂世梟雄",
    location: "許昌皇城",
    level: 55,
    type: "世界 BOSS",
    typeColor: "#a855f7",
    hp: "100,000,000",
    difficulty: 4,
    skills: [
      { name: "挾天子令諸侯", description: "召喚護衛軍團協助戰鬥" },
      { name: "奸雄之計", description: "隨機標記玩家，被標記者需遠離隊友" },
      { name: "青梅煮酒", description: "回復自身生命值" },
    ],
    drops: ["曹操披風", "倚天劍碎片", "魏國令牌"],
    tips: "世界 BOSS 需多人協作，注意處理召喚的護衛。",
  },
  {
    id: 3,
    name: "關羽",
    title: "武聖",
    location: "樊城",
    level: 50,
    type: "副本 BOSS",
    typeColor: "#ef4444",
    hp: "30,000,000",
    difficulty: 4,
    skills: [
      { name: "青龍偃月", description: "橫掃前方扇形區域，傷害極高" },
      { name: "刮骨療毒", description: "持續回復生命值，需打斷" },
      { name: "義薄雲天", description: "血量降至 30% 時爆發，攻擊力大幅提升" },
    ],
    drops: ["青龍偃月刀", "武聖戰袍", "蜀國令牌"],
    tips: "注意打斷刮骨療毒技能，低血量時輸出要謹慎。",
  },
  {
    id: 4,
    name: "諸葛亮",
    title: "臥龍先生",
    location: "五丈原",
    level: 55,
    type: "副本 BOSS",
    typeColor: "#3b82f6",
    hp: "25,000,000",
    difficulty: 5,
    skills: [
      { name: "八陣圖", description: "在場地放置陣法，踩中會被困住" },
      { name: "借東風", description: "召喚火焰風暴，持續造成範圍傷害" },
      { name: "空城計", description: "消失並回復生命，需找到真身" },
    ],
    drops: ["諸葛錦囊", "羽扇綸巾", "八陣圖秘籍"],
    tips: "機制複雜，需要團隊配合，注意避開八陣圖陷阱。",
  },
  {
    id: 5,
    name: "孫策",
    title: "小霸王",
    location: "江東",
    level: 45,
    type: "野外 BOSS",
    typeColor: "#22c55e",
    hp: "15,000,000",
    difficulty: 3,
    skills: [
      { name: "霸王槍法", description: "連續突進攻擊" },
      { name: "江東猛虎", description: "提升自身攻擊速度" },
      { name: "兄弟齊心", description: "召喚孫權協助" },
    ],
    drops: ["霸王槍", "江東戰甲", "吳國令牌"],
    tips: "野外 BOSS 會定時刷新，注意搶奪歸屬權。",
  },
  {
    id: 6,
    name: "董卓",
    title: "暴君",
    location: "洛陽",
    level: 40,
    type: "副本 BOSS",
    typeColor: "#f59e0b",
    hp: "20,000,000",
    difficulty: 3,
    skills: [
      { name: "暴政", description: "對全場造成持續傷害" },
      { name: "火燒洛陽", description: "在場地放置火焰區域" },
      { name: "西涼鐵騎", description: "召喚騎兵衝鋒" },
    ],
    drops: ["董卓寶座", "西涼戰馬", "暴君令牌"],
    tips: "注意躲避火焰區域，優先清理召喚的騎兵。",
  },
];

export default function BossPage() {
  return (
    <div className="space-y-8">
      {/* 頁面標題 */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-rose-500/20 flex items-center justify-center">
          <Skull className="w-7 h-7 text-rose-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">BOSS介紹</h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            首領資訊與攻略指南
          </p>
        </div>
      </div>

      {/* BOSS 類型說明 */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="text-[var(--color-text-muted)]">BOSS 類型：</span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff6b00]" />
            <span className="text-[#ff6b00]">副本 BOSS</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#a855f7]" />
            <span className="text-[#a855f7]">世界 BOSS</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#22c55e]" />
            <span className="text-[#22c55e]">野外 BOSS</span>
          </span>
        </div>
      </div>

      {/* BOSS 列表 */}
      <div className="space-y-6">
        {bosses.map((boss) => (
          <div
            key={boss.id}
            className="card p-6 hover:border-rose-500/30 transition-all"
          >
            {/* BOSS 頭部資訊 */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6 pb-6 border-b border-[var(--color-border)]">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-rose-500/20 flex items-center justify-center">
                  <Skull className="w-8 h-8 text-rose-400" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-2xl font-bold text-[var(--color-text)]">
                      {boss.name}
                    </h3>
                    <span
                      className="text-xs px-2 py-1 rounded"
                      style={{
                        backgroundColor: `${boss.typeColor}20`,
                        color: boss.typeColor,
                      }}
                    >
                      {boss.type}
                    </span>
                  </div>
                  <p className="text-[var(--color-text-muted)] italic">
                    「{boss.title}」
                  </p>
                </div>
              </div>

              {/* 難度星級 */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--color-text-muted)]">難度：</span>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Swords
                      key={i}
                      className={`w-4 h-4 ${
                        i < boss.difficulty
                          ? "text-red-400"
                          : "text-[var(--color-text-dark)]"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 基本屬性 */}
              <div>
                <h4 className="text-sm font-medium text-[var(--color-text)] mb-3">
                  基本資訊
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
                    <span className="text-[var(--color-text-muted)]">位置：</span>
                    <span className="text-[var(--color-text)]">{boss.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-[var(--color-text-muted)]">等級：</span>
                    <span className="text-[var(--color-text)]">Lv.{boss.level}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span className="text-[var(--color-text-muted)]">血量：</span>
                    <span className="text-[var(--color-text)]">{boss.hp}</span>
                  </div>
                </div>
              </div>

              {/* 技能列表 */}
              <div>
                <h4 className="text-sm font-medium text-[var(--color-text)] mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  技能
                </h4>
                <div className="space-y-2">
                  {boss.skills.map((skill, index) => (
                    <div
                      key={index}
                      className="p-2 rounded-lg bg-[var(--color-bg-darker)]"
                    >
                      <div className="text-sm font-medium text-[var(--color-text)]">
                        {skill.name}
                      </div>
                      <div className="text-xs text-[var(--color-text-muted)]">
                        {skill.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 掉落物品 */}
              <div>
                <h4 className="text-sm font-medium text-[var(--color-text)] mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  掉落物品
                </h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {boss.drops.map((drop, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 text-sm"
                    >
                      {drop}
                    </span>
                  ))}
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="text-xs font-medium text-blue-400 mb-1">💡 攻略提示</div>
                  <p className="text-xs text-[var(--color-text-muted)]">{boss.tips}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 通用攻略 */}
      <div className="card p-6 bg-[var(--color-bg-darker)]">
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">
          ⚔️ BOSS 戰鬥通用技巧
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[var(--color-text-muted)]">
          <ul className="space-y-2">
            <li>• 戰鬥前確保藥水和復活道具充足</li>
            <li>• 了解 BOSS 技能機制，避免硬吃傷害</li>
            <li>• 坦克注意拉穩仇恨，保護輸出位</li>
          </ul>
          <ul className="space-y-2">
            <li>• 治療者注意團隊血量，適時群補</li>
            <li>• 輸出位注意躲避技能，保持輸出</li>
            <li>• 團隊配合，語音交流更高效</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

