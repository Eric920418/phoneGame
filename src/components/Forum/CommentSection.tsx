"use client";

import { useState, useEffect } from "react";
import { graphqlFetch } from "@/lib/apolloClient";
import { User, Clock, Reply, Send, Lock } from "lucide-react";

interface Comment {
  id: number;
  content: string;
  author: string;
  createdAt: string;
  replies?: Comment[];
}

interface CommentSectionProps {
  postId: number;
  isLocked: boolean;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString("zh-TW", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CommentItem({
  comment,
  postId,
  isLocked,
  onReply,
  depth = 0,
}: {
  comment: Comment;
  postId: number;
  isLocked: boolean;
  onReply: () => void;
  depth?: number;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyAuthor, setReplyAuthor] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !replyAuthor.trim()) return;

    setLoading(true);
    try {
      await graphqlFetch(`
        mutation($input: CreateCommentInput!) {
          createComment(input: $input) {
            id
          }
        }
      `, {
        input: {
          content: replyContent,
          author: replyAuthor,
          postId,
          parentId: comment.id,
        },
      });

      setReplyContent("");
      setShowReplyForm(false);
      onReply();
    } catch (error) {
      console.error("回覆失敗:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-4' : ''}`}>
      <div className="card p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-[var(--color-primary)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[var(--color-text)] font-medium">{comment.author}</span>
              <span className="text-[var(--color-text-dark)] text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <p className="text-[var(--color-text-muted)]">{comment.content}</p>

            {!isLocked && depth < 2 && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="mt-2 text-[var(--color-primary)] text-sm hover:text-[var(--color-primary-light)] flex items-center gap-1"
              >
                <Reply className="w-3 h-3" />
                回覆
              </button>
            )}
          </div>
        </div>

        {showReplyForm && (
          <form onSubmit={handleReply} className="mt-4 ml-13 space-y-3">
            <input
              type="text"
              value={replyAuthor}
              onChange={(e) => setReplyAuthor(e.target.value)}
              className="input"
              placeholder="你的暱稱"
              required
            />
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="input min-h-[80px] resize-none"
              placeholder="輸入回覆..."
              required
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReplyForm(false)}
                className="btn btn-secondary text-sm py-1 px-3"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary text-sm py-1 px-3"
              >
                {loading ? "發送中..." : "發送"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              isLocked={isLocked}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentSection({ postId, isLocked }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      const data = await graphqlFetch<{ comments: Comment[] }>(`
        query($postId: Int!) {
          comments(postId: $postId) {
            id
            content
            author
            createdAt
            replies {
              id
              content
              author
              createdAt
            }
          }
        }
      `, { postId });
      setComments(data.comments);
    } catch (error) {
      console.error("獲取評論失敗:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !newAuthor.trim()) return;

    setSubmitting(true);
    try {
      await graphqlFetch(`
        mutation($input: CreateCommentInput!) {
          createComment(input: $input) {
            id
          }
        }
      `, {
        input: {
          content: newComment,
          author: newAuthor,
          postId,
        },
      });

      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("發表評論失敗:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="card p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-border)]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-[var(--color-border)] rounded" />
                <div className="h-4 w-full bg-[var(--color-border)] rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Comment Form */}
      {isLocked ? (
        <div className="card p-6 text-center">
          <Lock className="w-8 h-8 text-[var(--color-text-dark)] mx-auto mb-2" />
          <p className="text-[var(--color-text-muted)]">此帖子已鎖定，無法發表評論</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card p-4 space-y-4">
          <input
            type="text"
            value={newAuthor}
            onChange={(e) => setNewAuthor(e.target.value)}
            className="input"
            placeholder="你的暱稱"
            required
          />
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="input min-h-[100px] resize-none"
            placeholder="發表你的評論..."
            required
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
            >
              {submitting ? "發送中..." : (
                <>
                  <Send className="w-4 h-4" />
                  發表評論
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              isLocked={isLocked}
              onReply={fetchComments}
            />
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <p className="text-[var(--color-text-muted)]">暫無評論，來發表第一則評論吧！</p>
        </div>
      )}
    </div>
  );
}
