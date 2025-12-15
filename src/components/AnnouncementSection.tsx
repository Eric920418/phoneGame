"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bell,
  Calendar,
  ChevronRight,
  Flame,
  Megaphone,
  Swords,
  RefreshCw,
} from "lucide-react";

// 篩選類型
type FilterType = "all" | "event" | "war" | "update";

interface Announcement {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string | null;
  type: string;
  isHot: boolean;
  publishedAt: string;
}

interface AnnouncementSectionProps {
  announcements: Announcement[];
}

// 篩選按鈕配置
const filterButtons: { type: FilterType; label: string; icon: React.ElementType; color: string }[] = [
  { type: "all", label: "最新", icon: Bell, color: "var(--color-primary)" },
  { type: "event", label: "活動", icon: Megaphone, color: "#e74c3c" },
  { type: "general", label: "一般", icon: Bell, color: "#8e44ad" },
  { type: "update", label: "更新", icon: RefreshCw, color: "#3498db" },
];

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" });
}

function getTypeStyle(type: string) {
  switch (type) {
    case "update": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "event": return "bg-red-500/10 text-red-400 border-red-500/20";
    case "maintenance": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    case "war": return "bg-violet-500/10 text-violet-400 border-violet-500/20";
    default: return "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20";
  }
}

function getTypeLabel(type: string) {
  switch (type) {
    case "update": return "更新";
    case "event": return "活動";
    case "maintenance": return "維護";
    case "war": return "團戰";
    default: return "公告";
  }
}

export default function AnnouncementSection({
  announcements,
}: AnnouncementSectionProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  // 根據篩選類型過濾
  const getFilteredAnnouncements = () => {
    if (activeFilter === "all") {
      // 按日期排序，顯示最新的
      return [...announcements].sort((a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    }

    return announcements.filter((a) => a.type === activeFilter);
  };

  const filteredAnnouncements = getFilteredAnnouncements();

  return (
    <div>
      {/* 標題與篩選器 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        {/* 標題 */}
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] flex items-center gap-2 sm:gap-3">
          <div
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: "var(--color-primary)20" }}
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "var(--color-primary)" }} />
          </div>
          公告
        </h2>

        {/* 篩選器 */}
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          {filterButtons.map((btn) => {
            const Icon = btn.icon;
            const isActive = activeFilter === btn.type;
            return (
              <button
                key={btn.type}
                onClick={() => setActiveFilter(btn.type)}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? "text-white"
                    : "bg-[var(--color-bg-darker)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`}
                style={isActive ? { backgroundColor: btn.color } : undefined}
              >
                <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                {btn.label}
              </button>
            );
          })}

          <span className="text-[var(--color-text-dark)] mx-1">|</span>

          {/* 所有公告連結 */}
          <Link
            href="/announcements"
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/30"
          >
            <Megaphone className="w-3 h-3 sm:w-4 sm:h-4" />
            所有公告
          </Link>
        </div>
      </div>

      {/* 公告列表 */}
      {filteredAnnouncements.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredAnnouncements.slice(0, 8).map((announcement) => (
            <Link
              key={announcement.id}
              href={`/announcements/${announcement.slug}`}
              className="card p-3 sm:p-4 hover:border-[var(--color-primary)]/30 transition-all group"
            >
              {/* 圖片 (如果有) */}
              {announcement.coverImage && (
                <div className="relative w-full h-20 sm:h-24 rounded-lg overflow-hidden mb-2 border border-[var(--color-border)]">
                  <Image
                    src={announcement.coverImage}
                    alt={announcement.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              )}

              {/* 標籤 */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {announcement.isHot && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] sm:text-xs font-semibold flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    熱門
                  </span>
                )}
                <span className={`tag ${getTypeStyle(announcement.type)}`}>
                  {getTypeLabel(announcement.type)}
                </span>
              </div>

              {/* 標題 */}
              <h3 className="font-semibold text-sm sm:text-base text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors mb-2 line-clamp-2">
                {announcement.title}
              </h3>

              {/* 摘要 */}
              {announcement.excerpt && !announcement.coverImage && (
                <p className="text-[var(--color-text-muted)] text-xs sm:text-sm mb-2 line-clamp-2">
                  {announcement.excerpt}
                </p>
              )}

              {/* 日期 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] sm:text-xs text-[var(--color-text-muted)]">
                  <Calendar className="w-3 h-3 shrink-0" />
                  {formatDate(announcement.publishedAt)}
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--color-text-dark)] group-hover:text-[var(--color-primary)] transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <Bell className="w-12 h-12 text-[var(--color-text-dark)] mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)]">
            暫無{filterButtons.find(b => b.type === activeFilter)?.label || ""}公告
          </p>
        </div>
      )}

      {/* 查看更多連結 */}
      <div className="mt-4 text-center">
        <Link
          href="/announcements"
          className="text-[var(--color-primary)] hover:text-[var(--color-primary-light)] inline-flex items-center gap-1 text-sm"
        >
          查看所有公告
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
