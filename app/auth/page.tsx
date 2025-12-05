"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Crown, Lock, Mail, User, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

type AuthMode = "login" | "register";

const AVATARS = ["👤", "🎮", "🗡️", "🛡️", "👑", "🐉", "🦁", "🦅", "🐺", "🔥"];

export default function AuthPage() {
  const router = useRouter();
  const { user, login, register, error, clearError, isLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    avatar: "👤",
  });
  const [localError, setLocalError] = useState<string | null>(null);

  // 如果已登入，重定向到首頁
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (mode === "register") {
      if (formData.password !== formData.confirmPassword) {
        setLocalError("兩次密碼輸入不一致");
        return;
      }
      if (formData.password.length < 6) {
        setLocalError("密碼長度至少 6 個字符");
        return;
      }
      if (formData.name.length < 2) {
        setLocalError("暱稱長度至少 2 個字符");
        return;
      }

      const success = await register(
        formData.email,
        formData.password,
        formData.name,
        formData.avatar
      );
      if (success) {
        router.push("/");
      }
    } else {
      const success = await login(formData.email, formData.password);
      if (success) {
        router.push("/");
      }
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-[var(--color-bg-dark)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 返回首頁 */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首頁
        </Link>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] mb-4">
            <Crown className="w-8 h-8 text-[var(--color-bg-dark)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            {mode === "login" ? "歡迎回來" : "加入 Kingdoms"}
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            {mode === "login" ? "登入以發表評價" : "創建帳號開始遊戲之旅"}
          </p>
        </div>

        {/* 切換標籤 */}
        <div className="flex mb-6 bg-[var(--color-bg-darker)] rounded-lg p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              clearError();
              setLocalError(null);
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              mode === "login"
                ? "bg-[var(--color-primary)] text-[var(--color-bg-dark)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            登入
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              clearError();
              setLocalError(null);
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              mode === "register"
                ? "bg-[var(--color-primary)] text-[var(--color-bg-dark)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            註冊
          </button>
        </div>

        {/* 表單 */}
        <div className="card p-6">
          {displayError && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{displayError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <>
                {/* 選擇頭像 */}
                <div>
                  <label className="block text-[var(--color-text)] text-sm font-medium mb-2">
                    選擇頭像
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVATARS.map((avatar) => (
                      <button
                        key={avatar}
                        type="button"
                        onClick={() => setFormData({ ...formData, avatar })}
                        className={`w-10 h-10 text-xl rounded-lg transition-all ${
                          formData.avatar === avatar
                            ? "bg-[var(--color-primary)] scale-110"
                            : "bg-[var(--color-bg-darker)] hover:bg-[var(--color-bg-dark)]"
                        }`}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 暱稱 */}
                <div>
                  <label className="block text-[var(--color-text)] text-sm font-medium mb-2">
                    暱稱
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-dark)]" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input pl-10"
                      placeholder="輸入暱稱"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* 電子郵件 */}
            <div>
              <label className="block text-[var(--color-text)] text-sm font-medium mb-2">
                電子郵件
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-dark)]" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input pl-10"
                  placeholder="輸入電子郵件"
                  required
                />
              </div>
            </div>

            {/* 密碼 */}
            <div>
              <label className="block text-[var(--color-text)] text-sm font-medium mb-2">
                密碼
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-dark)]" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input pl-10"
                  placeholder={mode === "register" ? "至少 6 個字符" : "輸入密碼"}
                  required
                />
              </div>
            </div>

            {mode === "register" && (
              <div>
                <label className="block text-[var(--color-text)] text-sm font-medium mb-2">
                  確認密碼
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-dark)]" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="input pl-10"
                    placeholder="再次輸入密碼"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full mt-6 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {mode === "login" ? "登入中..." : "註冊中..."}
                </>
              ) : (
                mode === "login" ? "登入" : "創建帳號"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[var(--color-text-dark)] text-xs mt-6">
          {mode === "login" ? (
            <>
              還沒有帳號？{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                className="text-[var(--color-primary)] hover:underline"
              >
                立即註冊
              </button>
            </>
          ) : (
            <>
              已有帳號？{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-[var(--color-primary)] hover:underline"
              >
                立即登入
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
