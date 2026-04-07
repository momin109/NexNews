"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Loader2,
  MessageCircle,
  SendHorizonal,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type CommentItem = {
  _id?: string;
  name: string;
  message: string;
  createdAt: string;
};

type CommentSectionProps = {
  newsId: string;
};

type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

const COMMENT_PAGE_SIZE = 10;

export default function CommentSection({ newsId }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: COMMENT_PAGE_SIZE,
    total: 0,
    hasMore: false,
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const approvedCount = useMemo(() => pagination.total, [pagination.total]);

  const loadComments = async (page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError("");

      const res = await fetch(
        `/api/comments?newsId=${encodeURIComponent(newsId)}&page=${page}&limit=${COMMENT_PAGE_SIZE}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to load comments");
        return;
      }

      const incomingComments = data.comments || [];

      setComments((prev) =>
        append ? [...prev, ...incomingComments] : incomingComments,
      );

      setCommentsEnabled(
        typeof data.commentsEnabled === "boolean" ? data.commentsEnabled : true,
      );

      setPagination(
        data.pagination || {
          page,
          limit: COMMENT_PAGE_SIZE,
          total: incomingComments.length,
          hasMore: false,
        },
      );
    } catch (err) {
      console.error("Comment load error:", err);
      setError("Failed to load comments");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!newsId) return;

    setComments([]);
    setPagination({
      page: 1,
      limit: COMMENT_PAGE_SIZE,
      total: 0,
      hasMore: false,
    });

    loadComments(1, false);
  }, [newsId]);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setFeedback("");
      setError("");

      const res = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newsId,
          name: form.name,
          email: form.email,
          message: form.message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to submit comment");
        return;
      }

      setFeedback(
        data.message || "Comment submitted successfully and is awaiting review",
      );
      setForm({
        name: "",
        email: "",
        message: "",
      });
    } catch (err) {
      console.error("Comment submit error:", err);
      setError("Failed to submit comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadMore = async () => {
    if (!pagination.hasMore || loadingMore) return;
    await loadComments(pagination.page + 1, true);
  };

  return (
    <section className="pt-12">
      <div className="mb-6 flex flex-col gap-3 rounded-[24px] border bg-card/70 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            <MessageCircle className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Reader Discussion
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">Comments</h2>
          </div>
        </div>

        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Share your thoughts about this story. All comments are reviewed before
          they appear publicly.
        </p>

        <div>
          <Badge variant="secondary" className="rounded-full px-4 py-2 text-sm">
            {approvedCount} published comment{approvedCount === 1 ? "" : "s"}
          </Badge>
        </div>
      </div>

      {commentsEnabled ? (
        <Card className="rounded-[24px] border shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-xl">Leave a comment</CardTitle>
            <p className="text-sm text-muted-foreground">
              Your comment will be submitted for moderation before publishing.
            </p>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your name</label>
                  <Input
                    name="name"
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={onChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email address</label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Your comment</label>
                <textarea
                  name="message"
                  placeholder="Write your thoughts..."
                  value={form.message}
                  onChange={onChange}
                  required
                  rows={6}
                  className="flex min-h-[150px] w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              {feedback ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {feedback}
                </div>
              ) : null}

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <Button
                type="submit"
                disabled={submitting}
                className="rounded-full px-6"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Comment
                    <SendHorizonal className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-[24px] border shadow-sm">
          <CardContent className="p-6">
            <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-10 text-center">
              <h3 className="text-lg font-semibold">
                Comments are currently disabled
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Reader comments are turned off for now. Please check back later.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6 rounded-[24px] border shadow-sm">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-xl">Published comments</CardTitle>
          <p className="text-sm text-muted-foreground">
            Approved reader comments on this story.
          </p>
        </CardHeader>

        <CardContent className="space-y-4 p-6">
          {loading ? (
            <div className="flex items-center gap-3 rounded-2xl border bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading comments...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : comments.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-10 text-center">
              <h3 className="text-lg font-semibold">No comments yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Be the first person to share a thought about this story.
              </p>
            </div>
          ) : (
            <>
              {comments.map((comment, index) => (
                <div
                  key={comment._id || `${comment.name}-${index}`}
                  className="rounded-2xl border bg-background p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {comment.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground">
                          {comment.name}
                        </p>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {comment.createdAt
                            ? formatDistanceToNow(new Date(comment.createdAt), {
                                addSuffix: true,
                              })
                            : "Recently"}
                        </span>
                      </div>

                      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                        {comment.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {pagination.hasMore ? (
                <div className="pt-2 text-center">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full px-6"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading more...
                      </>
                    ) : (
                      <>
                        Load more comments
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
