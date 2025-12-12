"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Plus, Edit, Trash2, Pin, Eye, EyeOff, AlertCircle, Flame, ImageIcon, X } from "lucide-react";
import { graphqlFetch } from "@/lib/apolloClient";

interface Announcement {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string | null;
  type: string;
  isPinned: boolean;
  isHot: boolean;
  isPublished: boolean;
  publishedAt: string;
}

// 類型配置
const typeOptions = [
  { value: "general", label: "一般公告", color: "var(--color-primary)" },
  { value: "event", label: "活動公告", color: "#e74c3c" },
  { value: "war", label: "團戰公告", color: "#8e44ad" },
  { value: "update", label: "更新公告", color: "#3498db" },
  { value: "maintenance", label: "維護公告", color: "#e67e22" },
];

function getTypeStyle(type: string) {
  const option = typeOptions.find(o => o.value === type);
  const color = option?.color || "var(--color-primary)";
  return {
    backgroundColor: `${color}20`,
    color: color,
    borderColor: `${color}40`,
  };
}

function getTypeLabel(type: string) {
  const option = typeOptions.find(o => o.value === type);
  return option?.label || "公告";
}

export default function AdminAnnouncementsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    coverImage: "",
    type: "general",
    isPinned: false,
    isHot: false,
    isPublished: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 篩選狀態
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push("/auth");
    }
  }, [isLoading, user, router]);

  const fetchAnnouncements = useCallback(async () => {
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
              coverImage
              type
              isPinned
              isHot
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
  }, []);

  useEffect(() => {
    if (!user?.id || fetchedRef.current) return;
    fetchedRef.current = true;
    fetchAnnouncements();
  }, [user?.id, fetchAnnouncements]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
      .replace(/^-|-$/g, "")
      + "-" + Date.now();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });
      const result = await res.json();
      if (result.url) {
        setFormData({ ...formData, coverImage: result.url });
      } else {
        setError("圖片上傳失敗");
      }
    } catch {
      setError("圖片上傳失敗");
    } finally {
      setUploading(false);
    }
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
            coverImage: formData.coverImage || null,
            type: formData.type,
            isPinned: formData.isPinned,
            isHot: formData.isHot,
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
            coverImage: formData.coverImage || null,
            type: formData.type,
            isPinned: formData.isPinned,
            isHot: formData.isHot,
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
        coverImage: "",
        type: "general",
        isPinned: false,
        isHot: false,
        isPublished: true,
      });
      fetchedRef.current = false;
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
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error("刪除失敗:", err);
      alert("刪除失敗：" + (err instanceof Error ? err.message : "未知錯誤"));
    }
  };

  // 篩選公告
  const filteredAnnouncements = filterType === "all"
    ? announcements
    : announcements.filter(a => a.type === filterType);

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
              <p className="text-[var(--color-text-muted)] text-sm">管理官方公告（包含活動、團戰、更新等）</p>
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
                coverImage: "",
                type: "general",
                isPinned: false,
                isHot: false,
                isPublished: true,
              });
            }}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            新增公告
          </button>
        </div>

        {/* 篩選器 */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filterType === "all"
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--color-bg-card)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            全部 ({announcements.length})
          </button>
          {typeOptions.map(option => {
            const count = announcements.filter(a => a.type === option.value).length;
            return (
              <button
                key={option.value}
                onClick={() => setFilterType(option.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filterType === option.value
                    ? "text-white"
                    : "bg-[var(--color-bg-card)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`}
                style={filterType === option.value ? { backgroundColor: option.color } : undefined}
              >
                {option.label} ({count})
              </button>
            );
          })}
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
                    {typeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
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

                {/* 圖片上傳 */}
                <div>
                  <label className="block text-[var(--color-text)] text-sm font-medium mb-2">
                    封面圖片
                  </label>
                  <div className="flex gap-2 mb-2">
                    <label className="btn btn-secondary cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                      <ImageIcon className="w-4 h-4 mr-1" />
                      {uploading ? "上傳中..." : "選擇圖片"}
                    </label>
                    {formData.coverImage && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, coverImage: "" })}
                        className="btn btn-secondary text-red-400"
                      >
                        <X className="w-4 h-4 mr-1" />
                        移除圖片
                      </button>
                    )}
                  </div>
                  {formData.coverImage && (
                    <div className="relative rounded-lg overflow-hidden border border-[var(--color-border)]">
                      <Image
                        src={formData.coverImage}
                        alt="預覽"
                        width={400}
                        height={200}
                        className="w-full h-40 object-cover"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[var(--color-text)] text-sm font-medium mb-2">
                    內容 (支援 HTML)
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="input min-h-[200px] resize-y font-mono text-sm"
                    required
                  />
                </div>

                <div className="flex items-center gap-6 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPinned}
                      onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-[var(--color-text)] text-sm flex items-center gap-1">
                      <Pin className="w-4 h-4" />
                      置頂
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isHot}
                      onChange={(e) => setFormData({ ...formData, isHot: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-[var(--color-text)] text-sm flex items-center gap-1">
                      <Flame className="w-4 h-4 text-red-400" />
                      熱門
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-[var(--color-text)] text-sm flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      發布
                    </span>
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
          {filteredAnnouncements.map((announcement) => (
            <div key={announcement.id} className="card p-4 flex items-center gap-4">
              {/* 封面圖片縮圖 */}
              {announcement.coverImage && (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-[var(--color-border)] shrink-0">
                  <Image
                    src={announcement.coverImage}
                    alt={announcement.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {announcement.isPinned && (
                    <Pin className="w-4 h-4 text-[var(--color-primary)]" />
                  )}
                  {announcement.isHot && (
                    <Flame className="w-4 h-4 text-red-400" />
                  )}
                  {announcement.isPublished ? (
                    <Eye className="w-4 h-4 text-green-400" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-[var(--color-text-dark)]" />
                  )}
                  <span
                    className="text-xs px-2 py-0.5 rounded border"
                    style={getTypeStyle(announcement.type)}
                  >
                    {getTypeLabel(announcement.type)}
                  </span>
                </div>
                <h3 className="text-[var(--color-text)] font-medium truncate">
                  {announcement.title}
                </h3>
                {announcement.excerpt && (
                  <p className="text-[var(--color-text-muted)] text-sm truncate">
                    {announcement.excerpt}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setEditingId(announcement.id);
                    setFormData({
                      title: announcement.title,
                      content: announcement.content || "",
                      excerpt: announcement.excerpt || "",
                      coverImage: announcement.coverImage || "",
                      type: announcement.type,
                      isPinned: announcement.isPinned,
                      isHot: announcement.isHot,
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

          {filteredAnnouncements.length === 0 && (
            <div className="card p-8 text-center">
              <p className="text-[var(--color-text-muted)]">暫無公告</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
