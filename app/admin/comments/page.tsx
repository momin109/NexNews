"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  CheckCircle,
  Trash2,
  MessageSquareOff,
  XCircle,
  Loader2,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type CommentStatus = "pending" | "approved" | "rejected";

type AdminComment = {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: CommentStatus;
  createdAt: string;
  news?: {
    _id?: string;
    title?: string;
    slug?: string;
  } | null;
};

type TabType = "pending" | "approved" | "all";

export default function CommentsManagementPage() {
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [settingLoading, setSettingLoading] = useState(true);
  const [settingSaving, setSettingSaving] = useState(false);

  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [summary, setSummary] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    all: 0,
  });

  const [pageError, setPageError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const loadCommentsSetting = async () => {
    try {
      setSettingLoading(true);

      const res = await fetch("/api/admin/settings/comments", {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load comments setting");
      }

      setCommentsEnabled(Boolean(data.commentsEnabled));
    } catch (error) {
      console.error(error);
      setCommentsEnabled(true);
    } finally {
      setSettingLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      setLoading(true);
      setPageError("");
      setActionMessage("");
      setActionError("");

      const qp = new URLSearchParams();

      if (activeTab !== "all") {
        qp.set("status", activeTab);
      }

      if (searchText.trim()) {
        qp.set("search", searchText.trim());
      }

      qp.set("limit", "100");

      const res = await fetch(`/api/admin/comments?${qp.toString()}`, {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load comments");
      }

      setComments(data.comments || []);
      setSummary(
        data.counts || {
          pending: 0,
          approved: 0,
          rejected: 0,
          all: 0,
        },
      );
    } catch (error) {
      console.error(error);
      setComments([]);
      setPageError("Failed to load comments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommentsSetting();
  }, []);

  useEffect(() => {
    loadComments();
  }, [activeTab]);

  const handleSearch = async () => {
    await loadComments();
  };

  const handleToggleComments = async (checked: boolean) => {
    try {
      setSettingSaving(true);
      setActionMessage("");
      setActionError("");

      const res = await fetch("/api/admin/settings/comments", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled: checked }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update comments setting");
      }

      setCommentsEnabled(Boolean(data.commentsEnabled));
      setActionMessage(
        checked
          ? "Comments have been enabled successfully."
          : "Comments have been disabled successfully.",
      );
    } catch (error) {
      console.error(error);
      setActionError("Failed to update comments setting.");
    } finally {
      setSettingSaving(false);
    }
  };

  const approveComment = async (id: string) => {
    try {
      setActionLoadingId(id);
      setActionMessage("");
      setActionError("");

      const res = await fetch(`/api/admin/comments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "approve" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to approve comment");
      }

      setActionMessage("Comment approved successfully.");
      await loadComments();
    } catch (error) {
      console.error(error);
      setActionError("Failed to approve comment.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const rejectComment = async (id: string) => {
    try {
      setActionLoadingId(id);
      setActionMessage("");
      setActionError("");

      const res = await fetch(`/api/admin/comments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "reject" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to reject comment");
      }

      setActionMessage("Comment rejected successfully.");
      await loadComments();
    } catch (error) {
      console.error(error);
      setActionError("Failed to reject comment.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const deleteComment = async (id: string) => {
    try {
      setActionLoadingId(id);
      setActionMessage("");
      setActionError("");

      const res = await fetch(`/api/admin/comments/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete comment");
      }

      setActionMessage("Comment deleted successfully.");
      await loadComments();
    } catch (error) {
      console.error(error);
      setActionError("Failed to delete comment.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderTabButton = (tab: TabType, label: string, count: number) => (
    <Button
      variant={activeTab === tab ? "secondary" : "ghost"}
      size="sm"
      className={activeTab === tab ? "bg-background" : "text-muted-foreground"}
      onClick={() => setActiveTab(tab)}
    >
      {label} ({count})
    </Button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Comments Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Review, approve, reject, and delete user comments.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card px-4 py-2 shadow-sm">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">
              Enable Comments System
            </Label>
            <p className="text-xs text-muted-foreground">
              {settingLoading
                ? "Loading setting..."
                : settingSaving
                  ? "Saving..."
                  : commentsEnabled
                    ? "Comments are live on published news pages"
                    : "Comments are disabled across published news pages"}
            </p>
          </div>

          <Switch
            checked={commentsEnabled}
            onCheckedChange={handleToggleComments}
            disabled={settingLoading || settingSaving}
          />
        </div>
      </div>

      {actionMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {actionMessage}
        </div>
      ) : null}

      {actionError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      ) : null}

      {!commentsEnabled ? (
        <Card className="border-2 border-dashed bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center space-y-4 p-12 text-center">
            <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <MessageSquareOff size={32} />
            </div>
            <h2 className="text-xl font-semibold">Comments are disabled</h2>
            <p className="max-w-md text-muted-foreground">
              The commenting system is currently turned off across the website.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Loaded</p>
                    <p className="mt-2 text-2xl font-bold">{summary.all}</p>
                  </div>
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="mt-2 text-2xl font-bold">{summary.pending}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="mt-2 text-2xl font-bold">{summary.approved}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="mt-2 text-2xl font-bold">{summary.rejected}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-col gap-4 border-b bg-muted/20 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-3">
                {renderTabButton("pending", "Pending", summary.pending)}
                {renderTabButton("approved", "Approved", summary.approved)}
                {renderTabButton("all", "All", summary.all)}
              </div>

              <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                <div className="relative min-w-[260px] flex-1 sm:flex-none">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search comments..."
                    className="h-9 bg-background pl-9"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                  />
                </div>

                <Button size="sm" variant="outline" onClick={handleSearch}>
                  Search
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={loadComments}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {pageError ? (
                <div className="p-10 text-center text-sm text-red-600">
                  {pageError}
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center gap-3 p-10 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading comments...
                </div>
              ) : comments.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">
                  No comments found.
                </div>
              ) : (
                <div className="divide-y">
                  {comments.map((comment) => (
                    <div
                      key={comment._id}
                      className={`flex flex-col gap-4 p-6 sm:flex-row ${
                        comment.status === "pending"
                          ? "bg-amber-500/5 dark:bg-amber-500/10"
                          : ""
                      }`}
                    >
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold">
                            {comment.name}
                          </span>

                          <span className="text-xs text-muted-foreground">
                            •{" "}
                            {comment.createdAt
                              ? formatDistanceToNow(
                                  new Date(comment.createdAt),
                                  {
                                    addSuffix: true,
                                  },
                                )
                              : "Recently"}
                          </span>

                          {comment.status === "pending" && (
                            <Badge
                              variant="outline"
                              className="border-amber-200 bg-amber-100 text-[10px] text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                            >
                              Needs Review
                            </Badge>
                          )}

                          {comment.status === "approved" && (
                            <Badge variant="outline" className="text-[10px]">
                              Approved
                            </Badge>
                          )}

                          {comment.status === "rejected" && (
                            <Badge
                              variant="destructive"
                              className="text-[10px]"
                            >
                              Rejected
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {comment.email}
                        </p>

                        <p className="whitespace-pre-line text-sm leading-7 text-foreground/90">
                          {comment.message}
                        </p>

                        <div className="inline-block rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
                          On article:{" "}
                          <span className="font-medium text-foreground">
                            {comment.news?.title || "Unknown Article"}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 sm:w-44 sm:flex-col sm:border-l sm:pl-4">
                        {comment.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full justify-start border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
                              onClick={() => approveComment(comment._id)}
                              disabled={actionLoadingId === comment._id}
                            >
                              {actionLoadingId === comment._id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="mr-2 h-4 w-4" />
                              )}
                              Approve
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full justify-start border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                              onClick={() => rejectComment(comment._id)}
                              disabled={actionLoadingId === comment._id}
                            >
                              {actionLoadingId === comment._id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="mr-2 h-4 w-4" />
                              )}
                              Reject
                            </Button>
                          </>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full justify-start border-red-200 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => deleteComment(comment._id)}
                          disabled={actionLoadingId === comment._id}
                        >
                          {actionLoadingId === comment._id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// "use client";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import {
//   Search,
//   CheckCircle,
//   XCircle,
//   Trash2,
//   MessageSquareOff,
// } from "lucide-react";
// import { Switch } from "@/components/ui/switch";
// import { Label } from "@/components/ui/label";

// const initialComments = [
//   {
//     id: 1,
//     author: "John Smith",
//     article: "Global Summit Reaches New Climate Agreement",
//     text: "Great article. It's about time world leaders took this seriously. Hopefully we see actual implementation and not just empty promises.",
//     date: "2 hours ago",
//     status: "pending",
//   },
//   {
//     id: 2,
//     author: "Alice Wonderland",
//     article: "Tech Giant Unveils Revolutionary AI Model",
//     text: "This is terrifying and exciting at the same time. Will it replace developer jobs completely?",
//     date: "5 hours ago",
//     status: "approved",
//   },
//   {
//     id: 3,
//     author: "CryptoBro99",
//     article: "Market Stocks Rally Amid Economic Optimism",
//     text: "Buy Bitcoin now before it's too late! Click here: http://spam-link.scam/buy",
//     date: "1 day ago",
//     status: "pending",
//   },
//   {
//     id: 4,
//     author: "SportsFanatic",
//     article: "Local Team Wins Championship After 20 Years",
//     text: "I WAS THERE! The atmosphere was absolutely electric. Best day of my life!",
//     date: "1 day ago",
//     status: "approved",
//   },
// ];

// export default function Comments() {
//   const [commentsEnabled, setCommentsEnabled] = useState(false);
//   const [comments, setComments] = useState(initialComments);

//   const approveComment = (id: number) => {
//     setComments(
//       comments.map((c) => (c.id === id ? { ...c, status: "approved" } : c)),
//     );
//   };

//   const deleteComment = (id: number) => {
//     setComments(comments.filter((c) => c.id !== id));
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight">
//             Comments Management
//           </h1>
//           <p className="text-sm text-muted-foreground">
//             Review, approve, and delete user comments.
//           </p>
//         </div>

//         <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-lg border border-border/50 shadow-sm">
//           <div className="space-y-0.5">
//             <Label className="text-sm font-medium">
//               Enable Comments System
//             </Label>
//             <p className="text-xs text-muted-foreground text-amber-500">
//               Currently disabled as per budget scope
//             </p>
//           </div>
//           <Switch
//             checked={commentsEnabled}
//             onCheckedChange={setCommentsEnabled}
//           />
//         </div>
//       </div>

//       {!commentsEnabled ? (
//         <Card className="border-dashed border-2 bg-muted/30">
//           <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
//             <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-2">
//               <MessageSquareOff size={32} />
//             </div>
//             <h2 className="text-xl font-semibold">Comments are disabled</h2>
//             <p className="text-muted-foreground max-w-md">
//               The commenting system is currently turned off across the website.
//               Toggle the switch above to enable this feature and view moderation
//               tools.
//             </p>
//           </CardContent>
//         </Card>
//       ) : (
//         <Card className="border-border/50 shadow-sm">
//           <CardHeader className="py-4 px-6 border-b flex flex-row items-center justify-between bg-muted/20">
//             <div className="flex gap-4">
//               <Button variant="secondary" size="sm" className="bg-background">
//                 Pending (2)
//               </Button>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="text-muted-foreground"
//               >
//                 Approved
//               </Button>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="text-muted-foreground"
//               >
//                 All
//               </Button>
//             </div>
//             <div className="relative w-64">
//               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search comments..."
//                 className="pl-9 h-9 bg-background"
//               />
//             </div>
//           </CardHeader>
//           <CardContent className="p-0">
//             <div className="divide-y">
//               {comments.map((comment) => (
//                 <div
//                   key={comment.id}
//                   className={`p-6 flex flex-col sm:flex-row gap-4 ${comment.status === "pending" ? "bg-amber-500/5 dark:bg-amber-500/10" : ""}`}
//                 >
//                   <div className="flex-1 space-y-2">
//                     <div className="flex items-center gap-2">
//                       <span className="font-semibold text-sm">
//                         {comment.author}
//                       </span>
//                       <span className="text-xs text-muted-foreground">
//                         • {comment.date}
//                       </span>
//                       {comment.status === "pending" && (
//                         <Badge
//                           variant="outline"
//                           className="text-[10px] bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800"
//                         >
//                           Needs Review
//                         </Badge>
//                       )}
//                     </div>
//                     <p className="text-sm text-foreground/90">{comment.text}</p>
//                     <div className="text-xs text-muted-foreground mt-2 bg-muted/50 p-2 rounded-md inline-block">
//                       On article:{" "}
//                       <span className="font-medium text-foreground">
//                         {comment.article}
//                       </span>
//                     </div>
//                   </div>

//                   <div className="flex sm:flex-col gap-2 justify-start sm:justify-start pt-2 sm:pt-0 sm:pl-4 sm:border-l sm:w-32">
//                     {comment.status === "pending" && (
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         className="w-full justify-start text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
//                         onClick={() => approveComment(comment.id)}
//                       >
//                         <CheckCircle className="mr-2 h-4 w-4" /> Approve
//                       </Button>
//                     )}
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 border-red-200"
//                       onClick={() => deleteComment(comment.id)}
//                     >
//                       <Trash2 className="mr-2 h-4 w-4" /> Delete
//                     </Button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }
