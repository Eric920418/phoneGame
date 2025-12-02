import { Map, Swords, Clock, Users, Star, Trophy, ChevronRight } from "lucide-react";
import Link from "next/link";

/**
 * 副本介紹頁面
 * 展示遊戲內各種副本的介紹與攻略
 */

// 副本數據
const dungeons = [
  {
    id: 1,
    name: "虎牢關",
    difficulty: "傳說",
    difficultyColor: "#ff6b00",
    levelRequire: 60,
    playerCount: "5人",
    timeLimit: "30分鐘",
    rewards: ["赤兔馬碎片", "傳說裝備", "稀有材料"],
    description: "面對無雙猛將呂布，挑戰三國最強戰將！",
    bosses: ["呂布"],
    image: "/虎牢關.png",
  },
  {
    id: 2,
    name: "赤壁之戰",
    difficulty: "史詩",
    difficultyColor: "#a855f7",
    levelRequire: 50,
    playerCount: "10人",
    timeLimit: "45分鐘",
    rewards: ["火船圖紙", "史詩裝備", "東風令"],
    description: "重現赤壁大戰，火燒連營八百里！",
    bosses: ["曹操軍團", "鐵索連環艦"],
  },
  {
    id: 3,
    name: "五丈原",
    difficulty: "史詩",
    difficultyColor: "#a855f7",
    levelRequire: 55,
    playerCount: "5人",
    timeLimit: "25分鐘",
    rewards: ["諸葛錦囊", "史詩法器", "智將令牌"],
    description: "追尋臥龍先生的最後足跡，解開智謀之謎。",
    bosses: ["司馬懿幻影", "八陣圖核心"],
  },
  {
    id: 4,
    name: "長坂坡",
    difficulty: "困難",
    difficultyColor: "#3b82f6",
    levelRequire: 40,
    playerCount: "3人",
    timeLimit: "20分鐘",
    rewards: ["趙雲槍訣", "稀有防具", "戰馬材料"],
    description: "體驗趙子龍七進七出的傳奇壯舉！",
    bosses: ["曹軍先鋒", "曹軍大將"],
  },
  {
    id: 5,
    name: "官渡之戰",
    difficulty: "困難",
    difficultyColor: "#3b82f6",
    levelRequire: 35,
    playerCount: "5人",
    timeLimit: "30分鐘",
    rewards: ["袁紹寶藏", "稀有武器", "糧草材料"],
    description: "以少勝多的經典戰役，火燒烏巢！",
    bosses: ["袁紹", "顏良", "文醜"],
  },
  {
    id: 6,
    name: "新手試煉",
    difficulty: "簡單",
    difficultyColor: "#22c55e",
    levelRequire: 10,
    playerCount: "單人",
    timeLimit: "15分鐘",
    rewards: ["新手裝備", "經驗藥水", "銀幣"],
    description: "適合新手練習的入門副本。",
    bosses: ["黃巾小頭目"],
  },
];

export default function DungeonPage() {
  return (
    <div className="space-y-8">
      {/* 頁面標題 */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-teal-500/20 flex items-center justify-center">
          <Map className="w-7 h-7 text-teal-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">副本介紹</h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            各種副本攻略與獎勵一覽
          </p>
        </div>
      </div>

      {/* 難度說明 */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="text-[var(--color-text-muted)]">難度分級：</span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#22c55e]" />
            <span className="text-[#22c55e]">簡單</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#3b82f6]" />
            <span className="text-[#3b82f6]">困難</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#a855f7]" />
            <span className="text-[#a855f7]">史詩</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff6b00]" />
            <span className="text-[#ff6b00]">傳說</span>
          </span>
        </div>
      </div>

      {/* 副本列表 */}
      <div className="space-y-4">
        {dungeons.map((dungeon) => (
          <div
            key={dungeon.id}
            className="card p-6 hover:border-teal-500/30 transition-all group"
          >
            <div className="flex flex-col lg:flex-row gap-6">
              {/* 副本基本資訊 */}
              <div className="lg:w-1/3">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                      {dungeon.name}
                    </h3>
                    <span
                      className="text-sm font-medium"
                      style={{ color: dungeon.difficultyColor }}
                    >
                      {dungeon.difficulty}
                    </span>
                  </div>
                  <div
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: `${dungeon.difficultyColor}20`,
                      color: dungeon.difficultyColor,
                    }}
                  >
                    Lv.{dungeon.levelRequire}+
                  </div>
                </div>

                <p className="text-sm text-[var(--color-text-muted)] mb-4">
                  {dungeon.description}
                </p>

                {/* 副本條件 */}
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="flex items-center gap-1 text-[var(--color-text-muted)]">
                    <Users className="w-4 h-4" />
                    {dungeon.playerCount}
                  </span>
                  <span className="flex items-center gap-1 text-[var(--color-text-muted)]">
                    <Clock className="w-4 h-4" />
                    {dungeon.timeLimit}
                  </span>
                </div>
              </div>

              {/* BOSS 資訊 */}
              <div className="lg:w-1/3">
                <h4 className="text-sm font-medium text-[var(--color-text)] mb-3 flex items-center gap-2">
                  <Swords className="w-4 h-4 text-red-400" />
                  BOSS
                </h4>
                <div className="flex flex-wrap gap-2">
                  {dungeon.bosses.map((boss, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-sm"
                    >
                      {boss}
                    </span>
                  ))}
                </div>
              </div>

              {/* 獎勵 */}
              <div className="lg:w-1/3">
                <h4 className="text-sm font-medium text-[var(--color-text)] mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  通關獎勵
                </h4>
                <div className="flex flex-wrap gap-2">
                  {dungeon.rewards.map((reward, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-lg bg-[var(--color-bg-darker)] text-[var(--color-text-muted)] text-sm"
                    >
                      {reward}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 查看詳細攻略 */}
            <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex justify-end">
              <Link
                href={`/guide/dungeon/${dungeon.id}`}
                className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-light)] flex items-center gap-1"
              >
                查看詳細攻略
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* 副本小技巧 */}
      <div className="card p-6 bg-[var(--color-bg-darker)]">
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">
          ⚔️ 副本攻略技巧
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[var(--color-text-muted)]">
          <ul className="space-y-2">
            <li>• 進入高難度副本前確保裝備已強化</li>
            <li>• 了解 BOSS 技能機制，適時閃避</li>
            <li>• 與隊友配合，分工明確</li>
          </ul>
          <ul className="space-y-2">
            <li>• 帶足藥水和復活道具</li>
            <li>• 善用環境機關和地形優勢</li>
            <li>• 首次通關建議觀看攻略影片</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

