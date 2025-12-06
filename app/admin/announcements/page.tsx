"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Edit, Trash2, Pin, Eye, EyeOff, AlertCircle } from "lucide-react";
import { graphqlFetch } from "@/lib/apolloClient";

interface Announcement {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  type: string;
  isPinned: boolean;
  isPublished: boolean;
  publishedAt: string;
}

export default function AdminAnnouncementsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    type: "general",
    isPinned: false,
    isPublished: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push("/auth");
    }
  }, [isLoading, user, router]);

  const fetchAnnouncements = async () => {
    try {
      const data = await graphqlFetch<{ announcements: { announcements: Announcement[] } }>(`
        query {
          announcements(pageSize: 100) {
            announcements {
              id
              title
              slug
              content
              excerpt
              type
              isPinned
              isPublished
              publishedAt
            }
          }
        }
      `);
      setAnnouncements(data.announcements.announcements);
    } catch (err) {
      console.error("獲取公告失敗:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAnnouncements();
    }
  }, [user]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
      .replace(/^-|-$/g, "")
      + "-" + Date.now();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const slug = generateSlug(formData.title);

      if (editingId) {
        await graphqlFetch(`
          mutation($id: Int!, $input: UpdateAnnouncementInput!) {
            updateAnnouncement(id: $id, input: $input) {
              id
            }
          }
        `, {
          id: editingId,
          input: {
            title: formData.title,
            content: formData.content,
            excerpt: formData.excerpt,
            type: formData.type,
            isPinned: formData.isPinned,
            isPublished: formData.isPublished,
          },
        });
      } else {
        await graphqlFetch(`
          mutation($input: CreateAnnouncementInput!) {
            createAnnouncement(input: $input) {
              id
            }
          }
        `, {
          input: {
            title: formData.title,
            slug,
            content: formData.content,
            excerpt: formData.excerpt,
            type: formData.type,
            isPinned: formData.isPinned,
            isPublished: formData.isPublished,
          },
        });
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({
        title: "",
        content: "",
        excerpt: "",
        type: "general",
        isPinned: false,
        isPublished: true,
      });
      fetchAnnouncements();
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失敗");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("確定要刪除這則公告嗎？")) return;

    try {
      await graphqlFetch(`
        mutation($id: Int!) {
          deleteAnnouncement(id: $id)
        }
      `, { id });
      fetchAnnouncements();
    } catch (err) {
      console.error("刪除失敗:", err);
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <h1 className="text-2xl font-bold text-[var(--color-text)]">公告管理</h1>
              <p className="text-[var(--color-text-muted)] text-sm">管理官方公告</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({
                title: "",
                content: "",
                excerpt: "",
                type: "general",
                isPinned: false,
                isPublished: true,
              });
            }}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            新增公告
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">
                {editingId ? "編輯公告" : "新增公告"}
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
                    標題
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[var(--color-text)] text-sm font-medium mb-2">
                    類型
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input"
                  >
                    <option value="general">一般公告</option>
                    <option value="update">版本更新</option>
                    <option value="event">活動公告</option>
                    <option value="maintenance">維護公告</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--color-text)] text-sm font-medium mb-2">
                    摘要
                  </label>
                  <input
                    type="text"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="input"
                    placeholder="簡短描述"
                  />
                </div>

                <div>
                  <label className="block text-[var(--color-text)] text-sm font-medium mb-2">
                    內容
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="input min-h-[200px] resize-y"
                    required
                  />
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPinned}
                      onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-[var(--color-text)] text-sm">置頂</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-[var(--color-text)] text-sm">發布</span>
                  </label>
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
          {announcements.map((announcement) => (
            <div key={announcement.id} className="card p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {announcement.isPinned && (
                    <Pin className="w-4 h-4 text-[var(--color-primary)]" />
                  )}
                  {announcement.isPublished ? (
                    <Eye className="w-4 h-4 text-green-400" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-[var(--color-text-dark)]" />
                  )}
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {announcement.type}
                  </span>
                </div>
                <h3 className="text-[var(--color-text)] font-medium truncate">
                  {announcement.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingId(announcement.id);
                    setFormData({
                      title: announcement.title,
                      content: announcement.content || "",
                      excerpt: announcement.excerpt || "",
                      type: announcement.type,
                      isPinned: announcement.isPinned,
                      isPublished: announcement.isPublished,
                    });
                    setShowForm(true);
                  }}
                  className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-card-hover)] transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(announcement.id)}
                  className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {announcements.length === 0 && (
            <div className="card p-8 text-center">
              <p className="text-[var(--color-text-muted)]">暫無公告</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
