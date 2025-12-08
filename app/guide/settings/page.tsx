import { Settings, Monitor, Volume2, Gamepad2, Globe, Palette, Shield } from "lucide-react";
import { graphqlFetch } from "@/lib/apolloClient";

// 強制動態渲染
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * 遊戲設定頁面
 * 提供遊戲內各項設定的說明與建議
 */

interface SettingItem {
  name: string;
  description: string;
  recommended: string;
}

interface SettingsCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  settings: SettingItem[];
}

interface ContentBlock {
  key: string;
  payload: SettingsCategory[];
}

// 圖標映射
const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Monitor,
  Volume2,
  Gamepad2,
  Globe,
  Palette,
  Shield,
};

async function getSettingsData(): Promise<SettingsCategory[]> {
  try {
    const data = await graphqlFetch<{ contentBlock: ContentBlock | null }>(`
      query {
        contentBlock(key: "gameSettings") {
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
    console.error("獲取設定資料失敗:", error);
    return [];
  }
}

export default async function SettingsPage() {
  const settingsCategories = await getSettingsData();

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
      {settingsCategories.length > 0 ? (
        <div className="space-y-6">
          {settingsCategories.map((category) => {
            const IconComponent = iconMap[category.icon] || Settings;
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
                  {(category.settings || []).map((setting, index) => (
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
      ) : (
        <div className="card p-12 text-center">
          <Settings className="w-16 h-16 text-[var(--color-text-dark)] mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)]">暫無設定資料</p>
        </div>
      )}

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
