"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Crown, MessageSquare, Bell, Star, ChevronDown, Settings, BookOpen, Search, Gift, Download, Megaphone } from "lucide-react";
import UserMenu from "./UserMenu";

// 下拉選單項目介面
interface DropdownItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

// 導航項目介面
interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  dropdown?: DropdownItem[];
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState<string | null>(null);

  const navItems: NavItem[] = [
    {
      href: "/",
      label: "首頁",
      icon: Crown,
      dropdown: [
        { href: "/#settings", label: "遊戲設定", icon: Settings },
        { href: "/#beginner", label: "新手攻略", icon: BookOpen },
        { href: "/#drops", label: "掉落查詢", icon: Search },
        { href: "/#treasure", label: "寶相福袋內容", icon: Gift },
        { href: "/#download", label: "下載專區", icon: Download },
      ]
    },
    {
      href: "/announcements",
      label: "公告",
      icon: Bell,
      dropdown: [
        { href: "/#announcements", label: "活動公告", icon: Megaphone },
        { href: "/announcements", label: "最新公告", icon: Bell },
      ]
    },
    { href: "/forum", label: "論壇", icon: MessageSquare },
    { href: "/#reviews", label: "玩家評價", icon: Star },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-bg-darker)]/95 backdrop-blur-sm border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 左側佔位 - 保持導航居中 */}
          <div className="w-24 md:hidden" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.dropdown && setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                {item.dropdown ? (
                  // 有下拉選單的項目
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-card)] transition-all"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  // 無下拉選單的項目 - 直接跳轉
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-card)] transition-all"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )}

                {/* 下拉選單 */}
                {item.dropdown && openDropdown === item.label && (
                  <div className="absolute top-full left-0 pt-2 min-w-[180px]">
                    <div className="py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg shadow-xl animate-fadeIn">
                      {item.dropdown.map((dropItem) => (
                        <Link
                          key={dropItem.href}
                          href={dropItem.href}
                          className="flex items-center gap-3 px-4 py-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-card)] transition-all"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <dropItem.icon className="w-4 h-4" />
                          <span className="text-sm">{dropItem.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* 右側：用戶菜單 */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <UserMenu />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-card)] transition-all"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-[var(--color-border)] animate-fadeIn">
            {/* 移動端用戶菜單 */}
            <div className="px-4 pb-4 border-b border-[var(--color-border)] mb-2">
              <UserMenu />
            </div>

            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <div key={item.label}>
                  {item.dropdown ? (
                    // 有下拉選單的項目
                    <>
                      <button
                        onClick={() => setMobileOpenDropdown(mobileOpenDropdown === item.label ? null : item.label)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-card)] transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform ${mobileOpenDropdown === item.label ? 'rotate-180' : ''}`} />
                      </button>
                      {/* 手機版下拉選單內容 */}
                      {mobileOpenDropdown === item.label && (
                        <div className="ml-4 pl-4 border-l border-[var(--color-border)] animate-fadeIn">
                          {item.dropdown.map((dropItem) => (
                            <Link
                              key={dropItem.href}
                              href={dropItem.href}
                              onClick={() => {
                                setIsMenuOpen(false);
                                setMobileOpenDropdown(null);
                              }}
                              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-card)] transition-all"
                            >
                              <dropItem.icon className="w-4 h-4" />
                              <span className="text-sm">{dropItem.label}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    // 無下拉選單的項目 - 直接跳轉
                    <Link
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-card)] transition-all"
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
