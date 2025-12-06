"use client";

import Link from "next/link";
import { Crown, MessageSquare, Bell, Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--color-bg-darker)] border-t border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center">
                <Crown className="w-6 h-6 text-[var(--color-bg-dark)]" />
              </div>
              <span className="text-xl font-bold text-[var(--color-text)]">
                破浪三國
              </span>
            </Link>
            <p className="text-[var(--color-text-muted)] max-w-md">
              歡迎來到破浪三國官方網站。在這裡獲取最新遊戲公告、參與社群討論、分享你的遊戲體驗。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[var(--color-text)] font-semibold mb-4">快速連結</h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/"
                className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
              >
                首頁
              </Link>
              <Link
                href="/announcements"
                className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
              >
                <Bell className="w-4 h-4" />
                公告中心
              </Link>
              <Link
                href="/forum"
                className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                討論區
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[var(--color-text)] font-semibold mb-4">聯絡我們</h3>
            <div className="flex flex-col gap-2">
              <a
                href="mailto:support@kingdoms.com"
                className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
              >
                <Mail className="w-4 h-4" />
                support@kingdoms.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[var(--color-border)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[var(--color-text-dark)] text-sm">
            &copy; {currentYear} 破浪三國. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/terms"
              className="text-[var(--color-text-dark)] hover:text-[var(--color-text-muted)] transition-colors"
            >
              服務條款
            </Link>
            <Link
              href="/privacy"
              className="text-[var(--color-text-dark)] hover:text-[var(--color-text-muted)] transition-colors"
            >
              隱私政策
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
