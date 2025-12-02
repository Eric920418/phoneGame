import { BookOpen, User, Swords, Map, Users, Star, Target, TrendingUp } from "lucide-react";

/**
 * 新手攻略頁面
 * 提供新玩家入門指南與基礎教學
 */

// 新手指南章節
const chapters = [
  {
    id: 1,
    title: "開始你的三國之旅",
    icon: User,
    color: "#3498db",
    content: [
      { subtitle: "建立角色", text: "選擇你的陣營（魏、蜀、吳）和職業，每個陣營都有獨特的背景故事和專屬武將。" },
      { subtitle: "了解介面", text: "熟悉主畫面的各個功能區塊，包括任務列表、背包、技能欄等。" },
      { subtitle: "完成新手引導", text: "跟隨引導完成初始任務，可獲得豐富的新手獎勵和基礎裝備。" },
    ],
  },
  {
    id: 2,
    title: "戰鬥系統入門",
    icon: Swords,
    color: "#e74c3c",
    content: [
      { subtitle: "基礎操作", text: "使用 WASD 移動，滑鼠左鍵攻擊，數字鍵 1-9 釋放技能。" },
      { subtitle: "技能連招", text: "學習各職業的基礎技能組合，掌握技能施放的最佳時機。" },
      { subtitle: "閃避與防禦", text: "善用閃避技能躲避敵人的強力攻擊，減少傷害損失。" },
    ],
  },
  {
    id: 3,
    title: "探索遊戲世界",
    icon: Map,
    color: "#2ecc71",
    content: [
      { subtitle: "主線任務", text: "跟隨主線劇情了解三國故事，解鎖新地圖和遊戲功能。" },
      { subtitle: "支線任務", text: "完成支線任務獲取額外經驗和獎勵，豐富遊戲體驗。" },
      { subtitle: "每日活動", text: "每天參與日常活動，累積資源和道具，穩定成長。" },
    ],
  },
  {
    id: 4,
    title: "加入社群",
    icon: Users,
    color: "#9b59b6",
    content: [
      { subtitle: "加入公會", text: "尋找適合的公會加入，享受團隊福利和公會活動。" },
      { subtitle: "組隊副本", text: "與其他玩家組隊挑戰副本，獲取更好的裝備獎勵。" },
      { subtitle: "交流互動", text: "善用聊天頻道與其他玩家交流，互相學習成長。" },
    ],
  },
  {
    id: 5,
    title: "角色培養",
    icon: TrendingUp,
    color: "#f39c12",
    content: [
      { subtitle: "裝備強化", text: "收集材料強化裝備，提升角色戰鬥力。" },
      { subtitle: "技能升級", text: "使用技能書提升技能等級，解鎖更強大的能力。" },
      { subtitle: "武將系統", text: "收集和培養武將，搭配不同的武將組合增強實力。" },
    ],
  },
];

// 職業簡介
const classes = [
  { name: "武將", role: "近戰輸出", difficulty: "簡單", description: "高傷害近戰職業，適合喜歡衝鋒陷陣的玩家" },
  { name: "軍師", role: "遠程法術", difficulty: "中等", description: "強力法術輸出，需要保持距離輸出傷害" },
  { name: "護衛", role: "坦克防禦", difficulty: "簡單", description: "高防禦職業，負責保護隊友承受傷害" },
  { name: "刺客", role: "爆發暗殺", difficulty: "困難", description: "高機動性職業，擅長快速擊殺敵方後排" },
  { name: "弓手", role: "遠程物理", difficulty: "中等", description: "遠程物理輸出，適合喜歡風箏打法的玩家" },
];

export default function BeginnerPage() {
  return (
    <div className="space-y-8">
      {/* 頁面標題 */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center">
          <BookOpen className="w-7 h-7 text-green-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">新手攻略</h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            入門教學與基礎指南，助你快速上手
          </p>
        </div>
      </div>

      {/* 歡迎卡片 */}
      <div className="card p-6 border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
        <div className="flex items-center gap-3 mb-4">
          <Star className="w-6 h-6 text-green-400" />
          <h2 className="text-xl font-bold text-[var(--color-text)]">
            歡迎來到破浪三國！
          </h2>
        </div>
        <p className="text-[var(--color-text-muted)]">
          這裡是專為新玩家準備的攻略指南，幫助你快速了解遊戲世界，踏上征戰三國的旅程。
          請按照以下章節循序漸進學習，很快你就能成為一名優秀的三國英雄！
        </p>
      </div>

      {/* 職業選擇 */}
      <div>
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-[var(--color-primary)]" />
          職業介紹
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls, index) => (
            <div key={index} className="card p-4 hover:border-green-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-[var(--color-text)]">{cls.name}</h3>
                <span className="text-xs px-2 py-1 rounded bg-[var(--color-bg-darker)] text-[var(--color-text-muted)]">
                  {cls.difficulty}
                </span>
              </div>
              <div className="text-sm text-[var(--color-primary)] mb-2">{cls.role}</div>
              <p className="text-sm text-[var(--color-text-muted)]">{cls.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 新手指南章節 */}
      <div className="space-y-6">
        {chapters.map((chapter) => {
          const IconComponent = chapter.icon;
          return (
            <div key={chapter.id} className="card p-6">
              {/* 章節標題 */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[var(--color-border)]">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${chapter.color}20` }}
                >
                  <IconComponent
                    className="w-5 h-5"
                    style={{ color: chapter.color }}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[var(--color-text-dark)]">
                    第 {chapter.id} 章
                  </span>
                  <h2 className="text-xl font-bold text-[var(--color-text)]">
                    {chapter.title}
                  </h2>
                </div>
              </div>

              {/* 章節內容 */}
              <div className="space-y-4">
                {chapter.content.map((item, index) => (
                  <div key={index} className="pl-4 border-l-2 border-[var(--color-border)]">
                    <h3
                      className="font-medium mb-1"
                      style={{ color: chapter.color }}
                    >
                      {item.subtitle}
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)]">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 新手小技巧 */}
      <div className="card p-6 bg-[var(--color-bg-darker)]">
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">
          🎯 新手小技巧
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[var(--color-text-muted)]">
          <ul className="space-y-2">
            <li>• 每天記得簽到領取免費獎勵</li>
            <li>• 優先完成主線任務解鎖功能</li>
            <li>• 加入公會獲得額外經驗加成</li>
          </ul>
          <ul className="space-y-2">
            <li>• 善用自動戰鬥功能刷副本</li>
            <li>• 別急著消耗高級材料，等裝備更好再強化</li>
            <li>• 多參與活動獲取限定獎勵</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

