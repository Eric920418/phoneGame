"use client";

import { useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import { graphqlFetch } from "@/lib/apolloClient";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ICONS = ["💬", "📖", "🐛", "💡", "🎮", "📢", "❓", "🔧", "🎨", "⚔️", "🏰", "👑", "🎯", "📊"];
const COLORS = ["#c9a227", "#e91e63", "#f44336", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3", "#00bcd4", "#009688", "#4caf50", "#8bc34a", "#ff9800"];

export default function AddCategoryModal({ isOpen, onClose, onSuccess }: AddCategoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "💬",
    color: "#c9a227",
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
      .replace(/^-|-$/g, "")
      + "-" + Date.now();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.name) {
      setError("請輸入分類名稱");
      setLoading(false);
      return;
    }

    try {
      const slug = generateSlug(formData.name);
      await graphqlFetch(`
        mutation($input: CreateCategoryInput!) {
          createCategory(input: $input) {
            id
            name
            slug
          }
        }
      `, {
        input: {
          name: formData.name,
          slug,
          description: formData.description || null,
          icon: formData.icon,
          color: formData.color,
        },
      });

      setFormData({ name: "", description: "", icon: "💬", color: "#c9a227" });
      onSuccess();
      onClose();
    } catch (err) {
      console.error("新增分類失敗:", err);
      setError(err instanceof Error ? err.message : "新增失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <h3 className="text-lg font-semibold text-[var(--color-text)]">新增分類</h3>
          <button
            onClick={onClose}
            className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-[var(--color-text)] text-sm font-medium mb-2">
              分類名稱 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input w-full"
              placeholder="例如：新手專區"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[var(--color-text)] text-sm font-medium mb-2">
              描述
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input w-full"
              placeholder="簡短描述這個分類"
            />
          </div>

          {/* Icon */}
          <div>
            <label className="block text-[var(--color-text)] text-sm font-medium mb-2">
              圖示
            </label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                    formData.icon === icon
                      ? "bg-[var(--color-primary)] ring-2 ring-[var(--color-primary)]"
                      : "bg-[var(--color-bg-dark)] hover:bg-[var(--color-bg)]"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-[var(--color-text)] text-sm font-medium mb-2">
              顏色
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full transition-all ${
                    formData.color === color ? "ring-2 ring-offset-2 ring-offset-[var(--color-bg-darker)]" : ""
                  }`}
                  style={{ backgroundColor: color, ringColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-3 rounded-lg bg-[var(--color-bg-dark)] border border-[var(--color-border)]">
            <p className="text-[var(--color-text-muted)] text-xs mb-2">預覽</p>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded flex items-center justify-center text-sm"
                style={{ backgroundColor: `${formData.color}20` }}
              >
                {formData.icon}
              </div>
              <span className="text-[var(--color-text)] font-medium">
                {formData.name || "分類名稱"}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              取消
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  新增中...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  新增分類
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
