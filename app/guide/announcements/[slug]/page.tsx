import { ArrowLeft, Calendar, Tag, Megaphone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { graphqlFetch } from "@/lib/apolloClient";
import { notFound } from "next/navigation";

// 強制動態渲染，不使用緩存
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface EventAnnouncement {
  id: number;
  title: string;
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

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const events = await getEventAnnouncements();

  // 使用 id 查詢
  const event = events.find((e) => String(e.id) === slug);

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* 返回按鈕 */}
      <Link
        href="/guide/announcements"
        className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回活動公告
      </Link>

      {/* 活動詳情卡片 */}
      <div className="card overflow-hidden">
        {/* 活動圖片 */}
        {event.image && (
          <div className="relative w-full h-64 sm:h-80 md:h-96">
            <Image
              src={event.image}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* 活動內容 */}
        <div className="p-6 md:p-8">
          {/* 標籤區域 */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {event.isHot && (
              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm font-semibold">
                🔥 熱門
              </span>
            )}
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-bg-darker)] text-[var(--color-text-muted)] text-sm">
              <Tag className="w-3.5 h-3.5" />
              {event.type}
            </span>
            <span className="flex items-center gap-1.5 text-[var(--color-text-dark)] text-sm">
              <Calendar className="w-4 h-4" />
              {event.date}
            </span>
          </div>

          {/* 活動標題 */}
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text)] mb-6">
            {event.title}
          </h1>

          {/* 分隔線 */}
          <div className="border-b border-[var(--color-border)] mb-6" />

          {/* 活動內容 */}
          {event.content ? (
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: event.content }}
            />
          ) : (
            <div className="text-center py-8">
              <Megaphone className="w-12 h-12 text-[var(--color-text-dark)] mx-auto mb-4" />
              <p className="text-[var(--color-text-muted)]">暫無詳細內容</p>
            </div>
          )}
        </div>
      </div>

      {/* 底部返回按鈕 */}
      <div className="flex justify-center">
        <Link href="/guide/announcements" className="btn btn-secondary">
          <ArrowLeft className="w-4 h-4" />
          返回活動公告
        </Link>
      </div>
    </div>
  );
}

