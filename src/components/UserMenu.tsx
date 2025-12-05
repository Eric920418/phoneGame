"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  LogOut,
  Star,
  ChevronDown,
  Loader2,
} from "lucide-react";

export default function UserMenu() {
  const { user, isLoading, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 點擊外部關閉菜單
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <Link
        href="/auth"
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-[var(--color-bg-dark)] font-medium hover:bg-[var(--color-primary-light)] transition-colors"
      >
        <User className="w-4 h-4" />
        <span>登入</span>
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-bg-darker)] hover:bg-[var(--color-bg-dark)] transition-colors"
      >
        <span className="text-xl">{user.avatar || "👤"}</span>
        <span className="text-[var(--color-text)] font-medium max-w-[100px] truncate">
          {user.name}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 py-2 bg-[var(--color-bg-card)] rounded-lg border border-[var(--color-border)] shadow-xl z-50">
          {/* 用戶信息 */}
          <div className="px-4 py-3 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{user.avatar || "👤"}</span>
              <div>
                <p className="text-[var(--color-text)] font-medium">{user.name}</p>
                <p className="text-[var(--color-text-muted)] text-sm">{user.email}</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
              <Star className="w-4 h-4 text-[var(--color-primary)]" />
              <span>遊戲時數：{user.gameHours} 小時</span>
            </div>
          </div>

          {/* 菜單項 */}
          <div className="py-2">
            <Link
              href="/#reviews"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-[var(--color-text)] hover:bg-[var(--color-bg-darker)] transition-colors"
            >
              <Star className="w-4 h-4 text-[var(--color-text-muted)]" />
              <span>我的評價</span>
            </Link>
          </div>

          {/* 登出 */}
          <div className="border-t border-[var(--color-border)] pt-2">
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>登出</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
