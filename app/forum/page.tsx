import Link from "next/link";
import { graphqlFetch } from "@/lib/apolloClient";
import { MessageSquare, Eye, Clock, Pin, Lock, ChevronRight, Search, Plus } from "lucide-react";
import ForumSidebar from "@/components/ForumSidebar";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  postCount: number;
}

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  views: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  category: Category;
  commentCount: number;
}

interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

async function getForumData(categorySlug?: string, page = 1, search?: string) {
  try {
    const categoryResult = await graphqlFetch<{ categories: Category[] }>(`
      query {
        categories {
          id
          name
          slug
          description
          icon
          color
          postCount
        }
      }
    `);

    let categoryId: number | undefined;
    if (categorySlug) {
      const category = categoryResult.categories.find(c => c.slug === categorySlug);
      categoryId = category?.id;
    }

    const postsResult = await graphqlFetch<{ posts: PostsResponse }>(`
      query($page: Int, $categoryId: Int, $search: String) {
        posts(page: $page, pageSize: 20, categoryId: $categoryId, search: $search) {
          posts {
            id
            title
            slug
            excerpt
            author
            views
            isPinned
            isLocked
            createdAt
            commentCount
            category {
              id
              name
              slug
              color
            }
          }
          total
          page
          pageSize
          hasMore
        }
      }
    `, { page, categoryId, search });

    return {
      categories: categoryResult.categories,
      postsData: postsResult.posts,
    };
  } catch (error) {
    console.error("獲取論壇數據失敗:", error);
    return {
      categories: [],
      postsData: { posts: [], total: 0, page: 1, pageSize: 20, hasMore: false },
    };
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins} 分鐘前`;
  } else if (diffHours < 24) {
    return `${diffHours} 小時前`;
  } else if (diffDays < 7) {
    return `${diffDays} 天前`;
  } else {
    return date.toLocaleDateString("zh-TW");
  }
}

interface PageProps {
  searchParams: Promise<{ category?: string; page?: string; search?: string }>;
}

export default async function ForumPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentCategory = params.category;
  const currentPage = parseInt(params.page || "1");
  const searchQuery = params.search;

  const { categories, postsData } = await getForumData(currentCategory, currentPage, searchQuery);

  return (
    <div className="min-h-screen bg-[var(--color-bg-dark)]">
      {/* Header */}
      <div className="bg-[var(--color-bg-darker)] border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-text)] flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-[var(--color-primary)]" />
                討論區
              </h1>
              <p className="text-[var(--color-text-muted)] mt-1">
                與其他玩家交流討論，分享遊戲心得
              </p>
            </div>

            <Link
              href="/forum/new"
              className="btn btn-primary self-start md:self-auto"
            >
              <Plus className="w-5 h-5" />
              發表新帖
            </Link>
          </div>

          {/* Search */}
          <form className="mt-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-dark)]" />
              <input
                type="text"
                name="search"
                placeholder="搜尋帖子..."
                defaultValue={searchQuery}
                className="input pl-12 w-full md:w-96"
              />
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <ForumSidebar categories={categories} currentCategory={currentCategory} />

          {/* Main - Posts */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                {currentCategory
                  ? categories.find(c => c.slug === currentCategory)?.name || "帖子列表"
                  : "最新帖子"}
              </h2>
              <span className="text-[var(--color-text-muted)] text-sm">
                共 {postsData.total} 篇帖子
              </span>
            </div>

            <div className="space-y-3">
              {postsData.posts.length > 0 ? (
                postsData.posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/forum/${post.slug}`}
                    className="card p-4 flex items-start gap-4 group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {post.isPinned && (
                          <span className="inline-flex items-center gap-1 text-[var(--color-primary)] text-xs">
                            <Pin className="w-3 h-3" />
                            置頂
                          </span>
                        )}
                        {post.isLocked && (
                          <span className="inline-flex items-center gap-1 text-[var(--color-text-dark)] text-xs">
                            <Lock className="w-3 h-3" />
                            已鎖定
                          </span>
                        )}
                        <span
                          className="tag text-xs"
                          style={{
                            backgroundColor: `${post.category.color}15`,
                            color: post.category.color,
                            borderColor: `${post.category.color}30`,
                          }}
                        >
                          {post.category.name}
                        </span>
                      </div>

                      <h3 className="text-[var(--color-text)] font-medium group-hover:text-[var(--color-primary)] transition-colors">
                        {post.title}
                      </h3>

                      {post.excerpt && (
                        <p className="text-[var(--color-text-muted)] text-sm mt-1 line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-3 text-[var(--color-text-dark)] text-xs">
                        <span>{post.author}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(post.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {post.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {post.commentCount}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-[var(--color-text-dark)] group-hover:text-[var(--color-primary)] transition-colors flex-shrink-0 mt-1" />
                  </Link>
                ))
              ) : (
                <div className="card p-12 text-center">
                  <MessageSquare className="w-16 h-16 text-[var(--color-text-dark)] mx-auto mb-4" />
                  <p className="text-[var(--color-text-muted)] text-lg mb-4">
                    {searchQuery ? "找不到相關帖子" : "暫無帖子"}
                  </p>
                  <Link href="/forum/new" className="btn btn-primary">
                    <Plus className="w-5 h-5" />
                    發表第一篇帖子
                  </Link>
                </div>
              )}
            </div>

            {/* Pagination */}
            {postsData.total > postsData.pageSize && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {currentPage > 1 && (
                  <Link
                    href={`/forum?${currentCategory ? `category=${currentCategory}&` : ''}page=${currentPage - 1}`}
                    className="btn btn-secondary"
                  >
                    上一頁
                  </Link>
                )}
                <span className="px-4 py-2 text-[var(--color-text-muted)]">
                  第 {currentPage} 頁
                </span>
                {postsData.hasMore && (
                  <Link
                    href={`/forum?${currentCategory ? `category=${currentCategory}&` : ''}page=${currentPage + 1}`}
                    className="btn btn-secondary"
                  >
                    下一頁
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
