import { Megaphone, Calendar, Tag, ChevronRight, ImageIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { graphqlFetch } from "@/lib/apolloClient";

// 強制動態渲染，不使用緩存
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * 活動公告頁面
 * 展示遊戲內各種活動與公告資訊
 */

interface EventAnnouncement {
  id: number;
  title: string;
  slug?: string;
  date: string;
  type: string;
  isHot: boolean;
  image?: string;
  content?: string;
}

interface ContentBlock {
  key: string;
  payload: EventAnnouncement[];
}

async function getEventAnnouncements(): Promise<EventAnnouncement[]> {
  try {
    const data = await graphqlFetch<{ contentBlock: ContentBlock | null }>(`
      query {
        contentBlock(key: "eventAnnouncements") {
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
    console.error("獲取活動公告失敗:", error);
    return [];
  }
}

export default async function AnnouncementsPage() {
  const events = await getEventAnnouncements();

  return (
    <div className="space-y-8">
      {/* 頁面標題 */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-red-500/20 flex items-center justify-center">
          <Megaphone className="w-7 h-7 text-red-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">活動公告</h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            最新活動資訊與遊戲更新公告
          </p>
        </div>
      </div>

      {/* 活動列表 */}
      <div className="space-y-4">
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/guide/announcements/${event.id}`}
            className="card p-6 group hover:border-red-500/30 transition-all block"
          >
            <div className="flex items-start gap-4">
              {/* 活動圖片 */}
              {event.image ? (
                <div className="relative w-32 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-[var(--color-border)]">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              ) : (
                <div className="w-32 h-24 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0 border border-[var(--color-border)]">
                  <ImageIcon className="w-8 h-8 text-red-400/50" />
                </div>
              )}

              {/* 活動內容 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  {/* 熱門標籤 */}
                  {event.isHot && (
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold">
                      🔥 熱門
                    </span>
                  )}
                  {/* 活動類型 */}
                  <span className="flex items-center gap-1 text-[var(--color-text-muted)] text-sm">
                    <Tag className="w-3 h-3" />
                    {event.type}
                  </span>
                </div>

                {/* 活動標題 */}
                <h3 className="text-xl font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors mb-2 truncate">
                  {event.title}
                </h3>

                {/* 活動日期 */}
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-dark)]">
                  <Calendar className="w-4 h-4" />
                  <span>{event.date}</span>
                </div>
              </div>

              {/* 查看詳情按鈕 */}
              <div className="flex items-center gap-1 text-[var(--color-primary)] text-sm whitespace-nowrap self-center">
                <span className="hidden sm:inline">查看詳情</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 空狀態提示 */}
      {events.length === 0 && (
        <div className="card p-12 text-center">
          <Megaphone className="w-16 h-16 text-[var(--color-text-dark)] mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)]">暫無活動公告</p>
        </div>
      )}
    </div>
  );
}
