import Link from "next/link";
import { graphqlFetch } from "@/lib/apolloClient";
import { ArrowLeft, Bell, Calendar, Pin } from "lucide-react";

interface Announcement {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  type: string;
  isPinned: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

async function getAnnouncement(slug: string) {
  try {
    const data = await graphqlFetch<{ announcement: Announcement }>(`
      query($slug: String!) {
        announcement(slug: $slug) {
          id
          title
          slug
          content
          excerpt
          type
          isPinned
          publishedAt
          createdAt
          updatedAt
        }
      }
    `, { slug });
    return data.announcement;
  } catch (error) {
    console.error("獲取公告失敗:", error);
    return null;
  }
}

function getTypeStyle(type: string) {
  switch (type) {
    case "update":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
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
    case "update":
      return "版本更新";
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
  return date.toLocaleString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AnnouncementPage({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const announcement = await getAnnouncement(decodedSlug);

  if (!announcement) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-dark)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-4">公告不存在</h1>
          <Link href="/announcements" className="btn btn-primary">
            返回公告列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-dark)]">
      {/* Header */}
      <div className="bg-[var(--color-bg-darker)] border-b border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/announcements"
            className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回公告列表
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="card p-6 md:p-8">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {announcement.isPinned && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs">
                <Pin className="w-3 h-3" />
                置頂
              </span>
            )}
            <span className={`tag ${getTypeStyle(announcement.type)}`}>
              {getTypeLabel(announcement.type)}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text)] mb-4">
            {announcement.title}
          </h1>

          {/* Date */}
          <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm pb-6 border-b border-[var(--color-border)]">
            <Bell className="w-4 h-4" />
            <span>官方公告</span>
            <span className="text-[var(--color-text-dark)]">•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(announcement.publishedAt)}
            </span>
          </div>

          {/* Content */}
          <div
            className="prose mt-6"
            dangerouslySetInnerHTML={{ __html: announcement.content }}
          />
        </article>

        {/* Navigation */}
        <div className="mt-8 flex justify-center">
          <Link href="/announcements" className="btn btn-secondary">
            <ArrowLeft className="w-4 h-4" />
            返回公告列表
          </Link>
        </div>
      </div>
    </div>
  );
}
