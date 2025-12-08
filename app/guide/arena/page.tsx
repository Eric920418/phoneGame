import { Trophy, Swords, Crown, Medal, Clock, Star, TrendingUp } from "lucide-react";
import { graphqlFetch } from "@/lib/apolloClient";

// 強制動態渲染
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * 武魂擂台頁面
 * 展示競技場賽事與排名資訊
 */

interface RankingPlayer {
  rank: number;
  name: string;
  guild: string;
  score: number;
  winRate: string;
}

interface TierInfo {
  name: string;
  icon: string;
  score: string;
  color: string;
  rewards: string;
}

interface RuleInfo {
  title: string;
  content: string;
}

interface ArenaData {
  rankings: RankingPlayer[];
  tiers: TierInfo[];
  rules: RuleInfo[];
}

interface ContentBlock {
  key: string;
  payload: ArenaData;
}

// 動態計算賽季資訊
function getCurrentSeason() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const seasonNumber = (year - 2024) * 12 + (month + 1);

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  return {
    name: `第${seasonNumber}賽季`,
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    daysRemaining,
  };
}

async function getArenaData(): Promise<ArenaData> {
  try {
    const data = await graphqlFetch<{ contentBlock: ContentBlock | null }>(`
      query {
        contentBlock(key: "arenaInfo") {
          key
          payload
        }
      }
    `, undefined, { skipCache: true });

    if (data.contentBlock?.payload) {
      return data.contentBlock.payload;
    }
    return { rankings: [], tiers: [], rules: [] };
  } catch (error) {
    console.error("獲取競技場資料失敗:", error);
    return { rankings: [], tiers: [], rules: [] };
  }
}

export default async function ArenaPage() {
  const { rankings, tiers, rules } = await getArenaData();
  const currentSeason = getCurrentSeason();

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
      {tiers.length > 0 && (
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
      )}

      {/* 排行榜 */}
      {rankings.length > 0 && (
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
      )}

      {/* 規則說明 */}
      {rules.length > 0 && (
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
      )}

      {/* 空狀態 */}
      {rankings.length === 0 && tiers.length === 0 && rules.length === 0 && (
        <div className="card p-12 text-center">
          <Trophy className="w-16 h-16 text-[var(--color-text-dark)] mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)]">暫無競技場資料</p>
        </div>
      )}

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
