import Link from "next/link";
import { graphqlFetch } from "@/lib/apolloClient";
import { ArrowLeft, Eye, Clock, MessageSquare, Pin, Lock, User } from "lucide-react";
import CommentSection from "@/components/Forum/CommentSection";

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
  author: string;
  authorEmail: string;
  views: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  category: Category;
  commentCount: number;
}

async function getPost(slug: string) {
  try {
    const data = await graphqlFetch<{ post: Post }>(`
      query($slug: String!) {
        post(slug: $slug) {
          id
          title
          slug
          content
          author
          authorEmail
          views
          isPinned
          isLocked
          createdAt
          updatedAt
          commentCount
          category {
            id
            name
            slug
            color
          }
        }
      }
    `, { slug });

    // Increment views
    if (data.post) {
      await graphqlFetch(`
        mutation($id: Int!) {
          incrementPostViews(id: $id) {
            id
          }
        }
      `, { id: data.post.id }).catch(() => {});
    }

    return data.post;
  } catch (error) {
    console.error("獲取帖子失敗:", error);
    return null;
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-dark)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-4">帖子不存在</h1>
          <Link href="/forum" className="btn btn-primary">
            返回論壇
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-dark)]">
      {/* Header */}
      <div className="bg-[var(--color-bg-darker)] border-b border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/forum"
            className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回論壇
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Post */}
        <article className="card p-6 md:p-8">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {post.isPinned && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs">
                <Pin className="w-3 h-3" />
                置頂
              </span>
            )}
            {post.isLocked && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[var(--color-text-dark)]/10 text-[var(--color-text-dark)] text-xs">
                <Lock className="w-3 h-3" />
                已鎖定
              </span>
            )}
            <span
              className="tag"
              style={{
                backgroundColor: `${post.category.color}15`,
                color: post.category.color,
                borderColor: `${post.category.color}30`,
              }}
            >
              {post.category.name}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text)] mb-4">
            {post.title}
          </h1>

          {/* Author Info */}
          <div className="flex items-center gap-4 pb-6 border-b border-[var(--color-border)]">
            <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
              <User className="w-6 h-6 text-[var(--color-primary)]" />
            </div>
            <div>
              <div className="text-[var(--color-text)] font-medium">{post.author}</div>
              <div className="flex items-center gap-3 text-[var(--color-text-dark)] text-sm">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(post.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {post.views + 1} 次瀏覽
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div
            className="prose mt-6"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* Comments */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[var(--color-primary)]" />
            評論 ({post.commentCount})
          </h2>

          <CommentSection postId={post.id} isLocked={post.isLocked} />
        </div>
      </div>
    </div>
  );
}
