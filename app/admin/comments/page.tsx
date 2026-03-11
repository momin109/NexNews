"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  MessageSquareOff,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const initialComments = [
  {
    id: 1,
    author: "John Smith",
    article: "Global Summit Reaches New Climate Agreement",
    text: "Great article. It's about time world leaders took this seriously. Hopefully we see actual implementation and not just empty promises.",
    date: "2 hours ago",
    status: "pending",
  },
  {
    id: 2,
    author: "Alice Wonderland",
    article: "Tech Giant Unveils Revolutionary AI Model",
    text: "This is terrifying and exciting at the same time. Will it replace developer jobs completely?",
    date: "5 hours ago",
    status: "approved",
  },
  {
    id: 3,
    author: "CryptoBro99",
    article: "Market Stocks Rally Amid Economic Optimism",
    text: "Buy Bitcoin now before it's too late! Click here: http://spam-link.scam/buy",
    date: "1 day ago",
    status: "pending",
  },
  {
    id: 4,
    author: "SportsFanatic",
    article: "Local Team Wins Championship After 20 Years",
    text: "I WAS THERE! The atmosphere was absolutely electric. Best day of my life!",
    date: "1 day ago",
    status: "approved",
  },
];

export default function Comments() {
  const [commentsEnabled, setCommentsEnabled] = useState(false);
  const [comments, setComments] = useState(initialComments);

  const approveComment = (id: number) => {
    setComments(
      comments.map((c) => (c.id === id ? { ...c, status: "approved" } : c)),
    );
  };

  const deleteComment = (id: number) => {
    setComments(comments.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Comments Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Review, approve, and delete user comments.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-lg border border-border/50 shadow-sm">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">
              Enable Comments System
            </Label>
            <p className="text-xs text-muted-foreground text-amber-500">
              Currently disabled as per budget scope
            </p>
          </div>
          <Switch
            checked={commentsEnabled}
            onCheckedChange={setCommentsEnabled}
          />
        </div>
      </div>

      {!commentsEnabled ? (
        <Card className="border-dashed border-2 bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-2">
              <MessageSquareOff size={32} />
            </div>
            <h2 className="text-xl font-semibold">Comments are disabled</h2>
            <p className="text-muted-foreground max-w-md">
              The commenting system is currently turned off across the website.
              Toggle the switch above to enable this feature and view moderation
              tools.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="py-4 px-6 border-b flex flex-row items-center justify-between bg-muted/20">
            <div className="flex gap-4">
              <Button variant="secondary" size="sm" className="bg-background">
                Pending (2)
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                Approved
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                All
              </Button>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search comments..."
                className="pl-9 h-9 bg-background"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`p-6 flex flex-col sm:flex-row gap-4 ${comment.status === "pending" ? "bg-amber-500/5 dark:bg-amber-500/10" : ""}`}
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {comment.author}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        • {comment.date}
                      </span>
                      {comment.status === "pending" && (
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800"
                        >
                          Needs Review
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-foreground/90">{comment.text}</p>
                    <div className="text-xs text-muted-foreground mt-2 bg-muted/50 p-2 rounded-md inline-block">
                      On article:{" "}
                      <span className="font-medium text-foreground">
                        {comment.article}
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col gap-2 justify-start sm:justify-start pt-2 sm:pt-0 sm:pl-4 sm:border-l sm:w-32">
                    {comment.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full justify-start text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                        onClick={() => approveComment(comment.id)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" /> Approve
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 border-red-200"
                      onClick={() => deleteComment(comment.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
