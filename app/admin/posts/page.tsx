"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Edit, Trash2, Pin, Lock, Eye, ExternalLink, AlertCircle } from "lucide-react";
import { graphqlFetch } from "@/lib/apolloClient";

interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
}

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  authorEmail: string;
  views: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  category: Category;
}

export default function AdminPostsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    author: "",
    authorEmail: "",
    categoryId: 0,
    isPinned: false,
    isLocked: false,
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
            color
          }
        }
      `);
      setCategories(data.categories);
    } catch (err) {
      console.error("獲取分類失敗:", err);
    }
  };

  const fetchPosts = async () => {
    try {
      const data = await graphqlFetch<{ posts: { posts: Post[] } }>(`
        query {
          posts(pageSize: 100) {
            posts {
              id
              title
              slug
              content
              excerpt
              author
              authorEmail
              views
              isPinned
              isLocked
              createdAt
              category {
                id
                name
                slug
                color
              }
            }
          }
        }
      `);
      setPosts(data.posts.posts);
    } catch (err) {
      console.error("獲取帖子失敗:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchCategories();
      fetchPosts();
    }
  }, [session]);

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
          mutation($id: Int!, $input: UpdatePostInput!) {
            updatePost(id: $id, input: $input) {
              id
            }
          }
        `, {
          id: editingId,
          input: {
            title: formData.title,
            content: formData.content,
            excerpt: formData.excerpt,
            author: formData.author,
            authorEmail: formData.authorEmail,
            categoryId: formData.categoryId,
            isPinned: formData.isPinned,
            isLocked: formData.isLocked,
          },
        });
      } else {
        await graphqlFetch(`
          mutation($input: CreatePostInput!) {
            createPost(input: $input) {
              id
            }
          }
        `, {
          input: {
            title: formData.title,
            slug,
            content: formData.content,
            excerpt: formData.excerpt,
            author: formData.author || "Admin",
            authorEmail: formData.authorEmail || "admin@kingdoms.com",
            categoryId: formData.categoryId,
            isPinned: formData.isPinned,
            isLocked: formData.isLocked,
          },
        });
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({
        title: "",
        content: "",
        excerpt: "",
        author: "",
        authorEmail: "",
        categoryId: 0,
        isPinned: false,
        isLocked: false,
      });
      fetchPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失敗");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePin = async (id: number, isPinned: boolean) => {
    try {
      await graphqlFetch(`
        mutation($id: Int!, $input: UpdatePostInput!) {
          updatePost(id: $id, input: $input) {
            id
          }
        }
      `, {
        id,
        input: { isPinned: !isPinned },
      });
      fetchPosts();
    } catch (err) {
      console.error("更新失敗:", err);
    }
  };

  const handleToggleLock = async (id: number, isLocked: boolean) => {
    try {
      await graphqlFetch(`
        mutation($id: Int!, $input: UpdatePostInput!) {
          updatePost(id: $id, input: $input) {
            id
          }
        }
      `, {
        id,
        input: { isLocked: !isLocked },
      });
      fetchPosts();
    } catch (err) {
      console.error("更新失敗:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("確定要刪除這篇帖子嗎？")) return;

    try {
      await graphqlFetch(`
        mutation($id: Int!) {
          deletePost(id: $id)
        }
      `, { id });
      fetchPosts();
    } catch (err) {
      console.error("刪除失敗:", err);
    }
  };

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-TW");
  }

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
              <h1 className="text-2xl font-bold text-[var(--color-text)]">帖子管理</h1>
              <p className="text-[var(--color-text-muted)] text-sm">管理論壇帖子</p>
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
                author: "",
                authorEmail: "",
                categoryId: categories[0]?.id || 0,
                isPinned: false,
                isLocked: false,
              });
            }}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            新增帖子
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">
                {editingId ? "編輯帖子" : "新增帖子"}
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
                    分類
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                    className="input"
                    required
                  >
                    <option value={0} disabled>選擇分類</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[var(--color-text)] text-sm font-medium mb-2">
                      作者
                    </label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="input"
                      placeholder="Admin"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--color-text)] text-sm font-medium mb-2">
                      作者 Email
                    </label>
                    <input
                      type="email"
                      value={formData.authorEmail}
                      onChange={(e) => setFormData({ ...formData, authorEmail: e.target.value })}
                      className="input"
                      placeholder="admin@kingdoms.com"
                    />
                  </div>
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
                      checked={formData.isLocked}
                      onChange={(e) => setFormData({ ...formData, isLocked: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-[var(--color-text)] text-sm">鎖定</span>
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
                    disabled={submitting || formData.categoryId === 0}
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
          {posts.map((post) => (
            <div key={post.id} className="card p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {post.isPinned && (
                    <Pin className="w-4 h-4 text-[var(--color-primary)]" />
                  )}
                  {post.isLocked && (
                    <Lock className="w-4 h-4 text-[var(--color-text-dark)]" />
                  )}
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: `${post.category.color}15`,
                      color: post.category.color,
                    }}
                  >
                    {post.category.name}
                  </span>
                </div>
                <h3 className="text-[var(--color-text)] font-medium truncate">{post.title}</h3>
                <div className="flex items-center gap-4 mt-1 text-[var(--color-text-dark)] text-xs">
                  <span>{post.author}</span>
                  <span>{formatDate(post.createdAt)}</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {post.views}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleTogglePin(post.id, post.isPinned)}
                  className={`p-2 rounded-lg transition-colors ${
                    post.isPinned
                      ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-card-hover)]"
                  }`}
                  title={post.isPinned ? "取消置頂" : "置頂"}
                >
                  <Pin className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleToggleLock(post.id, post.isLocked)}
                  className={`p-2 rounded-lg transition-colors ${
                    post.isLocked
                      ? "text-red-400 bg-red-400/10"
                      : "text-[var(--color-text-muted)] hover:text-red-400 hover:bg-[var(--color-bg-card-hover)]"
                  }`}
                  title={post.isLocked ? "解鎖" : "鎖定"}
                >
                  <Lock className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setEditingId(post.id);
                    setFormData({
                      title: post.title,
                      content: post.content || "",
                      excerpt: post.excerpt || "",
                      author: post.author,
                      authorEmail: post.authorEmail || "",
                      categoryId: post.category.id,
                      isPinned: post.isPinned,
                      isLocked: post.isLocked,
                    });
                    setShowForm(true);
                  }}
                  className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-card-hover)] transition-colors"
                  title="編輯"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <Link
                  href={`/forum/${post.slug}`}
                  target="_blank"
                  className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-card-hover)] transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {posts.length === 0 && (
            <div className="card p-8 text-center">
              <p className="text-[var(--color-text-muted)]">暫無帖子</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
