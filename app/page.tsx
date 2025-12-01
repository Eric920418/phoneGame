import Link from "next/link";
import { graphqlFetch } from "@/lib/apolloClient";
import { Bell, MessageSquare, ChevronRight, Flame, Calendar, Users } from "lucide-react";
import Image from "next/image";

interface Announcement {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  type: string;
  publishedAt: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  postCount: number;
}

async function getHomeData() {
  try {
    const data = await graphqlFetch<{
      latestAnnouncements: Announcement[];
      categories: Category[];
    }>(`
      query {
        latestAnnouncements(limit: 5) {
          id
          title
          slug
          excerpt
          type
          publishedAt
        }
        categories {
          id
          name
          slug
          description
          icon
          color
          postCount
        }
      }
    `);
    return data;
  } catch (error) {
    console.error("獲取首頁數據失敗:", error);
    return {
      latestAnnouncements: [],
      categories: [],
    };
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
      return "更新";
    case "event":
      return "活動";
    case "maintenance":
      return "維護";
    default:
      return "公告";
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

export default async function HomePage() {
  const { latestAnnouncements, categories } = await getHomeData();

  return (
    <div className="min-h-screen">
      {/* Hero Section - 主視覺全屏背景，-mt-16 讓圖片延伸到 header 後面 */}
      <section className="relative h-[calc(100vh+4rem)] min-h-[564px]  overflow-hidden -mt-16">
        {/* 主視覺背景圖 */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/破浪三國主視覺.png')" }}
        />
      </section>

      {/* Stats Section */}
      <section className="bg-[var(--color-bg-darker)] border-y border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--color-primary)]">
                1000+
              </div>
              <div className="text-[var(--color-text-muted)] text-sm">
                活躍玩家
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--color-primary)]">
                50+
              </div>
              <div className="text-[var(--color-text-muted)] text-sm">
                遊戲更新
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--color-primary)]">
                24/7
              </div>
              <div className="text-[var(--color-text-muted)] text-sm">
                客服支援
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--color-primary)]">
                99.9%
              </div>
              <div className="text-[var(--color-text-muted)] text-sm">
                服務穩定
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section with decorative background */}
      <section className="relative mx-auto h-[100vh]">
        {/* 裝飾框背景圖 - 按原圖比例顯示 */}
        <Image
          src="/布料底图.png"
          alt="布料底图"
          width={1920}
          height={1080}
          className="w-full h-full object-contain z-0"
        />

        <div className="absolute inset-0 p-16 ">
          <Image
            src="/金属框.png"
            alt="金属框"
            width={1920}
            height={2000}
            className="w-full h-full object-contain"
          />
        </div>

        {/* 內容層 - 絕對定位疊加在圖片上 */}
        <div className="absolute inset-0 top-[18%] py-32 px-64">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 ">
            {/* Announcements Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
                  <Bell className="w-6 h-6 text-[var(--color-primary)]" />
                  最新公告
                </h2>
                <Link
                  href="/announcements"
                  className="text-[var(--color-primary)] hover:text-[var(--color-primary-light)] flex items-center gap-1 text-sm"
                >
                  查看全部
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {latestAnnouncements.length > 0 ? (
                  latestAnnouncements.map((announcement) => (
                    <Link
                      key={announcement.id}
                      href={`/announcements/${announcement.slug}`}
                      className="card p-4 flex items-start gap-4 group"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <Flame className="w-5 h-5 text-[var(--color-primary)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`tag ${getTypeStyle(announcement.type)}`}
                          >
                            {getTypeLabel(announcement.type)}
                          </span>
                          <span className="text-[var(--color-text-dark)] text-xs flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(announcement.publishedAt)}
                          </span>
                        </div>
                        <h3 className="text-[var(--color-text)] font-medium group-hover:text-[var(--color-primary)] transition-colors truncate">
                          {announcement.title}
                        </h3>
                        {announcement.excerpt && (
                          <p className="text-[var(--color-text-muted)] text-sm mt-1 line-clamp-2">
                            {announcement.excerpt}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-[var(--color-text-dark)] group-hover:text-[var(--color-primary)] transition-colors flex-shrink-0" />
                    </Link>
                  ))
                ) : (
                  <div className="card p-8 text-center">
                    <Bell className="w-12 h-12 text-[var(--color-text-dark)] mx-auto mb-4" />
                    <p className="text-[var(--color-text-muted)]">暫無公告</p>
                  </div>
                )}
              </div>
            </div>

            {/* Forum Categories Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-[var(--color-primary)]" />
                  討論區
                </h2>
                <Link
                  href="/forum"
                  className="text-[var(--color-primary)] hover:text-[var(--color-primary-light)] flex items-center gap-1 text-sm"
                >
                  進入
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-3">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/forum?category=${category.slug}`}
                      className="card p-4 flex items-center gap-3 group"
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        {category.icon || "💬"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[var(--color-text)] font-medium group-hover:text-[var(--color-primary)] transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-[var(--color-text-muted)] text-sm truncate">
                          {category.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-[var(--color-text-dark)] text-sm">
                        <Users className="w-4 h-4" />
                        {category.postCount}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="card p-8 text-center">
                    <MessageSquare className="w-12 h-12 text-[var(--color-text-dark)] mx-auto mb-4" />
                    <p className="text-[var(--color-text-muted)]">暫無分類</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
