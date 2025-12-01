"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Crown, Lock, User, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("帳號或密碼錯誤");
      } else {
        router.push("/admin/dashboard");
        router.refresh();
      }
    } catch {
      setError("登入失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-dark)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] mb-4">
            <Crown className="w-8 h-8 text-[var(--color-bg-dark)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">管理後台</h1>
          <p className="text-[var(--color-text-muted)] mt-1">請登入以繼續</p>
        </div>

        {/* Login Form */}
        <div className="card p-6">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[var(--color-text)] text-sm font-medium mb-2">
                帳號
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-dark)]" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="input pl-10"
                  placeholder="輸入帳號"
                  required
                />
              </div>
            </div>

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
                  placeholder="輸入密碼"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full mt-6"
            >
              {loading ? "登入中..." : "登入"}
            </button>
          </form>
        </div>

        <p className="text-center text-[var(--color-text-dark)] text-xs mt-6">
          預設帳號: admin / admin123
        </p>
      </div>
    </div>
  );
}
