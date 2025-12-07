"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Edit, Trash2, GripVertical, AlertCircle } from "lucide-react";
import { graphqlFetch } from "@/lib/apolloClient";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  postCount: number;
}

export default function AdminCategoriesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "",
    color: "#c9a227",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push("/auth");
    }
  }, [isLoading, user, router]);

  const fetchCategories = async () => {
    try {
      const data = await graphqlFetch<{ categories: Category[] }>(`
        query {
          categories {
            id
            name
            slug
            description
            icon
            color
            order
            postCount
          }
        }
      `);
      setCategories(data.categories);
    } catch (err) {
      console.error("獲取分類失敗:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    try {
      if (editingId) {
        await graphqlFetch(`
          mutation($id: Int!, $input: UpdateCategoryInput!) {
            updateCategory(id: $id, input: $input) {
              id
            }
          }
        `, {
          id: editingId,
          input: {
            name: formData.name,
            slug,
            description: formData.description,
            icon: formData.icon,
            color: formData.color,
          },
        });
      } else {
        await graphqlFetch(`
          mutation($input: CreateCategoryInput!) {
            createCategory(input: $input) {
              id
            }
          }
        `, {
          input: {
            name: formData.name,
            slug,
            description: formData.description,
            icon: formData.icon,
            color: formData.color,
            order: categories.length,
          },
        });
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({ name: "", slug: "", description: "", icon: "", color: "#c9a227" });
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失敗");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("確定要刪除這個分類嗎？分類下的所有帖子也會被刪除。")) return;

    try {
      await graphqlFetch(`
        mutation($id: Int!) {
          deleteCategory(id: $id)
        }
      `, { id });
      // 直接從本地狀態移除
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error("刪除失敗:", err);
      alert("刪除失敗：" + (err instanceof Error ? err.message : "未知錯誤"));
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-dark)] flex items-center justify-center">
        <div className="animate-pulse text-[var(--color-text-muted)]">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-dark)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-card)] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text)]">分類管理</h1>
              <p className="text-[var(--color-text-muted)] text-sm">管理論壇分類</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({ name: "", slug: "", description: "", icon: "", color: "#c9a227" });
            }}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            新增分類
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">
                {editingId ? "編輯分類" : "新增分類"}
              </h2>

              {error && (
                <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[var(--color-text)] text-sm font-medium mb-2">
                    名稱
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="例：綜合討論"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[var(--color-text)] text-sm font-medium mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="input"
                    placeholder="例：general"
                  />
                </div>

                <div>
                  <label className="block text-[var(--color-text)] text-sm font-medium mb-2">
                    描述
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[var(--color-text)] text-sm font-medium mb-2">
                      圖標 (Emoji)
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="input"
                      placeholder="💬"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--color-text)] text-sm font-medium mb-2">
                      顏色
                    </label>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="input h-10 p-1 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn btn-secondary"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary"
                  >
                    {submitting ? "儲存中..." : "儲存"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* List */}
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="card p-4 flex items-center gap-4">
              <GripVertical className="w-4 h-4 text-[var(--color-text-dark)] cursor-grab" />

              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                style={{ backgroundColor: `${category.color}20` }}
              >
                {category.icon || "💬"}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-[var(--color-text)] font-medium">{category.name}</h3>
                <p className="text-[var(--color-text-muted)] text-sm truncate">
                  {category.description || "無描述"}
                </p>
              </div>

              <span className="text-[var(--color-text-dark)] text-sm">
                {category.postCount} 帖子
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingId(category.id);
                    setFormData({
                      name: category.name,
                      slug: category.slug,
                      description: category.description || "",
                      icon: category.icon || "",
                      color: category.color,
                    });
                    setShowForm(true);
                  }}
                  className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-card-hover)] transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {categories.length === 0 && (
            <div className="card p-8 text-center">
              <p className="text-[var(--color-text-muted)]">暫無分類</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
