import { Settings, Monitor, Volume2, Gamepad2, Globe, Palette, Shield } from "lucide-react";

/**
 * 遊戲設定頁面
 * 提供遊戲內各項設定的說明與建議
 */

// 設定分類
const settingsCategories = [
  {
    id: "graphics",
    name: "畫面設定",
    icon: Monitor,
    color: "#3498db",
    settings: [
      { name: "解析度", description: "建議設定為螢幕原生解析度以獲得最佳畫質", recommended: "1920x1080" },
      { name: "畫面品質", description: "根據電腦配置選擇，建議中高配置選擇「高」", recommended: "高" },
      { name: "幀數上限", description: "建議開啟垂直同步或設定為 60 FPS 以減少畫面撕裂", recommended: "60 FPS" },
      { name: "陰影品質", description: "對效能影響較大，低配電腦建議設為「低」", recommended: "中" },
      { name: "特效品質", description: "技能特效的細緻程度，建議設為「中」以上", recommended: "高" },
    ],
  },
  {
    id: "audio",
    name: "音效設定",
    icon: Volume2,
    color: "#2ecc71",
    settings: [
      { name: "主音量", description: "控制遊戲整體音量", recommended: "70%" },
      { name: "背景音樂", description: "遊戲背景音樂音量", recommended: "50%" },
      { name: "音效", description: "技能與環境音效音量", recommended: "80%" },
      { name: "語音", description: "角色語音與對話音量", recommended: "100%" },
    ],
  },
  {
    id: "controls",
    name: "操作設定",
    icon: Gamepad2,
    color: "#9b59b6",
    settings: [
      { name: "鏡頭靈敏度", description: "滑鼠移動鏡頭的靈敏程度", recommended: "中" },
      { name: "技能快捷鍵", description: "可自訂技能施放的按鍵配置", recommended: "1-9 數字鍵" },
      { name: "自動攻擊", description: "是否啟用自動普攻功能", recommended: "開啟" },
      { name: "智慧施法", description: "技能是否直接對目標施放", recommended: "開啟" },
    ],
  },
  {
    id: "network",
    name: "網路設定",
    icon: Globe,
    color: "#e74c3c",
    settings: [
      { name: "自動選擇伺服器", description: "系統自動選擇延遲最低的伺服器", recommended: "開啟" },
      { name: "顯示延遲", description: "在畫面上顯示網路延遲數值", recommended: "開啟" },
      { name: "流量優化", description: "減少數據傳輸量，適合網路不穩定時使用", recommended: "關閉" },
    ],
  },
  {
    id: "interface",
    name: "介面設定",
    icon: Palette,
    color: "#f39c12",
    settings: [
      { name: "UI 縮放", description: "調整介面元素的大小", recommended: "100%" },
      { name: "顯示傷害數字", description: "是否顯示戰鬥傷害數值", recommended: "開啟" },
      { name: "顯示玩家名稱", description: "是否顯示其他玩家的名稱", recommended: "開啟" },
      { name: "小地圖透明度", description: "右上角小地圖的透明程度", recommended: "70%" },
    ],
  },
  {
    id: "privacy",
    name: "隱私設定",
    icon: Shield,
    color: "#1abc9c",
    settings: [
      { name: "接受好友邀請", description: "是否允許其他玩家發送好友邀請", recommended: "開啟" },
      { name: "接受組隊邀請", description: "是否允許其他玩家發送組隊邀請", recommended: "開啟" },
      { name: "接受私訊", description: "是否允許接收私人訊息", recommended: "好友限定" },
      { name: "顯示上線狀態", description: "是否讓其他玩家看到您的上線狀態", recommended: "好友可見" },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      {/* 頁面標題 */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center">
          <Settings className="w-7 h-7 text-purple-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">遊戲設定</h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            系統配置說明與最佳化建議
          </p>
        </div>
      </div>

      {/* 設定分類列表 */}
      <div className="space-y-6">
        {settingsCategories.map((category) => {
          const IconComponent = category.icon;
          return (
            <div key={category.id} className="card p-6">
              {/* 分類標題 */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[var(--color-border)]">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <IconComponent
                    className="w-5 h-5"
                    style={{ color: category.color }}
                  />
                </div>
                <h2 className="text-xl font-bold text-[var(--color-text)]">
                  {category.name}
                </h2>
              </div>

              {/* 設定項目列表 */}
              <div className="space-y-4">
                {category.settings.map((setting, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between gap-4 py-3 border-b border-[var(--color-border)]/50 last:border-0"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-[var(--color-text)] mb-1">
                        {setting.name}
                      </h3>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        {setting.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className="text-xs text-[var(--color-text-dark)]">
                        建議設定
                      </span>
                      <div
                        className="text-sm font-medium mt-1"
                        style={{ color: category.color }}
                      >
                        {setting.recommended}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 小提示 */}
      <div className="card p-6 bg-[var(--color-bg-darker)]">
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">
          💡 優化小提示
        </h3>
        <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
          <li>• 如果遊戲運行不順暢，建議先降低畫面品質和陰影設定</li>
          <li>• 國戰期間建議關閉部分特效以確保遊戲流暢</li>
          <li>• 定期清理遊戲快取可以改善載入速度</li>
          <li>• 使用有線網路連接可以獲得更穩定的遊戲體驗</li>
        </ul>
      </div>
    </div>
  );
}

