import { Swords, Clock, Calendar, Trophy, Users, Flag, Star, Shield } from "lucide-react";

/**
 * 國戰時間頁面
 * 展示國戰時程與規則說明
 */

// 國戰時間表
const warSchedule = [
  { day: "週一", time: "20:00 - 21:00", type: "練習賽", description: "無獎勵的練習戰場" },
  { day: "週二", time: "20:00 - 21:30", type: "資源戰", description: "爭奪地區資源點" },
  { day: "週三", time: "20:00 - 21:00", type: "練習賽", description: "無獎勵的練習戰場" },
  { day: "週四", time: "20:00 - 21:30", type: "城池戰", description: "攻城掠地戰役" },
  { day: "週五", time: "20:00 - 22:00", type: "公會戰", description: "公會對抗賽" },
  { day: "週六", time: "19:00 - 22:00", type: "國戰", description: "三國大規模戰役" },
  { day: "週日", time: "19:00 - 22:00", type: "國戰", description: "三國大規模戰役" },
];

// 國戰規則
const rules = [
  {
    title: "參戰資格",
    items: [
      "角色等級達到 30 級以上",
      "已選擇陣營（魏、蜀、吳）",
      "非新手保護期玩家",
      "建議戰力 50,000 以上",
    ],
  },
  {
    title: "戰場規則",
    items: [
      "每場國戰分為三個階段：集結期、戰鬥期、結算期",
      "戰鬥期間擊殺敵方玩家可獲得積分",
      "佔領據點可為陣營提供增益效果",
      "陣亡後 30 秒可在安全區復活",
    ],
  },
  {
    title: "勝利條件",
    items: [
      "佔領敵方主城持續 5 分鐘",
      "戰鬥時間結束時積分最高的陣營獲勝",
      "殲滅敵方總指揮（限特殊戰役）",
    ],
  },
  {
    title: "禁止行為",
    items: [
      "使用外掛或輔助程式",
      "惡意掛機或故意送分",
      "與敵方陣營玩家串通",
      "辱罵或騷擾其他玩家",
    ],
  },
];

// 獎勵列表
const rewards = [
  { rank: "冠軍陣營", items: ["國戰寶箱 x3", "榮譽點數 x1000", "專屬稱號", "元寶 x500"] },
  { rank: "亞軍陣營", items: ["國戰寶箱 x2", "榮譽點數 x600", "元寶 x300"] },
  { rank: "季軍陣營", items: ["國戰寶箱 x1", "榮譽點數 x300", "元寶 x100"] },
  { rank: "個人 MVP", items: ["MVP 稱號", "額外榮譽點數 x500", "傳說材料 x5"] },
];

export default function NationWarPage() {
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

      {/* 國戰規則 */}
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
                {rule.items.map((item, i) => (
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

      {/* 獎勵說明 */}
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
                {reward.items.map((item, i) => (
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

      {/* 陣營介紹 */}
      <div>
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-[var(--color-primary)]" />
          三國陣營
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-5 border-blue-500/30">
            <h3 className="text-xl font-bold text-blue-400 mb-2">魏國</h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-3">
              以曹操為首，佔據中原，兵強馬壯。
            </p>
            <div className="text-xs text-[var(--color-text-dark)]">
              特色：攻擊力加成 5%
            </div>
          </div>
          <div className="card p-5 border-green-500/30">
            <h3 className="text-xl font-bold text-green-400 mb-2">蜀國</h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-3">
              以劉備為首，仁義之師，團結一心。
            </p>
            <div className="text-xs text-[var(--color-text-dark)]">
              特色：防禦力加成 5%
            </div>
          </div>
          <div className="card p-5 border-red-500/30">
            <h3 className="text-xl font-bold text-red-400 mb-2">吳國</h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-3">
              以孫權為首，據守江東，水師無敵。
            </p>
            <div className="text-xs text-[var(--color-text-dark)]">
              特色：移動速度加成 5%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

