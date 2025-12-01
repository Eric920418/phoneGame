"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, Pin, Lock, Eye, ExternalLink } from "lucide-react";
import { graphqlFetch } from "@/lib/apolloClient";

interface Category {
  id: number;
  name: string;
  color: string;
}

interface Post {
  id: number;
  title: string;
  slug: string;
  author: string;
  views: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  category: Category;
}

export default function AdminPostsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  const fetchPosts = async () => {
    try {
      const data = await graphqlFetch<{ posts: { posts: Post[] } }>(`
        query {
          posts(pageSize: 100) {
            posts {
              id
              title
              slug
              author
              views
              isPinned
              isLocked
              createdAt
              category {
                id
                name
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
      fetchPosts();
    }
  }, [session]);

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

  if (status === "loading" || loading) {
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
        </div>

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
