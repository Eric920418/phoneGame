import Link from "next/link";
import {
  ChevronLeft,
  Megaphone,
  Heart,
  Download,
  Settings,
  BookOpen,
  Search,
  Map,
  Gift,
  Skull,
  Swords,
  Trophy,
} from "lucide-react";

// 側邊欄導航項目配置
const sidebarItems = [
  { id: "announcements", name: "活動公告", icon: Megaphone, href: "/guide/announcements" },
  { id: "sponsor", name: "贊助活動", icon: Heart, href: "/guide/sponsor" },
  { id: "download", name: "下載專區", icon: Download, href: "/guide/download" },
  { id: "settings", name: "遊戲設定", icon: Settings, href: "/guide/settings" },
  { id: "beginner", name: "新手攻略", icon: BookOpen, href: "/guide/beginner" },
  { id: "drops", name: "掉落查詢", icon: Search, href: "/guide/drops" },
  { id: "dungeon", name: "副本介紹", icon: Map, href: "/guide/dungeon" },
  { id: "treasure", name: "寶箱內容", icon: Gift, href: "/guide/treasure" },
  { id: "boss", name: "BOSS介紹", icon: Skull, href: "/guide/boss" },
  { id: "nation-war", name: "國戰時間", icon: Swords, href: "/guide/nation-war" },
  { id: "arena", name: "武魂擂台", icon: Trophy, href: "/guide/arena" },
];

/**
 * Guide 區塊共用 Layout
 * 提供側邊欄導航和統一的頁面結構
 */
export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-bg-dark)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回首頁按鈕 */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          返回首頁
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 側邊欄導航 */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="sticky top-24 space-y-1">
              <h2 className="text-[var(--color-text)] font-bold text-lg mb-4 px-3">
                遊戲資訊
              </h2>
              {sidebarItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-card)] transition-all group"
                  >
                    <IconComponent className="w-4 h-4 group-hover:text-[var(--color-primary)] transition-colors" />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* 主內容區 */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}

