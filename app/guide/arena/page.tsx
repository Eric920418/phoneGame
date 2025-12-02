import { Trophy, Swords, Crown, Medal, Clock, Star, TrendingUp, Users } from "lucide-react";

/**
 * 武魂擂台頁面
 * 展示競技場賽事與排名資訊
 */

// 賽季資訊
const currentSeason = {
  name: "第十二賽季",
  startDate: "2024-12-01",
  endDate: "2024-12-31",
  daysRemaining: 30,
};

// 排行榜模擬數據
const rankings = [
  { rank: 1, name: "無敵戰神", guild: "天下第一", score: 2850, winRate: "78%" },
  { rank: 2, name: "劍舞蒼穹", guild: "霸王軍團", score: 2720, winRate: "75%" },
  { rank: 3, name: "風雲再起", guild: "龍騰虎躍", score: 2680, winRate: "72%" },
  { rank: 4, name: "一劍封喉", guild: "劍指天涯", score: 2590, winRate: "70%" },
  { rank: 5, name: "戰無不勝", guild: "天下第一", score: 2540, winRate: "68%" },
  { rank: 6, name: "烈焰狂龍", guild: "火焰軍團", score: 2480, winRate: "67%" },
  { rank: 7, name: "冷月無聲", guild: "月影門", score: 2420, winRate: "65%" },
  { rank: 8, name: "雷霆萬鈞", guild: "雷霆戰隊", score: 2380, winRate: "64%" },
  { rank: 9, name: "劍心通明", guild: "劍心閣", score: 2340, winRate: "63%" },
  { rank: 10, name: "風起雲湧", guild: "風雲會", score: 2300, winRate: "62%" },
];

// 段位資訊
const tiers = [
  { name: "王者", icon: "👑", score: "2500+", color: "#ff6b00", rewards: "傳說武器、專屬稱號" },
  { name: "宗師", icon: "🏆", score: "2000-2499", color: "#a855f7", rewards: "史詩武器、限定時裝" },
  { name: "大師", icon: "⭐", score: "1500-1999", color: "#3b82f6", rewards: "稀有武器、競技寶箱" },
  { name: "精英", icon: "🎖️", score: "1000-1499", color: "#22c55e", rewards: "普通武器、材料獎勵" },
  { name: "新秀", icon: "🌟", score: "0-999", color: "#6b7280", rewards: "基礎獎勵" },
];

// 規則說明
const rules = [
  { title: "匹配規則", content: "系統根據段位和勝率進行智能匹配，確保公平競技" },
  { title: "積分計算", content: "勝利 +25~35 分，失敗 -15~25 分，連勝有額外加成" },
  { title: "賽季結算", content: "賽季結束時根據最終段位發放獎勵，積分重置" },
  { title: "每日限制", content: "每日可進行 20 場排位賽，額外場次需消耗挑戰券" },
];

export default function ArenaPage() {
  return (
    <div className="space-y-8">
      {/* 頁面標題 */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <Trophy className="w-7 h-7 text-amber-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">武魂擂台</h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            競技場賽事與排名
          </p>
        </div>
      </div>

      {/* 當前賽季資訊 */}
      <div className="card p-6 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Crown className="w-10 h-10 text-amber-400" />
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text)]">
                {currentSeason.name}
              </h2>
              <p className="text-[var(--color-text-muted)]">
                {currentSeason.startDate} ~ {currentSeason.endDate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20">
            <Clock className="w-5 h-5 text-amber-400" />
            <span className="text-amber-400 font-semibold">
              剩餘 {currentSeason.daysRemaining} 天
            </span>
          </div>
        </div>
      </div>

      {/* 段位說明 */}
      <div>
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
          <Medal className="w-5 h-5 text-[var(--color-primary)]" />
          段位說明
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className="card p-4 text-center"
              style={{ borderColor: `${tier.color}30` }}
            >
              <div className="text-3xl mb-2">{tier.icon}</div>
              <h3
                className="text-lg font-bold mb-1"
                style={{ color: tier.color }}
              >
                {tier.name}
              </h3>
              <div className="text-sm text-[var(--color-text-muted)] mb-2">
                {tier.score} 分
              </div>
              <div className="text-xs text-[var(--color-text-dark)]">
                {tier.rewards}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 排行榜 */}
      <div>
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[var(--color-primary)]" />
          賽季排行榜
        </h2>
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--color-bg-darker)]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text)]">
                  排名
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text)]">
                  玩家
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text)]">
                  公會
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-[var(--color-text)]">
                  積分
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-[var(--color-text)]">
                  勝率
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {rankings.map((player) => (
                <tr
                  key={player.rank}
                  className={`hover:bg-[var(--color-bg-card-hover)] transition-colors ${
                    player.rank <= 3 ? "bg-amber-500/5" : ""
                  }`}
                >
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                        player.rank === 1
                          ? "bg-yellow-500/20 text-yellow-400"
                          : player.rank === 2
                          ? "bg-gray-400/20 text-gray-300"
                          : player.rank === 3
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-[var(--color-bg-darker)] text-[var(--color-text-muted)]"
                      }`}
                    >
                      {player.rank}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`font-medium ${
                        player.rank <= 3
                          ? "text-[var(--color-primary)]"
                          : "text-[var(--color-text)]"
                      }`}
                    >
                      {player.name}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--color-text-muted)]">
                    {player.guild}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-semibold text-amber-400">
                      {player.score}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right text-sm text-[var(--color-text-muted)]">
                    {player.winRate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 規則說明 */}
      <div>
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
          <Swords className="w-5 h-5 text-[var(--color-primary)]" />
          競技規則
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule, index) => (
            <div key={index} className="card p-5">
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                {rule.title}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                {rule.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 競技小技巧 */}
      <div className="card p-6 bg-[var(--color-bg-darker)]">
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">
          🏆 競技小技巧
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[var(--color-text-muted)]">
          <ul className="space-y-2">
            <li>• 了解各職業的技能特點和弱點</li>
            <li>• 善用地形和走位躲避技能</li>
            <li>• 觀察對手的技能 CD，把握反擊時機</li>
          </ul>
          <ul className="space-y-2">
            <li>• 保持冷靜，不要盲目追擊</li>
            <li>• 多觀看高手對戰錄影學習</li>
            <li>• 裝備和技能搭配要針對競技優化</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

