"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Crown, Bell, MessageSquare, FolderOpen, LogOut, Settings, Users, BarChart } from "lucide-react";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[var(--color-bg-dark)] flex items-center justify-center">
        <div className="animate-pulse text-[var(--color-text-muted)]">載入中...</div>
      </div>
    );
  }

  if (!session) {
    router.push("/admin/login");
    return null;
  }

  const menuItems = [
    {
      title: "公告管理",
      description: "發布和管理官方公告",
      icon: Bell,
      href: "/admin/announcements",
      color: "#c9a227",
    },
    {
      title: "論壇管理",
      description: "管理論壇帖子和評論",
      icon: MessageSquare,
      href: "/admin/posts",
      color: "#3b82f6",
    },
    {
      title: "分類管理",
      description: "管理論壇分類",
      icon: FolderOpen,
      href: "/admin/categories",
      color: "#22c55e",
    },
  ];

  const stats = [
    { label: "總公告數", value: "12", icon: Bell },
    { label: "總帖子數", value: "156", icon: MessageSquare },
    { label: "總分類數", value: "5", icon: FolderOpen },
    { label: "本月瀏覽", value: "2.4K", icon: BarChart },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-dark)]">
      {/* Header */}
      <header className="bg-[var(--color-bg-darker)] border-b border-[var(--color-border)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center">
                <Crown className="w-6 h-6 text-[var(--color-bg-dark)]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[var(--color-text)]">Kingdoms 管理後台</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                <Users className="w-4 h-4" />
                <span className="text-sm">{session.user?.name}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-400/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">登出</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[var(--color-text)]">
            歡迎回來，{session.user?.name}
          </h2>
          <p className="text-[var(--color-text-muted)] mt-1">
            管理你的遊戲網站內容
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--color-text)]">{stat.value}</div>
                  <div className="text-[var(--color-text-muted)] text-sm">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Menu */}
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">管理功能</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="card p-6 group"
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: `${item.color}15` }}
              >
                <item.icon className="w-6 h-6" style={{ color: item.color }} />
              </div>
              <h4 className="text-lg font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                {item.title}
              </h4>
              <p className="text-[var(--color-text-muted)] text-sm mt-1">
                {item.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] text-sm transition-colors"
          >
            查看前台網站 →
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center gap-1 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] text-sm transition-colors"
          >
            <Settings className="w-4 h-4" />
            系統設定
          </Link>
        </div>
      </main>
    </div>
  );
}
