"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, Star, ThumbsUp, ThumbsDown, Eye, EyeOff, AlertCircle } from "lucide-react";
import { graphqlFetch } from "@/lib/apolloClient";

interface User {
  id: number;
  name: string;
  avatar: string;
  email: string;
  gameHours: number;
}

interface Review {
  id: number;
  content: string;
  rating: number;
  isRecommended: boolean;
  isApproved: boolean;
  isHidden: boolean;
  user: User;
  createdAt: string;
  likeCount: number;
  replyCount: number;
}

interface ReviewListResult {
  reviews: Review[];
  total: number;
}

export default function AdminReviewsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "visible" | "hidden">("all");
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push("/auth");
    }
  }, [isLoading, user, router]);

  const fetchReviews = async () => {
    try {
      const data = await graphqlFetch<{ reviews: ReviewListResult }>(`
        query {
          reviews(pageSize: 100) {
            reviews {
              id
              content
              rating
              isRecommended
              isApproved
              isHidden
              createdAt
              likeCount
              replyCount
              user {
                id
                name
                avatar
                email
                gameHours
              }
            }
            total
          }
        }
      `);
      setReviews(data.reviews.reviews);
      setTotal(data.reviews.total);
    } catch (err) {
      console.error("獲取評論失敗:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReviews();
    }
  }, [user]);

  const handleDelete = async (id: number) => {
    if (!confirm("確定要刪除這則評論嗎？此操作無法復原。")) return;

    setDeleting(id);
    try {
      await graphqlFetch(`
        mutation($id: Int!) {
          deleteReview(id: $id)
        }
      `, { id });
      fetchReviews();
    } catch (err) {
      console.error("刪除失敗:", err);
      alert("刪除失敗：" + (err instanceof Error ? err.message : "未知錯誤"));
    } finally {
      setDeleting(null);
    }
  };

  const handleHide = async (id: number) => {
    try {
      await graphqlFetch(`
        mutation($id: Int!) {
          hideReview(id: $id) {
            id
          }
        }
      `, { id });
      fetchReviews();
    } catch (err) {
      console.error("隱藏失敗:", err);
    }
  };

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // 過濾評論
  const filteredReviews = reviews.filter((review) => {
    if (filter === "all") return true;
    if (filter === "visible") return !review.isHidden;
    if (filter === "hidden") return review.isHidden;
    return true;
  });

  // 統計
  const stats = {
    total: reviews.length,
    visible: reviews.filter((r) => !r.isHidden).length,
    hidden: reviews.filter((r) => r.isHidden).length,
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <h1 className="text-2xl font-bold text-[var(--color-text)]">評論管理</h1>
              <p className="text-[var(--color-text-muted)] text-sm">管理玩家評價（共 {total} 則）</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`card p-4 text-left transition-all ${filter === "all" ? "ring-2 ring-[var(--color-primary)]" : ""}`}
          >
            <div className="text-2xl font-bold text-[var(--color-text)]">{stats.total}</div>
            <div className="text-[var(--color-text-muted)] text-sm">全部評論</div>
          </button>
          <button
            onClick={() => setFilter("visible")}
            className={`card p-4 text-left transition-all ${filter === "visible" ? "ring-2 ring-green-500" : ""}`}
          >
            <div className="text-2xl font-bold text-green-400">{stats.visible}</div>
            <div className="text-[var(--color-text-muted)] text-sm">顯示中</div>
          </button>
          <button
            onClick={() => setFilter("hidden")}
            className={`card p-4 text-left transition-all ${filter === "hidden" ? "ring-2 ring-red-500" : ""}`}
          >
            <div className="text-2xl font-bold text-red-400">{stats.hidden}</div>
            <div className="text-[var(--color-text-muted)] text-sm">已隱藏</div>
          </button>
        </div>

        {/* Review List */}
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className={`card p-4 ${review.isHidden ? "opacity-60" : ""}`}
            >
              <div className="flex items-start gap-4">
                {/* User Info */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-bg-darker)] flex items-center justify-center text-2xl">
                    {review.user.avatar}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-[var(--color-text)]">{review.user.name}</span>
                    <span className="text-[var(--color-text-dark)] text-xs">
                      {review.user.gameHours} 小時
                    </span>
                    {review.user.email.includes("@kingdoms.ai") && (
                      <span className="px-1.5 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400">
                        AI 生成
                      </span>
                    )}
                    {review.isHidden && (
                      <span className="px-1.5 py-0.5 rounded text-xs bg-red-500/20 text-red-400 flex items-center gap-1">
                        <EyeOff className="w-3 h-3" />
                        已隱藏
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-[var(--color-text-dark)]"}`}
                        />
                      ))}
                    </div>
                    {review.isRecommended ? (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <ThumbsUp className="w-3 h-3" />
                        推薦
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-red-400">
                        <ThumbsDown className="w-3 h-3" />
                        不推薦
                      </span>
                    )}
                  </div>

                  {/* Review Content */}
                  <p className="text-[var(--color-text-muted)] text-sm whitespace-pre-wrap mb-2">
                    {review.content}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-[var(--color-text-dark)]">
                    <span>{formatDate(review.createdAt)}</span>
                    <span>{review.likeCount} 個讚</span>
                    <span>{review.replyCount} 則回覆</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleHide(review.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      review.isHidden
                        ? "text-green-400 bg-green-400/10 hover:bg-green-400/20"
                        : "text-[var(--color-text-muted)] hover:text-yellow-400 hover:bg-yellow-400/10"
                    }`}
                    title={review.isHidden ? "取消隱藏" : "隱藏"}
                  >
                    {review.isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={deleting === review.id}
                    className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
                    title="刪除"
                  >
                    <Trash2 className={`w-4 h-4 ${deleting === review.id ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredReviews.length === 0 && (
            <div className="card p-8 text-center">
              <AlertCircle className="w-12 h-12 text-[var(--color-text-dark)] mx-auto mb-4" />
              <p className="text-[var(--color-text-muted)]">
                {filter === "all" ? "暫無評論" : `暫無${filter === "visible" ? "顯示中" : "已隱藏"}的評論`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
