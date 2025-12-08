import { Map, Swords, Users, Trophy, RefreshCw } from "lucide-react";
import { graphqlFetch } from "@/lib/apolloClient";

// 強制動態渲染
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * 副本介紹頁面
 * 展示遊戲內各種副本的介紹與攻略
 */

interface Dungeon {
  id: number;
  name: string;
  level: number;
  players: string;
  boss: string;
  cooldown?: string;
  rewards: string[];
}

interface ContentBlock {
  key: string;
  payload: Dungeon[];
}

async function getDungeonData(): Promise<Dungeon[]> {
  try {
    const data = await graphqlFetch<{ contentBlock: ContentBlock | null }>(`
      query {
        contentBlock(key: "dungeons") {
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
    console.error("獲取副本資料失敗:", error);
    return [];
  }
}

export default async function DungeonPage() {
  const dungeons = await getDungeonData();

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

      {/* 副本列表 */}
      {dungeons.length > 0 ? (
        <div className="space-y-4">
          {dungeons.map((dungeon, idx) => (
            <div
              key={idx}
              className="card p-6 hover:border-teal-500/30 transition-all group"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* 副本基本資訊 */}
                <div className="lg:w-1/3">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                      {dungeon.name}
                    </h3>
                    <div className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-400">
                      Lv.{dungeon.level}+
                    </div>
                  </div>

                  {/* 副本條件 */}
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="flex items-center gap-1 text-[var(--color-text-muted)]">
                      <Users className="w-4 h-4" />
                      {dungeon.players}
                    </span>
                    {dungeon.cooldown && (
                      <span className="flex items-center gap-1 text-[var(--color-text-muted)]">
                        <RefreshCw className="w-4 h-4" />
                        {dungeon.cooldown}
                      </span>
                    )}
                  </div>
                </div>

                {/* BOSS 資訊 */}
                <div className="lg:w-1/3">
                  <h4 className="text-sm font-medium text-[var(--color-text)] mb-3 flex items-center gap-2">
                    <Swords className="w-4 h-4 text-red-400" />
                    BOSS
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {dungeon.boss && (
                      <span className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-sm">
                        {dungeon.boss}
                      </span>
                    )}
                  </div>
                </div>

                {/* 獎勵 */}
                <div className="lg:w-1/3">
                  <h4 className="text-sm font-medium text-[var(--color-text)] mb-3 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    通關獎勵
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(dungeon.rewards || []).map((reward, index) => (
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
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Map className="w-16 h-16 text-[var(--color-text-dark)] mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)]">暫無副本資料</p>
        </div>
      )}

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
