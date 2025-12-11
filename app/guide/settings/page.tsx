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
  value?: string;
  description?: string;
  recommended?: string;
}

interface SettingsCategory {
  id?: string;
  name?: string;
  category?: string;  // 後台使用的欄位名稱
  icon?: string;
  color?: string;
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

// 預設顏色列表
const defaultColors = ['#3498db', '#2ecc71', '#9b59b6', '#e74c3c', '#f39c12', '#1abc9c'];

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
            遊戲指令與快捷鍵說明
          </p>
        </div>
      </div>

      {/* 設定分類列表 */}
      {settingsCategories.length > 0 ? (
        <div className="space-y-6">
          {settingsCategories.map((group, groupIndex) => {
            // 使用 category 欄位（後台輸入的設定組名稱），fallback 到 name
            const displayTitle = group.category || group.name || `設定組 #${groupIndex + 1}`;
            const displayColor = group.color || defaultColors[groupIndex % defaultColors.length];
            const IconComponent = group.icon ? (iconMap[group.icon] || Settings) : Settings;

            return (
              <div key={group.id || groupIndex} className="card p-6">
                {/* 分類標題 */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[var(--color-border)]">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${displayColor}20` }}
                  >
                    <IconComponent
                      className="w-5 h-5"
                      style={{ color: displayColor }}
                    />
                  </div>
                  <h2 className="text-xl font-bold text-[var(--color-text)]">
                    {displayTitle}
                  </h2>
                </div>

                {/* 設定項目列表 - 使用 name 和 value */}
                <div className="space-y-3">
                  {(group.settings || []).map((setting, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-4 py-3 px-4 rounded-lg bg-[var(--color-bg-darker)] hover:bg-[var(--color-bg-card-hover)] transition-colors"
                    >
                      <span className="font-medium text-[var(--color-text)]">
                        {setting.name}
                      </span>
                      <span
                        className="font-mono text-sm px-3 py-1 rounded-lg"
                        style={{
                          backgroundColor: `${displayColor}15`,
                          color: displayColor
                        }}
                      >
                        {setting.value || setting.recommended || '-'}
                      </span>
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
    </div>
  );
}
