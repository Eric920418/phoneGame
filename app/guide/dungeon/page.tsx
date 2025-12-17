import { Map, Users, RefreshCw, Clock, Skull, Gift } from "lucide-react";
import { graphqlFetch } from "@/lib/apolloClient";

// 強制動態渲染
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * 副本介紹頁面
 * 展示遊戲內各種副本的介紹與攻略
 */

interface Monster {
  name: string;
  drops: string[];
}

interface Dungeon {
  id: number;
  name: string;
  image?: string;
  cooldown?: string;
  dungeonTime?: string;
  players: string;
  monsters?: Monster[];
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
        <div className="space-y-6">
          {dungeons.map((dungeon, idx) => (
            <div
              key={idx}
              className="card overflow-hidden hover:border-teal-500/30 transition-all group"
            >
              {/* 副本圖片 */}
              {dungeon.image && (
                <div className="relative h-48 w-full">
                  <img
                    src={dungeon.image}
                    alt={dungeon.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-card)] to-transparent" />
                </div>
              )}

              <div className="p-6">
                {/* 副本名稱 */}
                <h3 className="text-xl font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors mb-4">
                  {dungeon.name}
                </h3>

                {/* 副本條件 */}
                <div className="flex flex-wrap gap-4 text-sm mb-6">
                  {dungeon.players && (
                    <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                      <Users className="w-4 h-4" />
                      人數限制: {dungeon.players}
                    </span>
                  )}
                  {dungeon.cooldown && (
                    <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-400">
                      <RefreshCw className="w-4 h-4" />
                      間隔時間: {dungeon.cooldown}
                    </span>
                  )}
                  {dungeon.dungeonTime && (
                    <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                      <Clock className="w-4 h-4" />
                      副本時間: {dungeon.dungeonTime}
                    </span>
                  )}
                </div>

                {/* 怪物與掉落物 */}
                {dungeon.monsters && dungeon.monsters.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-[var(--color-text)] mb-3 flex items-center gap-2">
                      <Skull className="w-4 h-4 text-red-400" />
                      怪物與掉落物
                    </h4>
                    <div className="space-y-3">
                      {dungeon.monsters.map((monster, mIdx) => (
                        <div key={mIdx} className="bg-[var(--color-bg-darker)] p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-red-400 font-medium">{monster.name}</span>
                          </div>
                          {monster.drops && monster.drops.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {monster.drops.map((drop, dIdx) => (
                                <span
                                  key={dIdx}
                                  className="flex items-center gap-1 px-2 py-1 rounded bg-[var(--color-bg-card)] text-[var(--color-text-muted)] text-xs"
                                >
                                  <Gift className="w-3 h-3 text-yellow-400" />
                                  {drop}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
