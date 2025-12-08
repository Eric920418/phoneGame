import { BookOpen, User, Swords, Map, Users, Star, Target, TrendingUp } from "lucide-react";
import { graphqlFetch } from "@/lib/apolloClient";

// 強制動態渲染
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * 新手攻略頁面
 * 提供新玩家入門指南與基礎教學
 */

interface ChapterContent {
  subtitle: string;
  text: string;
}

interface Chapter {
  id: number;
  title: string;
  icon: string;
  color: string;
  content: ChapterContent[];
}

interface ClassInfo {
  name: string;
  role: string;
  difficulty: string;
  description: string;
}

interface BeginnerData {
  chapters: Chapter[];
  classes: ClassInfo[];
}

interface ContentBlock {
  key: string;
  payload: BeginnerData;
}

// 圖標映射
const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  User,
  Swords,
  Map,
  Users,
  TrendingUp,
};

async function getBeginnerData(): Promise<BeginnerData> {
  try {
    const data = await graphqlFetch<{ contentBlock: ContentBlock | null }>(`
      query {
        contentBlock(key: "beginnerGuide") {
          key
          payload
        }
      }
    `, undefined, { skipCache: true });

    if (data.contentBlock?.payload) {
      return data.contentBlock.payload;
    }
    return { chapters: [], classes: [] };
  } catch (error) {
    console.error("獲取新手攻略資料失敗:", error);
    return { chapters: [], classes: [] };
  }
}

export default async function BeginnerPage() {
  const { chapters, classes } = await getBeginnerData();

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
      {classes.length > 0 && (
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
      )}

      {/* 新手指南章節 */}
      {chapters.length > 0 && (
        <div className="space-y-6">
          {chapters.map((chapter) => {
            const IconComponent = iconMap[chapter.icon] || User;
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
                  {(chapter.content || []).map((item, index) => (
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
      )}

      {/* 空狀態 */}
      {chapters.length === 0 && classes.length === 0 && (
        <div className="card p-12 text-center">
          <BookOpen className="w-16 h-16 text-[var(--color-text-dark)] mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)]">暫無新手攻略資料</p>
        </div>
      )}

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
