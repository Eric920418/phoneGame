import { Trophy, Medal, Swords, Flame } from "lucide-react";
import { graphqlFetch } from "@/lib/apolloClient";

// 強制動態渲染
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * 三國排行頁面
 * 展示等級、國戰、赤壁排行榜
 */

interface RankingPlayer {
  rank: number;
  name: string;
  guild: string;
  score: number;
}

interface ArenaRankingData {
  levelRanking?: RankingPlayer[];
  nationWarRanking?: RankingPlayer[];
  chibiRanking?: RankingPlayer[];
}

interface ContentBlock {
  key: string;
  payload: ArenaRankingData;
}

async function getArenaRankingData(): Promise<ArenaRankingData> {
  try {
    const data = await graphqlFetch<{ contentBlock: ContentBlock | null }>(`
      query {
        contentBlock(key: "arenaRanking") {
          key
          payload
        }
      }
    `, undefined, { skipCache: true });

    if (data.contentBlock?.payload) {
      return data.contentBlock.payload;
    }
    return { levelRanking: [], nationWarRanking: [], chibiRanking: [] };
  } catch (error) {
    console.error("獲取三國排行資料失敗:", error);
    return { levelRanking: [], nationWarRanking: [], chibiRanking: [] };
  }
}

// 排名卡片组件
function RankingCard({
  title,
  icon: Icon,
  iconColor,
  players,
  scoreLabel = "分數"
}: {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  players: RankingPlayer[];
  scoreLabel?: string;
}) {
  return (
    <div className="card p-6">
      <h2 className="text-xl font-bold text-[var(--color-text)] mb-6 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${iconColor}20` }}
        >
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        </div>
        {title}
      </h2>

      {players.length > 0 ? (
        <div className="space-y-3">
          {players.map((player) => (
            <div
              key={player.rank}
              className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                player.rank <= 3
                  ? "bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20"
                  : "bg-[var(--color-bg-darker)] hover:bg-[var(--color-bg-card-hover)]"
              }`}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    player.rank === 1
                      ? "bg-yellow-500/20 text-yellow-400 ring-2 ring-yellow-500/30"
                      : player.rank === 2
                      ? "bg-gray-400/20 text-gray-300 ring-2 ring-gray-400/30"
                      : player.rank === 3
                      ? "bg-orange-500/20 text-orange-400 ring-2 ring-orange-500/30"
                      : "bg-[var(--color-bg-card)] text-[var(--color-text-muted)]"
                  }`}
                >
                  {player.rank}
                </span>
                <div>
                  <span
                    className={`font-semibold block ${
                      player.rank <= 3
                        ? "text-[var(--color-primary)]"
                        : "text-[var(--color-text)]"
                    }`}
                  >
                    {player.name}
                  </span>
                  <span className="text-sm text-[var(--color-text-dark)]">
                    {player.guild}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span
                  className="font-bold text-lg"
                  style={{ color: iconColor }}
                >
                  {scoreLabel === "等級" ? `Lv.${player.score}` : player.score.toLocaleString()}
                </span>
                <span className="text-xs text-[var(--color-text-dark)] block">
                  {scoreLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          <Icon className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: iconColor }} />
          <p>暫無排名資料</p>
        </div>
      )}
    </div>
  );
}

export default async function ArenaPage() {
  const { levelRanking, nationWarRanking, chibiRanking } = await getArenaRankingData();

  const hasAnyData = (levelRanking?.length || 0) > 0 ||
                     (nationWarRanking?.length || 0) > 0 ||
                     (chibiRanking?.length || 0) > 0;

  return (
    <div className="space-y-8">
      {/* 頁面標題 */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <Trophy className="w-7 h-7 text-amber-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">三國排行</h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            等級、國戰、赤壁討敵排行榜
          </p>
        </div>
      </div>

      {hasAnyData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 等級排行 */}
          <RankingCard
            title="等級排行"
            icon={Medal}
            iconColor="#fbbf24"
            players={levelRanking || []}
            scoreLabel="等級"
          />

          {/* 國戰討敵排行 */}
          <RankingCard
            title="國戰討敵排行"
            icon={Swords}
            iconColor="#ef4444"
            players={nationWarRanking || []}
            scoreLabel="討敵數"
          />

          {/* 赤壁討敵排行 */}
          <RankingCard
            title="赤壁討敵排行"
            icon={Flame}
            iconColor="#f97316"
            players={chibiRanking || []}
            scoreLabel="討敵數"
          />
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Trophy className="w-16 h-16 text-[var(--color-text-dark)] mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)]">暫無排行資料</p>
          <p className="text-sm text-[var(--color-text-dark)] mt-2">
            請至後台「首頁內容管理」→「三國排行」設定資料
          </p>
        </div>
      )}
    </div>
  );
}
