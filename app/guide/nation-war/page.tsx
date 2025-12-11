import { Swords, Clock, Calendar, Trophy, Users, Flag, Star, Shield } from "lucide-react";
import { graphqlFetch } from "@/lib/apolloClient";

// 強制動態渲染
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * 國戰時間頁面
 * 展示國戰時程與規則說明
 */

interface WarScheduleItem {
  day: string;
  time: string;
  type: string;
  description: string;
}

interface RuleItem {
  title: string;
  items: string[];
}

interface RewardItem {
  rank: string;
  items: string[];
}

interface FactionItem {
  name: string;
  color: string;
  leader: string;
  description: string;
  bonus: string;
}

interface NationWarData {
  warSchedule: WarScheduleItem[];
  rules: RuleItem[];
  rewards: RewardItem[];
  factions: FactionItem[];
}

interface ContentBlock {
  key: string;
  payload: NationWarData;
}

async function getNationWarData(): Promise<NationWarData> {
  try {
    const data = await graphqlFetch<{ contentBlock: ContentBlock | null }>(`
      query {
        contentBlock(key: "nationWar") {
          key
          payload
        }
      }
    `, undefined, { skipCache: true });

    if (data.contentBlock?.payload) {
      return data.contentBlock.payload;
    }
    return { warSchedule: [], rules: [], rewards: [], factions: [] };
  } catch (error) {
    console.error("獲取國戰資料失敗:", error);
    return { warSchedule: [], rules: [], rewards: [], factions: [] };
  }
}

async function getFactionsData(): Promise<FactionItem[]> {
  try {
    const data = await graphqlFetch<{ contentBlock: { payload: FactionItem[] } | null }>(`
      query {
        contentBlock(key: "factions") {
          key
          payload
        }
      }
    `, undefined, { skipCache: true });

    if (data.contentBlock?.payload) {
      return data.contentBlock.payload;
    }
    return [];
  } catch (error) {
    console.error("獲取陣營資料失敗:", error);
    return [];
  }
}

async function getFactionsImage(): Promise<string> {
  try {
    const data = await graphqlFetch<{ contentBlock: { payload: { image?: string }[] } | null }>(`
      query {
        contentBlock(key: "factionsImage") {
          key
          payload
        }
      }
    `, undefined, { skipCache: true });

    if (data.contentBlock?.payload?.[0]?.image) {
      return data.contentBlock.payload[0].image;
    }
    return "";
  } catch (error) {
    console.error("獲取陣營圖片失敗:", error);
    return "";
  }
}

export default async function NationWarPage() {
  const [nationWarData, factionsData, factionsImage] = await Promise.all([
    getNationWarData(),
    getFactionsData(),
    getFactionsImage()
  ]);
  const { warSchedule, rules, rewards } = nationWarData;
  const factions = factionsData.length > 0 ? factionsData : [];

  return (
    <div className="space-y-8">
      {/* 頁面標題 */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-violet-500/20 flex items-center justify-center">
          <Swords className="w-7 h-7 text-violet-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">國戰時間</h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            國戰時程與規則說明
          </p>
        </div>
      </div>

      {/* 時間提醒 */}
      <div className="card p-6 border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-transparent">
        <div className="flex items-start gap-4">
          <Clock className="w-6 h-6 text-violet-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
              溫馨提示
            </h3>
            <p className="text-[var(--color-text-muted)]">
              國戰開始前 15 分鐘會有系統公告提醒，請提前做好準備。建議提前組隊，確保網路穩定。
            </p>
          </div>
        </div>
      </div>

      {/* 戰爭時間表 */}
      {warSchedule.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[var(--color-primary)]" />
            每週時間表
          </h2>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-[var(--color-bg-darker)]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text)]">
                    日期
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text)]">
                    時間
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text)]">
                    類型
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text)]">
                    說明
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {warSchedule.map((schedule, index) => (
                  <tr
                    key={index}
                    className={`hover:bg-[var(--color-bg-card-hover)] transition-colors ${
                      schedule.type === "國戰" ? "bg-violet-500/5" : ""
                    }`}
                  >
                    <td className="px-4 py-4 text-sm text-[var(--color-text)]">
                      {schedule.day}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className="flex items-center gap-2 text-[var(--color-text-muted)]">
                        <Clock className="w-4 h-4" />
                        {schedule.time}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`text-sm px-2 py-1 rounded ${
                          schedule.type === "國戰"
                            ? "bg-violet-500/20 text-violet-400"
                            : schedule.type === "練習賽"
                            ? "bg-gray-500/20 text-gray-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {schedule.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-[var(--color-text-muted)]">
                      {schedule.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 國戰規則 */}
      {rules.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <Flag className="w-5 h-5 text-[var(--color-primary)]" />
            國戰規則
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map((rule, index) => (
              <div key={index} className="card p-5">
                <h3 className="text-lg font-semibold text-[var(--color-text)] mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-violet-400" />
                  {rule.title}
                </h3>
                <ul className="space-y-2">
                  {(rule.items || []).map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-[var(--color-text-muted)]"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0 mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 獎勵說明 */}
      {rewards.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[var(--color-primary)]" />
            戰爭獎勵
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewards.map((reward, index) => (
              <div
                key={index}
                className={`card p-5 ${
                  index === 0 ? "border-yellow-500/30 bg-yellow-500/5" : ""
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Star
                    className={`w-5 h-5 ${
                      index === 0
                        ? "text-yellow-400"
                        : index === 1
                        ? "text-gray-400"
                        : index === 2
                        ? "text-orange-400"
                        : "text-violet-400"
                    }`}
                  />
                  <h3 className="text-lg font-semibold text-[var(--color-text)]">
                    {reward.rank}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(reward.items || []).map((item, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-lg bg-[var(--color-bg-darker)] text-[var(--color-text-muted)] text-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 空狀態 */}
      {warSchedule.length === 0 && rules.length === 0 && rewards.length === 0 && (
        <div className="card p-12 text-center">
          <Swords className="w-16 h-16 text-[var(--color-text-dark)] mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)]">暫無國戰資料</p>
        </div>
      )}

      {/* 陣營介紹 */}
      {factions.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--color-primary)]" />
            三國陣營
          </h2>
          {factionsImage && (
            <div className="mb-4 rounded-xl overflow-hidden">
              <img
                src={factionsImage}
                alt="三國陣營"
                className="w-full h-auto object-cover"
              />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {factions.map((faction, index) => (
              <div
                key={index}
                className="card p-5"
                style={{ borderColor: `${faction.color}50` }}
              >
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ color: faction.color }}
                >
                  {faction.name}
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] mb-3">
                  {faction.leader && `以${faction.leader}為首，`}{faction.description}
                </p>
                {faction.bonus && (
                  <div className="text-xs text-[var(--color-text-dark)]">
                    特色：{faction.bonus}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
