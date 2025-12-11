import Link from "next/link";
import { graphqlFetch } from "@/lib/apolloClient";
import { Bell, Calendar, ChevronRight, Pin, Filter } from "lucide-react";

interface Announcement {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  type: string;
  isPinned: boolean;
  publishedAt: string;
}

interface AnnouncementsResponse {
  announcements: Announcement[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

async function getAnnouncements(type?: string, page = 1) {
  try {
    const data = await graphqlFetch<{ announcements: AnnouncementsResponse }>(`
      query($page: Int, $type: String) {
        announcements(page: $page, pageSize: 20, type: $type) {
          announcements {
            id
            title
            slug
            excerpt
            type
            isPinned
            publishedAt
          }
          total
          page
          pageSize
          hasMore
        }
      }
    `, { page, type });
    return data.announcements;
  } catch (error) {
    console.error("獲取公告失敗:", error);
    return { announcements: [], total: 0, page: 1, pageSize: 20, hasMore: false };
  }
}

function getTypeStyle(type: string) {
  switch (type) {
    case "event":
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case "maintenance":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    default:
      return "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20";
  }
}

function getTypeLabel(type: string) {
  switch (type) {
    case "event":
      return "活動公告";
    case "maintenance":
      return "維護公告";
    default:
      return "一般公告";
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const typeOptions = [
  { value: "", label: "全部" },
  { value: "general", label: "一般公告" },
  { value: "event", label: "活動公告" },
  { value: "maintenance", label: "維護公告" },
];

interface PageProps {
  searchParams: Promise<{ type?: string; page?: string }>;
}

export default async function AnnouncementsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentType = params.type || "";
  const currentPage = parseInt(params.page || "1");

  const data = await getAnnouncements(currentType || undefined, currentPage);

  return (
    <div className="min-h-screen bg-[var(--color-bg-dark)]">
      {/* Header */}
      <div className="bg-[var(--color-bg-darker)] border-b border-[var(--color-border)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-[var(--color-text)] flex items-center gap-3">
            <Bell className="w-8 h-8 text-[var(--color-primary)]" />
            公告中心
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            獲取最新遊戲消息、更新公告和活動資訊
          </p>

          {/* Filters */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--color-text-muted)]" />
            {typeOptions.map((option) => (
              <Link
                key={option.value}
                href={option.value ? `/announcements?type=${option.value}` : "/announcements"}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  currentType === option.value
                    ? "bg-[var(--color-primary)] text-[var(--color-bg-dark)]"
                    : "bg-[var(--color-bg-card)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]"
                }`}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <span className="text-[var(--color-text-muted)]">
            共 {data.total} 則公告
          </span>
        </div>

        <div className="space-y-4">
          {data.announcements.length > 0 ? (
            data.announcements.map((announcement) => (
              <Link
                key={announcement.id}
                href={`/announcements/${announcement.slug}`}
                className="card p-5 flex items-start gap-4 group"
              >
                <div className="flex-shrink-0 mt-1">
                  {announcement.isPinned ? (
                    <Pin className="w-5 h-5 text-[var(--color-primary)]" />
                  ) : (
                    <Bell className="w-5 h-5 text-[var(--color-text-dark)]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {announcement.isPinned && (
                      <span className="inline-flex items-center gap-1 text-[var(--color-primary)] text-xs font-medium">
                        置頂
                      </span>
                    )}
                    <span className={`tag ${getTypeStyle(announcement.type)}`}>
                      {getTypeLabel(announcement.type)}
                    </span>
                    <span className="text-[var(--color-text-dark)] text-xs flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(announcement.publishedAt)}
                    </span>
                  </div>

                  <h2 className="text-lg text-[var(--color-text)] font-medium group-hover:text-[var(--color-primary)] transition-colors">
                    {announcement.title}
                  </h2>

                  {announcement.excerpt && (
                    <p className="text-[var(--color-text-muted)] text-sm mt-2 line-clamp-2">
                      {announcement.excerpt}
                    </p>
                  )}
                </div>

                <ChevronRight className="w-5 h-5 text-[var(--color-text-dark)] group-hover:text-[var(--color-primary)] transition-colors flex-shrink-0" />
              </Link>
            ))
          ) : (
            <div className="card p-12 text-center">
              <Bell className="w-16 h-16 text-[var(--color-text-dark)] mx-auto mb-4" />
              <p className="text-[var(--color-text-muted)] text-lg">暫無公告</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {data.total > data.pageSize && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {currentPage > 1 && (
              <Link
                href={`/announcements?${currentType ? `type=${currentType}&` : ''}page=${currentPage - 1}`}
                className="btn btn-secondary"
              >
                上一頁
              </Link>
            )}
            <span className="px-4 py-2 text-[var(--color-text-muted)]">
              第 {currentPage} 頁
            </span>
            {data.hasMore && (
              <Link
                href={`/announcements?${currentType ? `type=${currentType}&` : ''}page=${currentPage + 1}`}
                className="btn btn-secondary"
              >
                下一頁
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
