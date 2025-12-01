"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, AlertCircle } from "lucide-react";
import { graphqlFetch } from "@/lib/apolloClient";

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

export default function NewPostPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: "",
    authorEmail: "",
    categoryId: "",
  });

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await graphqlFetch<{ categories: Category[] }>(`
          query {
            categories {
              id
              name
              slug
              icon
            }
          }
        `);
        setCategories(data.categories);
        if (data.categories.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: data.categories[0].id.toString() }));
        }
      } catch (err) {
        console.error("獲取分類失敗:", err);
      }
    }
    fetchCategories();
  }, []);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
      .replace(/^-|-$/g, "")
      + "-" + Date.now();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.title || !formData.content || !formData.author || !formData.categoryId) {
      setError("請填寫所有必填欄位");
      setLoading(false);
      return;
    }

    try {
      const slug = generateSlug(formData.title);
      const excerpt = formData.content
        .replace(/<[^>]*>/g, "")
        .substring(0, 200);

      const result = await graphqlFetch<{ createPost: { slug: string } }>(`
        mutation($input: CreatePostInput!) {
          createPost(input: $input) {
            slug
          }
        }
      `, {
        input: {
          title: formData.title,
          slug,
          content: formData.content,
          excerpt,
          author: formData.author,
          authorEmail: formData.authorEmail || null,
          categoryId: parseInt(formData.categoryId),
        },
      });

      router.push(`/forum/${result.createPost.slug}`);
    } catch (err) {
      console.error("發表帖子失敗:", err);
      setError(err instanceof Error ? err.message : "發表失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-dark)]">
      {/* Header */}
      <div className="bg-[var(--color-bg-darker)] border-b border-[var(--color-border)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/forum"
            className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回論壇
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">發表新帖</h1>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card p-6 space-y-6">
            {/* Author */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[var(--color-text)] text-sm font-medium mb-2">
                  暱稱 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="input"
                  placeholder="你的暱稱"
                  required
                />
              </div>
              <div>
                <label className="block text-[var(--color-text)] text-sm font-medium mb-2">
                  Email (選填)
                </label>
                <input
                  type="email"
                  value={formData.authorEmail}
                  onChange={(e) => setFormData({ ...formData, authorEmail: e.target.value })}
                  className="input"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[var(--color-text)] text-sm font-medium mb-2">
                分類 <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="input"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-[var(--color-text)] text-sm font-medium mb-2">
                標題 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input"
                placeholder="帖子標題"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-[var(--color-text)] text-sm font-medium mb-2">
                內容 <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="input min-h-[300px] resize-y"
                placeholder="分享你的想法..."
                required
              />
              <p className="text-[var(--color-text-dark)] text-xs mt-2">
                支援 HTML 格式
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-4">
            <Link href="/forum" className="btn btn-secondary">
              取消
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                "發表中..."
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  發表帖子
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
