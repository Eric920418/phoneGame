"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Star,
  ThumbsUp,
  Quote,
  MessageCircle,
  Flag,
  Loader2,
  ChevronDown,
  X,
  Send,
  AlertCircle,
} from "lucide-react";

interface User {
  id: number;
  name: string;
  avatar: string | null;
  gameHours: number;
}

interface ReviewReply {
  id: number;
  content: string;
  user: User;
  createdAt: string;
}

interface Review {
  id: number;
  content: string;
  rating: number;
  isRecommended: boolean;
  user: User;
  createdAt: string;
  likeCount: number;
  replyCount: number;
  isLikedByMe: boolean;
  replies: ReviewReply[];
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  recommendedPercent: number;
  ratingDistribution: number[];
}

interface ReviewListResult {
  reviews: Review[];
  total: number;
  stats: ReviewStats;
  hasMore: boolean;
}

const REVIEWS_QUERY = `
  query Reviews($page: Int, $pageSize: Int, $sortBy: String) {
    reviews(page: $page, pageSize: $pageSize, sortBy: $sortBy) {
      reviews {
        id
        content
        rating
        isRecommended
        user {
          id
          name
          avatar
          gameHours
        }
        createdAt
        likeCount
        replyCount
        isLikedByMe
        replies {
          id
          content
          user {
            id
            name
            avatar
          }
          createdAt
        }
      }
      total
      hasMore
      stats {
        totalReviews
        averageRating
        recommendedPercent
        ratingDistribution
      }
    }
  }
`;

const CREATE_REVIEW_MUTATION = `
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      id
      content
      rating
      isRecommended
    }
  }
`;

const LIKE_REVIEW_MUTATION = `
  mutation LikeReview($reviewId: Int!) {
    likeReview(reviewId: $reviewId) {
      id
      likeCount
      isLikedByMe
    }
  }
`;

const UNLIKE_REVIEW_MUTATION = `
  mutation UnlikeReview($reviewId: Int!) {
    unlikeReview(reviewId: $reviewId) {
      id
      likeCount
      isLikedByMe
    }
  }
`;

const CREATE_REPLY_MUTATION = `
  mutation CreateReviewReply($input: CreateReviewReplyInput!) {
    createReviewReply(input: $input) {
      id
      content
      user {
        id
        name
        avatar
      }
      createdAt
    }
  }
`;

const REPORT_REVIEW_MUTATION = `
  mutation ReportReview($input: ReportReviewInput!) {
    reportReview(input: $input) {
      id
    }
  }
`;

export default function ReviewSection() {
  const { user, token } = useAuth();
  const [data, setData] = useState<ReviewListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("newest");
  const [showForm, setShowForm] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [reportingId, setReportingId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState("");

  // 表單狀態
  const [formData, setFormData] = useState({
    content: "",
    rating: 5,
    isRecommended: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          query: REVIEWS_QUERY,
          variables: { page: 1, pageSize: 10, sortBy },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        setError(result.errors[0].message);
      } else {
        setData(result.data.reviews);
      }
    } catch (err) {
      setError("獲取評價失敗");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [sortBy, token]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setFormError(null);

    try {
      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: CREATE_REVIEW_MUTATION,
          variables: { input: formData },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        setFormError(result.errors[0].message);
      } else {
        setShowForm(false);
        setFormData({ content: "", rating: 5, isRecommended: true });
        // 重新獲取評價列表
        fetchReviews();
      }
    } catch (err) {
      setFormError("提交評價失敗");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (reviewId: number, isLiked: boolean) => {
    if (!user) return;

    try {
      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: isLiked ? UNLIKE_REVIEW_MUTATION : LIKE_REVIEW_MUTATION,
          variables: { reviewId },
        }),
      });

      const result = await response.json();

      if (!result.errors && data) {
        // 更新本地狀態
        const updatedReviews = data.reviews.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                likeCount: result.data[isLiked ? "unlikeReview" : "likeReview"].likeCount,
                isLikedByMe: !isLiked,
              }
            : r
        );
        setData({ ...data, reviews: updatedReviews });
      }
    } catch (err) {
      console.error("點贊失敗:", err);
    }
  };

  const handleReply = async (reviewId: number) => {
    if (!user || !replyContent.trim()) return;

    try {
      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: CREATE_REPLY_MUTATION,
          variables: { input: { reviewId, content: replyContent } },
        }),
      });

      const result = await response.json();

      if (!result.errors && data) {
        const newReply = result.data.createReviewReply;
        const updatedReviews = data.reviews.map((r) =>
          r.id === reviewId
            ? { ...r, replies: [...r.replies, newReply], replyCount: r.replyCount + 1 }
            : r
        );
        setData({ ...data, reviews: updatedReviews });
        setReplyContent("");
        setReplyingTo(null);
        // 展開回覆
        setExpandedReplies((prev) => new Set([...prev, reviewId]));
      }
    } catch (err) {
      console.error("回覆失敗:", err);
    }
  };

  const handleReport = async (reviewId: number) => {
    if (!user || !reportReason.trim()) return;

    try {
      await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: REPORT_REVIEW_MUTATION,
          variables: { input: { reviewId, reason: reportReason } },
        }),
      });

      setReportingId(null);
      setReportReason("");
      alert("舉報已提交，感謝您的反饋！");
    } catch (err) {
      console.error("舉報失敗:", err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-TW");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  const stats = data?.stats || {
    totalReviews: 0,
    averageRating: 0,
    recommendedPercent: 0,
    ratingDistribution: [0, 0, 0, 0, 0],
  };

  return (
    <div>
      {/* 評價統計 */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
        <div className="flex items-center gap-2">
          <div className="text-4xl sm:text-5xl font-bold text-green-400">
            {stats.recommendedPercent}%
          </div>
          <div className="text-sm text-[var(--color-text-muted)]">
            <div className="text-green-400 font-semibold">
              {stats.recommendedPercent >= 80 ? "好評如潮" : stats.recommendedPercent >= 60 ? "多半好評" : "褒貶不一"}
            </div>
            <div>共 {stats.totalReviews} 則評價</div>
          </div>
        </div>
        <div className="hidden sm:block h-12 w-px bg-[var(--color-border)]" />
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${
                  star <= Math.round(stats.averageRating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-[var(--color-text-dark)]"
                }`}
              />
            ))}
          </div>
          <span className="text-[var(--color-text-muted)]">
            {stats.averageRating.toFixed(1)}
          </span>
        </div>
      </div>

      

      {/* 評價列表 - 限制最大高度防止超出金屬框 */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {data?.reviews.length === 0 ? (
          <div className="text-center py-8 text-[var(--color-text-muted)]">
            還沒有評價，成為第一個評價的玩家吧！
          </div>
        ) : (
          data?.reviews.map((review) => (
            <div key={review.id} className="card p-4 sm:p-5">
              {/* 評價頭部 */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center text-xl sm:text-2xl">
                    {review.user.avatar || "👤"}
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--color-text)]">
                      {review.user.name}
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)]">
                      遊戲時數：{review.user.gameHours} 小時
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {review.isRecommended ? (
                    <span className="flex items-center gap-1 text-xs sm:text-sm text-green-400">
                      <ThumbsUp className="w-4 h-4" />
                      推薦
                    </span>
                  ) : (
                    <span className="text-xs sm:text-sm text-red-400">不推薦</span>
                  )}
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 sm:w-4 sm:h-4 ${
                          star <= review.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-[var(--color-text-dark)]"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* 評價內容 */}
              <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed mb-3">
                {review.content}
              </p>

              {/* 評價底部 */}
              <div className="flex items-center justify-between text-xs text-[var(--color-text-dark)]">
                <span>{formatDate(review.createdAt)}</span>
                <div className="flex items-center gap-3">
                  {/* 點贊按鈕 */}
                  <button
                    onClick={() => user && handleLike(review.id, review.isLikedByMe)}
                    className={`flex items-center gap-1 transition-colors ${
                      review.isLikedByMe
                        ? "text-green-400"
                        : "hover:text-[var(--color-text-muted)]"
                    } ${!user ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={!user}
                    title={user ? "" : "請先登入"}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    {review.likeCount}
                  </button>

                  {/* 回覆按鈕 */}
                  <button
                    onClick={() => {
                      if (user) {
                        setReplyingTo(replyingTo === review.id ? null : review.id);
                      }
                    }}
                    className={`flex items-center gap-1 hover:text-[var(--color-text-muted)] transition-colors ${
                      !user ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={!user}
                    title={user ? "" : "請先登入"}
                  >
                    <MessageCircle className="w-3 h-3" />
                    {review.replyCount}
                  </button>

                  {/* 舉報按鈕 */}
                  {user && user.id !== review.user.id && (
                    <button
                      onClick={() => setReportingId(review.id)}
                      className="hover:text-red-400 transition-colors"
                      title="舉報"
                    >
                      <Flag className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* 回覆區域 */}
              {review.replyCount > 0 && (
                <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                  <button
                    onClick={() =>
                      setExpandedReplies((prev) => {
                        const next = new Set(prev);
                        if (next.has(review.id)) {
                          next.delete(review.id);
                        } else {
                          next.add(review.id);
                        }
                        return next;
                      })
                    }
                    className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        expandedReplies.has(review.id) ? "rotate-180" : ""
                      }`}
                    />
                    {expandedReplies.has(review.id) ? "收起回覆" : `查看 ${review.replyCount} 則回覆`}
                  </button>

                  {expandedReplies.has(review.id) && (
                    <div className="mt-3 space-y-3">
                      {review.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="pl-4 border-l-2 border-[var(--color-border)]"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm">{reply.user.avatar || "👤"}</span>
                            <span className="text-sm font-medium text-[var(--color-text)]">
                              {reply.user.name}
                            </span>
                            <span className="text-xs text-[var(--color-text-dark)]">
                              {formatDate(reply.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-[var(--color-text-muted)]">
                            {reply.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 回覆輸入框 */}
              {replyingTo === review.id && (
                <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="寫下你的回覆..."
                      className="input flex-1 py-2 text-sm"
                    />
                    <button
                      onClick={() => handleReply(review.id)}
                      disabled={!replyContent.trim()}
                      className="btn btn-primary py-2 px-3"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent("");
                      }}
                      className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 撰寫評價按鈕/表單 */}
      <div className="mt-6">
        {!showForm ? (
          <div className="text-center">
            <button
              onClick={() => {
                if (user) {
                  setShowForm(true);
                } else {
                  window.location.href = "/auth";
                }
              }}
              className="btn btn-primary"
            >
              <Quote className="w-4 h-4" />
              {user ? "撰寫我的評價" : "登入以撰寫評價"}
            </button>
          </div>
        ) : (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--color-text)]">撰寫評價</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* 評分 */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  評分
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= formData.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-[var(--color-text-dark)] hover:text-yellow-400"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* 推薦 */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  是否推薦這款遊戲？
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isRecommended: true })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      formData.isRecommended
                        ? "bg-green-500/20 border-green-500 text-green-400"
                        : "border-[var(--color-border)] text-[var(--color-text-muted)]"
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    推薦
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isRecommended: false })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      !formData.isRecommended
                        ? "bg-red-500/20 border-red-500 text-red-400"
                        : "border-[var(--color-border)] text-[var(--color-text-muted)]"
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4 rotate-180" />
                    不推薦
                  </button>
                </div>
              </div>

              {/* 評價內容 */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  評價內容
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="分享你的遊戲體驗..."
                  className="input w-full h-32 resize-none"
                  required
                  minLength={10}
                />
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  至少 10 個字符
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || formData.content.length < 10}
                className="btn btn-primary w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    提交中...
                  </>
                ) : (
                  "提交評價"
                )}
              </button>

              <p className="text-xs text-[var(--color-text-muted)] text-center">
                評價需經過審核後才會顯示
              </p>
            </form>
          </div>
        )}
      </div>

      {/* 舉報彈窗 */}
      {reportingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--color-text)]">舉報評價</h3>
              <button
                onClick={() => {
                  setReportingId(null);
                  setReportReason("");
                }}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="請說明舉報原因..."
              className="input w-full h-24 resize-none mb-4"
              required
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setReportingId(null);
                  setReportReason("");
                }}
                className="btn flex-1"
              >
                取消
              </button>
              <button
                onClick={() => handleReport(reportingId)}
                disabled={!reportReason.trim()}
                className="btn btn-primary flex-1"
              >
                提交舉報
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
