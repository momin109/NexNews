"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Clock3,
  ExternalLink,
  FileText,
  LayoutDashboard,
  Newspaper,
  Sparkles,
  Tags,
  Users,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type UserRole = "super_admin" | "admin" | "editor" | "reporter";

type DashboardStats = {
  totalNews: number;
  totalCategories: number;
  totalUsers: number;
  publishedNews: number;
  draftNews: number;
  unpublishedNews: number;
};

type RecentPost = {
  _id: string;
  title: string;
  status: "published" | "draft" | "unpublished";
  createdAt: string;
  category?: {
    _id?: string;
    name: string;
    slug: string;
  } | null;
};

type DashboardResponse = {
  role: UserRole;
  stats: DashboardStats;
  recentPosts: RecentPost[];
  message?: string;
};

const GA_REPORTS_URL =
  "https://analytics.google.com/analytics/web/#/a389110052p530274417/reports/intelligenthome?params=_u..nav%3Dmaui";

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const numberFormat = new Intl.NumberFormat("en-US");

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  glow,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  glow: string;
}) {
  return (
    <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-background to-muted/30 shadow-[0_12px_50px_-24px_rgba(0,0,0,.45)]">
      <div className={cn("absolute inset-x-0 top-0 h-1", glow)} />
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="mt-3 text-3xl font-bold tracking-tight">
              {numberFormat.format(value)}
            </h3>
            <p className="mt-2 text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-background/80 p-3 shadow-sm">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatProgress({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: string;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {numberFormat.format(value)}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${total ? (value / total) * 100 : 0}%` }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className={cn("h-full rounded-full", tone)}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setMessage("");

        const res = await fetch("/api/dashboard", {
          method: "GET",
          cache: "no-store",
        });

        const data: DashboardResponse = await res.json();

        if (!res.ok) {
          setMessage(data.message || "Failed to load dashboard");
          return;
        }

        setRole(data.role);
        setStats(data.stats);
        setRecentPosts(data.recentPosts || []);
      } catch (error) {
        console.error("Dashboard page error:", error);
        setMessage("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const statCards = useMemo(() => {
    if (!stats || !role) return [];

    if (role === "reporter") {
      return [
        {
          title: "My Articles",
          value: stats.totalNews,
          subtitle: `${stats.publishedNews} published and live`,
          icon: Newspaper,
          glow: "bg-gradient-to-r from-blue-500 via-cyan-400 to-sky-400",
        },
        {
          title: "My Drafts",
          value: stats.draftNews,
          subtitle: `${stats.unpublishedNews} awaiting review`,
          icon: FileText,
          glow: "bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-300",
        },
        {
          title: "Published Articles",
          value: stats.publishedNews,
          subtitle: "Live content on the portal",
          icon: Activity,
          glow: "bg-gradient-to-r from-violet-500 via-fuchsia-400 to-pink-400",
        },
      ];
    }

    return [
      {
        title: "Total News",
        value: stats.totalNews,
        subtitle: `${stats.publishedNews} articles published`,
        icon: Newspaper,
        glow: "bg-gradient-to-r from-blue-500 via-cyan-400 to-sky-400",
      },
      {
        title: "Total Categories",
        value: stats.totalCategories,
        subtitle: "Structured content distribution",
        icon: Tags,
        glow: "bg-gradient-to-r from-violet-500 via-fuchsia-400 to-pink-400",
      },
      {
        title: "Team Members",
        value: stats.totalUsers,
        subtitle: "Portal members with access",
        icon: Users,
        glow: "bg-gradient-to-r from-emerald-500 via-lime-400 to-green-300",
      },
      {
        title: "Draft Articles",
        value: stats.draftNews,
        subtitle: `${stats.unpublishedNews} unpublished items`,
        icon: FileText,
        glow: "bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-300",
      },
    ];
  }, [role, stats]);

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-[28px] border bg-card/70 backdrop-blur">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="text-sm text-muted-foreground">
            Loading premium dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (message) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {message}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-7 text-white shadow-[0_24px_80px_-32px_rgba(15,23,42,.65)] md:px-8">
        <div className="absolute -left-24 top-0 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-fuchsia-500/20 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <Badge className="rounded-full border-white/10 bg-white/10 px-3 py-1 text-white hover:bg-white/10">
              <Sparkles className="mr-1 h-3.5 w-3.5" /> Premium Newsroom
              Dashboard
            </Badge>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {role === "reporter" ? "My Workspace" : "Executive Dashboard"}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
                {role === "reporter"
                  ? "A polished workspace for tracking your publishing workflow, article status, and recent content activity."
                  : "A premium control center for managing your newsroom, content pipeline, and team operations."}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              className="rounded-full px-5 shadow-[0_10px_30px_-12px_rgba(59,130,246,.7)]"
            >
              <a href={GA_REPORTS_URL} target="_blank" rel="noreferrer">
                Open Google Analytics
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>

            <Button asChild variant="secondary" className="rounded-full px-5">
              <Link href="/admin/news">
                Manage News
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section
        className={cn(
          "grid gap-5",
          role === "reporter"
            ? "md:grid-cols-3"
            : "md:grid-cols-2 xl:grid-cols-4",
        )}
      >
        {statCards.map((item) => (
          <MetricCard key={item.title} {...item} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_.95fr]">
        <Card className="overflow-hidden rounded-[28px] border-white/10 bg-card/80 shadow-[0_16px_48px_-28px_rgba(15,23,42,.35)] backdrop-blur-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <LayoutDashboard className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-[0.2em]">
                Analytics Access
              </span>
            </div>
            <CardTitle className="mt-2 text-xl">
              Website visitor analytics lives in Google Analytics
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Live visitors, daily visits, top viewed news, traffic source, and
              engagement reports are available from your connected GA4 property.
            </p>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Visitor count",
                  desc: "See realtime active users and daily traffic directly in GA4.",
                },
                {
                  title: "Top news views",
                  desc: "Open reports to check which news pages are getting the most views.",
                },
                {
                  title: "Traffic source",
                  desc: "Review source and acquisition breakdown from Google Analytics.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border/60 bg-background/70 p-4"
                >
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-[26px] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 text-white">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <Badge className="rounded-full border-white/10 bg-white/10 text-white hover:bg-white/10">
                    External Analytics
                  </Badge>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight">
                    Open full Google Analytics reports
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Since server-side GA4 API access is not enabled yet, visitor
                    analytics stays accurate by opening the official GA4
                    dashboard.
                  </p>
                </div>

                <Button
                  asChild
                  size="lg"
                  className="rounded-full px-6 shadow-[0_10px_30px_-12px_rgba(59,130,246,.7)]"
                >
                  <a href={GA_REPORTS_URL} target="_blank" rel="noreferrer">
                    View Analytics Reports
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-white/10 bg-card/80 shadow-[0_16px_48px_-28px_rgba(15,23,42,.35)]">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-xl">Publishing snapshot</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              A clean summary of current content status from your database.
            </p>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border bg-muted/20 p-4">
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="mt-2 text-3xl font-semibold">
                  {numberFormat.format(stats?.publishedNews ?? 0)}
                </p>
              </div>

              <div className="rounded-2xl border bg-muted/20 p-4">
                <p className="text-sm text-muted-foreground">Draft</p>
                <p className="mt-2 text-3xl font-semibold">
                  {numberFormat.format(stats?.draftNews ?? 0)}
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <StatProgress
                label="Published"
                value={stats?.publishedNews ?? 0}
                total={stats?.totalNews ?? 0}
                tone="bg-emerald-500"
              />
              <StatProgress
                label="Draft"
                value={stats?.draftNews ?? 0}
                total={stats?.totalNews ?? 0}
                tone="bg-amber-500"
              />
              <StatProgress
                label="Unpublished"
                value={stats?.unpublishedNews ?? 0}
                total={stats?.totalNews ?? 0}
                tone="bg-rose-500"
              />
            </div>

            <div className="rounded-2xl border border-dashed bg-muted/20 p-4">
              <p className="font-medium">Why analytics opens externally</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Content and newsroom stats are rendered here dynamically from
                your app database. Visitor analytics is opened in GA4 to keep
                the numbers accurate without relying on placeholder values.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section
        className={cn(
          "grid gap-6",
          role === "reporter"
            ? "xl:grid-cols-[1.35fr_.9fr]"
            : "xl:grid-cols-[1.2fr_.8fr_.9fr]",
        )}
      >
        <Card
          className={cn(
            "rounded-[28px] border-white/10 bg-card/80 shadow-[0_16px_48px_-28px_rgba(15,23,42,.35)]",
            role !== "reporter" && "xl:col-span-1",
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4">
            <div>
              <CardTitle className="text-xl">
                {role === "reporter" ? "My recent posts" : "Recent posts"}
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {role === "reporter"
                  ? "Latest posts created by you."
                  : "Latest content created across the portal."}
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/admin/news">View all</Link>
            </Button>
          </CardHeader>

          <CardContent className="space-y-4 p-6">
            {recentPosts.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                No recent posts found.
              </div>
            ) : (
              recentPosts.map((post) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group rounded-2xl border border-border/60 bg-background/70 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-semibold text-foreground group-hover:text-primary">
                        {post.title}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1">
                          <Tags className="h-3.5 w-3.5" />
                          {post.category?.name || "Uncategorized"}
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1">
                          <Clock3 className="h-3.5 w-3.5" />
                          {formatDistanceToNow(new Date(post.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant={
                        post.status === "published"
                          ? "default"
                          : post.status === "draft"
                            ? "secondary"
                            : "destructive"
                      }
                      className="rounded-full px-3 py-1 capitalize"
                    >
                      {post.status}
                    </Badge>
                  </div>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>

        {role !== "reporter" && (
          <Card className="rounded-[28px] border-white/10 bg-card/80 shadow-[0_16px_48px_-28px_rgba(15,23,42,.35)]">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-xl">Team overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="rounded-2xl border bg-muted/20 p-4">
                <p className="text-sm text-muted-foreground">
                  Active portal users
                </p>
                <p className="mt-2 text-3xl font-semibold">
                  {numberFormat.format(stats?.totalUsers ?? 0)}
                </p>
              </div>

              <div className="rounded-2xl border bg-muted/20 p-4">
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="mt-2 text-3xl font-semibold">
                  {numberFormat.format(stats?.totalCategories ?? 0)}
                </p>
              </div>

              <div className="rounded-2xl border border-dashed bg-muted/20 p-4">
                <p className="font-medium">Need live visitor insights?</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Open the GA4 reports page to check live visitors, top news
                  views, source breakdown, and daily traffic.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="rounded-[28px] border-white/10 bg-card/80 shadow-[0_16px_48px_-28px_rgba(15,23,42,.35)]">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-xl">
              {role === "reporter" ? "Publishing health" : "Analytics shortcut"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5 p-6">
            {role === "reporter" ? (
              <>
                <div className="rounded-2xl bg-muted/40 p-4">
                  <p className="text-sm text-muted-foreground">
                    Published ratio
                  </p>
                  <p className="mt-1 text-3xl font-semibold">
                    {stats?.totalNews
                      ? Math.round(
                          ((stats.publishedNews ?? 0) / stats.totalNews) * 100,
                        )
                      : 0}
                    %
                  </p>
                </div>

                <div className="space-y-4">
                  <StatProgress
                    label="Published"
                    value={stats?.publishedNews ?? 0}
                    total={stats?.totalNews ?? 0}
                    tone="bg-emerald-500"
                  />
                  <StatProgress
                    label="Draft"
                    value={stats?.draftNews ?? 0}
                    total={stats?.totalNews ?? 0}
                    tone="bg-amber-500"
                  />
                  <StatProgress
                    label="Unpublished"
                    value={stats?.unpublishedNews ?? 0}
                    total={stats?.totalNews ?? 0}
                    tone="bg-rose-500"
                  />
                </div>
              </>
            ) : (
              <div className="rounded-[26px] border border-white/10 bg-gradient-to-br from-primary/[0.1] via-background to-background p-5">
                <p className="text-sm font-medium text-muted-foreground">
                  Google Analytics
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                  Check live website analytics
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  View visitor count, most viewed news, daily visits, and
                  traffic insights in your official GA4 dashboard.
                </p>

                <Button asChild className="mt-5 rounded-full">
                  <a href={GA_REPORTS_URL} target="_blank" rel="noreferrer">
                    Open Analytics
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <Card className="rounded-[28px] border-white/10 bg-gradient-to-br from-primary/[0.08] via-background to-background shadow-[0_16px_48px_-28px_rgba(15,23,42,.35)]">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-xl">Content summary</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            <StatProgress
              label="Published"
              value={stats?.publishedNews ?? 0}
              total={stats?.totalNews ?? 0}
              tone="bg-emerald-500"
            />
            <StatProgress
              label="Draft"
              value={stats?.draftNews ?? 0}
              total={stats?.totalNews ?? 0}
              tone="bg-amber-500"
            />
            <StatProgress
              label="Unpublished"
              value={stats?.unpublishedNews ?? 0}
              total={stats?.totalNews ?? 0}
              tone="bg-rose-500"
            />
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-white/10 bg-card/80 shadow-[0_16px_48px_-28px_rgba(15,23,42,.35)]">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-xl">Quick actions</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-3 p-6 sm:grid-cols-2">
            {[
              { href: "/admin/news", label: "Manage News", icon: Newspaper },
              {
                href: "/admin/categories",
                label: "Manage Categories",
                icon: Tags,
              },
              { href: "/admin/users", label: "Manage Users", icon: Users },
              {
                href: "/admin/news/create",
                label: "Create Article",
                icon: BarChart3,
              },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="group rounded-2xl border border-border/60 bg-background/70 p-4 transition-all hover:border-primary/30 hover:bg-primary/[0.04]"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-2xl bg-muted p-3">
                    <action.icon className="h-5 w-5 text-primary" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
                <p className="mt-4 font-medium">{action.label}</p>
              </Link>
            ))}

            <a
              href={GA_REPORTS_URL}
              target="_blank"
              rel="noreferrer"
              className="group rounded-2xl border border-border/60 bg-background/70 p-4 transition-all hover:border-primary/30 hover:bg-primary/[0.04]"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-2xl bg-muted p-3">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
              <p className="mt-4 font-medium">Open Analytics</p>
            </a>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

//////////////////////

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import Link from "next/link";
// import { formatDistanceToNow } from "date-fns";
// import { motion } from "framer-motion";
// import {
//   Activity,
//   ArrowRight,
//   BadgeCheck,
//   BarChart3,
//   Clock3,
//   Eye,
//   FileText,
//   Globe2,
//   LayoutDashboard,
//   Newspaper,
//   Radio,
//   Sparkles,
//   Tags,
//   TrendingUp,
//   Users,
// } from "lucide-react";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";

// type UserRole = "super_admin" | "admin" | "editor" | "reporter";

// type DashboardStats = {
//   totalNews: number;
//   totalCategories: number;
//   totalUsers: number;
//   publishedNews: number;
//   draftNews: number;
//   unpublishedNews: number;
// };

// type RecentPost = {
//   _id: string;
//   title: string;
//   status: "published" | "draft" | "unpublished";
//   createdAt: string;
//   category?: {
//     _id?: string;
//     name: string;
//     slug: string;
//   } | null;
// };

// type AnalyticsMetric = {
//   label: string;
//   value: number;
//   change?: string;
//   tone?: "default" | "success" | "warning" | "danger";
// };

// type TrafficSource = {
//   label: string;
//   value: number;
// };

// type CountryStat = {
//   country: string;
//   activeUsers: number;
// };

// type PageViewStat = {
//   title: string;
//   views: number;
// };

// type EventStat = {
//   name: string;
//   count: number;
// };

// type TimePoint = {
//   label: string;
//   value: number;
// };

// type DashboardAnalytics = {
//   activeUsers?: number;
//   eventCount?: number;
//   keyEvents?: number;
//   newUsers?: number;
//   activeUsersLast30Minutes?: number;
//   countries?: CountryStat[];
//   pageViews?: PageViewStat[];
//   trafficSources?: TrafficSource[];
//   events?: EventStat[];
//   userActivity7Days?: TimePoint[];
//   userActivity30Days?: TimePoint[];
//   newUsersBySource?: TrafficSource[];
// };

// type DashboardResponse = {
//   role: UserRole;
//   stats: DashboardStats;
//   recentPosts: RecentPost[];
//   analytics?: DashboardAnalytics;
//   message?: string;
// };

// const cn = (...classes: Array<string | false | null | undefined>) =>
//   classes.filter(Boolean).join(" ");

// const numberFormat = new Intl.NumberFormat("en-US");

// function MiniAreaChart({
//   data,
//   height = 120,
// }: {
//   data: number[];
//   height?: number;
// }) {
//   const width = 520;
//   const max = Math.max(...data, 1);
//   const min = Math.min(...data, 0);
//   const range = Math.max(max - min, 1);

//   const points = data
//     .map((value, index) => {
//       const x = (index / Math.max(data.length - 1, 1)) * width;
//       const y = height - ((value - min) / range) * (height - 14) - 7;
//       return `${x},${y}`;
//     })
//     .join(" ");

//   const area = `0,${height} ${points} ${width},${height}`;

//   return (
//     <svg viewBox={`0 0 ${width} ${height}`} className="h-36 w-full">
//       <defs>
//         <linearGradient id="dashGradient" x1="0" x2="0" y1="0" y2="1">
//           <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
//           <stop offset="100%" stopColor="currentColor" stopOpacity="0.03" />
//         </linearGradient>
//       </defs>

//       {[0.2, 0.4, 0.6, 0.8].map((g) => (
//         <line
//           key={g}
//           x1="0"
//           x2={width}
//           y1={height * g}
//           y2={height * g}
//           className="stroke-border"
//           strokeWidth="1"
//           strokeDasharray="4 6"
//         />
//       ))}

//       <polygon
//         points={area}
//         fill="url(#dashGradient)"
//         className="text-primary"
//       />
//       <polyline
//         points={points}
//         fill="none"
//         className="text-primary"
//         stroke="currentColor"
//         strokeWidth="3"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//     </svg>
//   );
// }

// function CompareLinesChart({
//   current,
//   previous,
// }: {
//   current: number[];
//   previous: number[];
// }) {
//   const width = 560;
//   const height = 220;
//   const values = [...current, ...previous];
//   const max = Math.max(...values, 1);
//   const min = Math.min(...values, 0);
//   const range = Math.max(max - min, 1);

//   const createPoints = (data: number[]) =>
//     data
//       .map((value, index) => {
//         const x = (index / Math.max(data.length - 1, 1)) * width;
//         const y = height - ((value - min) / range) * (height - 24) - 12;
//         return `${x},${y}`;
//       })
//       .join(" ");

//   return (
//     <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full">
//       {[0.2, 0.4, 0.6, 0.8].map((g) => (
//         <line
//           key={g}
//           x1="0"
//           x2={width}
//           y1={height * g}
//           y2={height * g}
//           className="stroke-border"
//           strokeWidth="1"
//           strokeDasharray="5 6"
//         />
//       ))}

//       <polyline
//         points={createPoints(previous)}
//         fill="none"
//         className="text-muted-foreground/50"
//         stroke="currentColor"
//         strokeWidth="2.5"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         strokeDasharray="8 8"
//       />

//       <polyline
//         points={createPoints(current)}
//         fill="none"
//         className="text-primary"
//         stroke="currentColor"
//         strokeWidth="3.5"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//     </svg>
//   );
// }

// function HorizontalBars({
//   items,
//   maxValue,
// }: {
//   items: Array<{ label: string; value: number }>;
//   maxValue?: number;
// }) {
//   const max = maxValue || Math.max(...items.map((item) => item.value), 1);

//   return (
//     <div className="space-y-4">
//       {items.map((item) => (
//         <div key={item.label} className="space-y-2">
//           <div className="flex items-center justify-between gap-3 text-sm">
//             <p className="truncate font-medium text-foreground">{item.label}</p>
//             <span className="text-muted-foreground">
//               {numberFormat.format(item.value)}
//             </span>
//           </div>
//           <div className="h-2.5 overflow-hidden rounded-full bg-muted">
//             <motion.div
//               initial={{ width: 0 }}
//               animate={{ width: `${(item.value / max) * 100}%` }}
//               transition={{ duration: 0.7, ease: "easeOut" }}
//               className="h-full rounded-full bg-primary"
//             />
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// function MetricCard({
//   title,
//   value,
//   subtitle,
//   icon: Icon,
//   glow,
// }: {
//   title: string;
//   value: number;
//   subtitle: string;
//   icon: React.ComponentType<{ className?: string }>;
//   glow: string;
// }) {
//   return (
//     <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-background to-muted/30 shadow-[0_12px_50px_-24px_rgba(0,0,0,.45)]">
//       <div className={cn("absolute inset-x-0 top-0 h-1", glow)} />
//       <CardContent className="p-6">
//         <div className="flex items-start justify-between gap-4">
//           <div>
//             <p className="text-sm font-medium text-muted-foreground">{title}</p>
//             <h3 className="mt-3 text-3xl font-bold tracking-tight">
//               {numberFormat.format(value)}
//             </h3>
//             <p className="mt-2 text-xs text-muted-foreground">{subtitle}</p>
//           </div>
//           <div className="rounded-2xl border border-white/10 bg-background/80 p-3 shadow-sm">
//             <Icon className="h-5 w-5 text-primary" />
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// export default function DashboardPage() {
//   const [role, setRole] = useState<UserRole | null>(null);
//   const [stats, setStats] = useState<DashboardStats | null>(null);
//   const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
//   const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     const fetchDashboard = async () => {
//       try {
//         setLoading(true);
//         setMessage("");

//         const res = await fetch("/api/dashboard", {
//           method: "GET",
//           cache: "no-store",
//         });

//         const data: DashboardResponse = await res.json();

//         if (!res.ok) {
//           setMessage(data.message || "Failed to load dashboard");
//           return;
//         }

//         setRole(data.role);
//         setStats(data.stats);
//         setRecentPosts(data.recentPosts || []);
//         setAnalytics(data.analytics || null);
//       } catch (error) {
//         console.error("Dashboard page error:", error);
//         setMessage("Failed to load dashboard");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboard();
//   }, []);

//   const derivedAnalytics = useMemo<DashboardAnalytics>(() => {
//     const totalNews = stats?.totalNews ?? 0;
//     const published = stats?.publishedNews ?? 0;
//     const drafts = stats?.draftNews ?? 0;
//     const unpublished = stats?.unpublishedNews ?? 0;

//     return {
//       activeUsers: analytics?.activeUsers ?? stats?.totalUsers ?? 0,
//       eventCount:
//         analytics?.eventCount ?? totalNews + published + drafts + unpublished,
//       keyEvents: analytics?.keyEvents ?? published,
//       newUsers:
//         analytics?.newUsers ??
//         Math.max(1, Math.ceil((stats?.totalUsers ?? 0) / 4)),
//       activeUsersLast30Minutes:
//         analytics?.activeUsersLast30Minutes ??
//         Math.min(stats?.totalUsers ?? 0, 4),
//       countries:
//         analytics?.countries ??
//         [
//           {
//             country: "Bangladesh",
//             activeUsers: Math.max(1, Math.min(stats?.totalUsers ?? 1, 6)),
//           },
//           {
//             country: "India",
//             activeUsers: stats?.totalUsers && stats.totalUsers > 5 ? 2 : 0,
//           },
//           {
//             country: "United States",
//             activeUsers: stats?.totalUsers && stats.totalUsers > 8 ? 1 : 0,
//           },
//         ].filter((item) => item.activeUsers > 0),
//       pageViews: analytics?.pageViews ?? [
//         { title: "Daily Post", views: Math.max(7, published) },
//         {
//           title: "Home | News Portal",
//           views: Math.max(2, Math.ceil(totalNews / 2)),
//         },
//         { title: "Category Archive", views: Math.max(1, drafts) },
//       ],
//       trafficSources: analytics?.trafficSources ?? [
//         { label: "Direct", value: Math.max(1, Math.ceil(totalNews / 5)) },
//         { label: "Facebook", value: Math.max(1, Math.ceil(published / 4)) },
//         {
//           label: "Google Search",
//           value: Math.max(1, Math.ceil(totalNews / 6)),
//         },
//       ],
//       events: analytics?.events ?? [
//         { name: "page_view", count: Math.max(9, totalNews) },
//         { name: "scroll", count: Math.max(3, Math.ceil(totalNews / 3)) },
//         {
//           name: "first_visit",
//           count: Math.max(1, Math.ceil((stats?.totalUsers ?? 1) / 2)),
//         },
//         { name: "session_start", count: Math.max(1, Math.ceil(totalNews / 6)) },
//         {
//           name: "user_engagement",
//           count: Math.max(1, Math.ceil(published / 5)),
//         },
//       ],
//       userActivity7Days: analytics?.userActivity7Days ?? [
//         { label: "25 Mar", value: 0 },
//         { label: "26 Mar", value: 0 },
//         { label: "27 Mar", value: 0 },
//         { label: "28 Mar", value: 1 },
//         { label: "29 Mar", value: 1 },
//         { label: "30 Mar", value: 1 },
//         { label: "31 Mar", value: 1 },
//       ],
//       userActivity30Days: analytics?.userActivity30Days ?? [
//         { label: "25 Mar", value: 0 },
//         { label: "26 Mar", value: 0 },
//         { label: "27 Mar", value: 0 },
//         { label: "28 Mar", value: 1 },
//         { label: "29 Mar", value: 0 },
//         { label: "30 Mar", value: 0 },
//         { label: "31 Mar", value: 0 },
//       ],
//       newUsersBySource: analytics?.newUsersBySource ?? [
//         {
//           label: "Direct",
//           value: Math.max(1, Math.ceil((stats?.totalUsers ?? 1) / 4)),
//         },
//       ],
//     };
//   }, [analytics, stats]);

//   const overviewMetrics: AnalyticsMetric[] = useMemo(() => {
//     return [
//       {
//         label: "Active users",
//         value: derivedAnalytics.activeUsers ?? 0,
//         change: "Live audience snapshot",
//       },
//       {
//         label: "Event count",
//         value: derivedAnalytics.eventCount ?? 0,
//         change: "Tracked interactions",
//       },
//       {
//         label: "Key events",
//         value: derivedAnalytics.keyEvents ?? 0,
//         change: "Goal completions",
//       },
//       {
//         label: "New users",
//         value: derivedAnalytics.newUsers ?? 0,
//         change: "First-time visitors",
//       },
//     ];
//   }, [derivedAnalytics]);

//   const statCards = useMemo(() => {
//     if (!stats || !role) return [];

//     if (role === "reporter") {
//       return [
//         {
//           title: "My Articles",
//           value: stats.totalNews,
//           subtitle: `${stats.publishedNews} published and live`,
//           icon: Newspaper,
//           glow: "bg-gradient-to-r from-blue-500 via-cyan-400 to-sky-400",
//         },
//         {
//           title: "My Drafts",
//           value: stats.draftNews,
//           subtitle: `${stats.unpublishedNews} awaiting review`,
//           icon: FileText,
//           glow: "bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-300",
//         },
//         {
//           title: "My Reach",
//           value: derivedAnalytics.eventCount ?? 0,
//           subtitle: "Estimated engagement signals",
//           icon: Activity,
//           glow: "bg-gradient-to-r from-violet-500 via-fuchsia-400 to-pink-400",
//         },
//       ];
//     }

//     return [
//       {
//         title: "Total News",
//         value: stats.totalNews,
//         subtitle: `${stats.publishedNews} articles published`,
//         icon: Newspaper,
//         glow: "bg-gradient-to-r from-blue-500 via-cyan-400 to-sky-400",
//       },
//       {
//         title: "Total Categories",
//         value: stats.totalCategories,
//         subtitle: "Structured content distribution",
//         icon: Tags,
//         glow: "bg-gradient-to-r from-violet-500 via-fuchsia-400 to-pink-400",
//       },
//       {
//         title: "Active Users",
//         value: stats.totalUsers,
//         subtitle: "Portal members with access",
//         icon: Users,
//         glow: "bg-gradient-to-r from-emerald-500 via-lime-400 to-green-300",
//       },
//       {
//         title: "Draft Articles",
//         value: stats.draftNews,
//         subtitle: `${stats.unpublishedNews} unpublished items`,
//         icon: FileText,
//         glow: "bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-300",
//       },
//     ];
//   }, [derivedAnalytics.eventCount, role, stats]);

//   const overviewSeries = derivedAnalytics.userActivity7Days?.map(
//     (item) => item.value,
//   ) ?? [0, 0, 0, 1, 1, 1, 1];
//   const previousSeries = derivedAnalytics.userActivity30Days?.map(
//     (item) => item.value,
//   ) ?? [0, 0, 0, 1, 0, 0, 0];

//   if (loading) {
//     return (
//       <div className="flex min-h-[420px] items-center justify-center rounded-[28px] border bg-card/70 backdrop-blur">
//         <div className="space-y-3 text-center">
//           <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
//           <p className="text-sm text-muted-foreground">
//             Loading premium dashboard...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (message) {
//     return (
//       <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//         {message}
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8 pb-8">
//       <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-7 text-white shadow-[0_24px_80px_-32px_rgba(15,23,42,.65)] md:px-8">
//         <div className="absolute -left-24 top-0 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
//         <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-fuchsia-500/20 blur-3xl" />
//         <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
//           <div className="max-w-2xl space-y-4">
//             <Badge className="rounded-full border-white/10 bg-white/10 px-3 py-1 text-white hover:bg-white/10">
//               <Sparkles className="mr-1 h-3.5 w-3.5" /> Premium Analytics
//               Dashboard
//             </Badge>
//             <div>
//               <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
//                 {role === "reporter" ? "My Dashboard" : "Executive Dashboard"}
//               </h1>
//               <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
//                 {role === "reporter"
//                   ? "Your articles, drafts, engagement signals, and recent publishing workflow in one premium view."
//                   : "A premium control center inspired by modern analytics dashboards, built for your news portal."}
//               </p>
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
//             {overviewMetrics.map((item) => (
//               <div
//                 key={item.label}
//                 className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
//               >
//                 <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
//                   {item.label}
//                 </p>
//                 <h3 className="mt-2 text-2xl font-semibold">
//                   {numberFormat.format(item.value)}
//                 </h3>
//                 <p className="mt-1 text-xs text-slate-300">{item.change}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       <section
//         className={cn(
//           "grid gap-5",
//           role === "reporter"
//             ? "md:grid-cols-3"
//             : "md:grid-cols-2 xl:grid-cols-4",
//         )}
//       >
//         {statCards.map((item) => (
//           <MetricCard key={item.title} {...item} />
//         ))}
//       </section>

//       <section className="grid gap-6 xl:grid-cols-[1.6fr_.9fr]">
//         <Card className="overflow-hidden rounded-[28px] border-white/10 bg-card/80 shadow-[0_16px_48px_-28px_rgba(15,23,42,.35)] backdrop-blur-sm">
//           <CardHeader className="flex flex-col gap-4 border-b border-border/60 pb-4 sm:flex-row sm:items-start sm:justify-between">
//             <div>
//               <div className="flex items-center gap-2 text-muted-foreground">
//                 <LayoutDashboard className="h-4 w-4" />
//                 <span className="text-xs font-medium uppercase tracking-[0.2em]">
//                   Overview
//                 </span>
//               </div>
//               <CardTitle className="mt-2 text-xl">
//                 User activity over time
//               </CardTitle>
//               <p className="mt-1 text-sm text-muted-foreground">
//                 Compare current activity with the previous period.
//               </p>
//             </div>
//             <div className="flex items-center gap-2 text-xs text-muted-foreground">
//               <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
//                 <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Last 7
//                 days
//               </span>
//               <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
//                 <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/60" />{" "}
//                 Previous period
//               </span>
//             </div>
//           </CardHeader>
//           <CardContent className="p-6">
//             <CompareLinesChart
//               current={overviewSeries}
//               previous={previousSeries}
//             />
//             <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4 text-sm">
//               <div>
//                 <p className="text-muted-foreground">30 days</p>
//                 <p className="mt-1 text-2xl font-semibold">
//                   {numberFormat.format(previousSeries.at(-1) ?? 0)}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-muted-foreground">7 days</p>
//                 <p className="mt-1 text-2xl font-semibold">
//                   {numberFormat.format(overviewSeries.at(-1) ?? 0)}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-muted-foreground">1 day</p>
//                 <p className="mt-1 text-2xl font-semibold">
//                   {numberFormat.format(
//                     (overviewSeries.at(-1) ?? 0) - (overviewSeries.at(-2) ?? 0),
//                   )}
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="rounded-[28px] border-white/10 bg-card/80 shadow-[0_16px_48px_-28px_rgba(15,23,42,.35)] backdrop-blur-sm">
//           <CardHeader className="border-b border-border/60 pb-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
//                   Realtime
//                 </p>
//                 <CardTitle className="mt-2 text-xl">
//                   Active users in last 30 minutes
//                 </CardTitle>
//               </div>
//               <div className="inline-flex items-center gap-2 rounded-full border bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600">
//                 <Radio className="h-3.5 w-3.5" /> Live
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent className="space-y-6 p-6">
//             <div>
//               <h3 className="text-5xl font-bold tracking-tight">
//                 {numberFormat.format(
//                   derivedAnalytics.activeUsersLast30Minutes ?? 0,
//                 )}
//               </h3>
//               <p className="mt-2 text-sm text-muted-foreground">
//                 Realtime audience signal from recent sessions.
//               </p>
//             </div>

//             <div>
//               <p className="mb-3 text-sm font-medium">
//                 Active users per minute
//               </p>
//               <div className="rounded-2xl bg-muted/50 p-4 text-primary">
//                 <MiniAreaChart
//                   data={[0, 0, 0, 0, 1, 1, 1, 1, 0, 0]}
//                   height={90}
//                 />
//               </div>
//             </div>

//             <div>
//               <div className="mb-3 flex items-center justify-between text-sm">
//                 <p className="font-medium">Country</p>
//                 <p className="text-muted-foreground">Active users</p>
//               </div>
//               <HorizontalBars
//                 items={(derivedAnalytics.countries ?? []).map((item) => ({
//                   label: item.country,
//                   value: item.activeUsers,
//                 }))}
//               />
//             </div>
//           </CardContent>
//         </Card>
//       </section>

//       {role !== "reporter" && (
//         <section className="grid gap-6 xl:grid-cols-[1.2fr_.9fr_.8fr]">
//           <Card className="rounded-[28px] border-white/10 bg-card/80 shadow-[0_16px_48px_-28px_rgba(15,23,42,.35)]">
//             <CardHeader className="border-b border-border/60 pb-4">
//               <CardTitle className="flex items-center gap-2 text-xl">
//                 <Globe2 className="h-5 w-5 text-primary" /> Active users by
//                 country
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="grid gap-6 p-6 md:grid-cols-[1.2fr_.9fr]">
//               <div className="flex min-h-[260px] items-center justify-center rounded-[24px] border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
//                 World map integration slot\nAdd your preferred map component
//                 here for interactive country view.
//               </div>
//               <HorizontalBars
//                 items={(derivedAnalytics.countries ?? []).map((item) => ({
//                   label: item.country,
//                   value: item.activeUsers,
//                 }))}
//               />
//             </CardContent>
//           </Card>

//           <Card className="rounded-[28px] border-white/10 bg-card/80 shadow-[0_16px_48px_-28px_rgba(15,23,42,.35)]">
//             <CardHeader className="border-b border-border/60 pb-4">
//               <CardTitle className="flex items-center gap-2 text-xl">
//                 <Eye className="h-5 w-5 text-primary" /> Views by page title
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="p-6">
//               <HorizontalBars
//                 items={(derivedAnalytics.pageViews ?? []).map((item) => ({
//                   label: item.title,
//                   value: item.views,
//                 }))}
//               />
//             </CardContent>
//           </Card>

//           <Card className="rounded-[28px] border-white/10 bg-card/80 shadow-[0_16px_48px_-28px_rgba(15,23,42,.35)]">
//             <CardHeader className="border-b border-border/60 pb-4">
//               <CardTitle className="flex items-center gap-2 text-xl">
//                 <TrendingUp className="h-5 w-5 text-primary" /> Sessions by
//                 source
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="p-6">
//               <HorizontalBars items={derivedAnalytics.trafficSources ?? []} />
//             </CardContent>
//           </Card>
//         </section>
//       )}

//       <section
//         className={cn(
//           "grid gap-6",
//           role === "reporter"
//             ? "xl:grid-cols-[1.3fr_.8fr]"
//             : "xl:grid-cols-[1.2fr_.8fr_.9fr]",
//         )}
//       >
//         <Card
//           className={cn(
//             "rounded-[28px] border-white/10 bg-card/80 shadow-[0_16px_48px_-28px_rgba(15,23,42,.35)]",
//             role !== "reporter" && "xl:col-span-1",
//           )}
//         >
//           <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4">
//             <div>
//               <CardTitle className="text-xl">
//                 {role === "reporter" ? "My recent posts" : "Recent posts"}
//               </CardTitle>
//               <p className="mt-1 text-sm text-muted-foreground">
//                 {role === "reporter"
//                   ? "Latest posts created by you."
//                   : "Latest content created across the portal."}
//               </p>
//             </div>
//             <Button asChild variant="outline" className="rounded-full">
//               <Link href="/admin/news">View all</Link>
//             </Button>
//           </CardHeader>
//           <CardContent className="space-y-4 p-6">
//             {recentPosts.length === 0 ? (
//               <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
//                 No recent posts found.
//               </div>
//             ) : (
//               recentPosts.map((post) => (
//                 <motion.div
//                   key={post._id}
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className="group rounded-2xl border border-border/60 bg-background/70 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
//                 >
//                   <div className="flex items-start justify-between gap-4">
//                     <div className="min-w-0 flex-1">
//                       <p className="line-clamp-1 text-sm font-semibold text-foreground group-hover:text-primary">
//                         {post.title}
//                       </p>
//                       <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
//                         <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1">
//                           <Tags className="h-3.5 w-3.5" />
//                           {post.category?.name || "Uncategorized"}
//                         </span>
//                         <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1">
//                           <Clock3 className="h-3.5 w-3.5" />
//                           {formatDistanceToNow(new Date(post.createdAt), {
//                             addSuffix: true,
//                           })}
//                         </span>
//                       </div>
//                     </div>

//                     <Badge
//                       variant={
//                         post.status === "published"
//                           ? "default"
//                           : post.status === "draft"
//                             ? "secondary"
//                             : "destructive"
//                       }
//                       className="rounded-full px-3 py-1 capitalize"
//                     >
//                       {post.status}
//                     </Badge>
//                   </div>
//                 </motion.div>
//               ))
//             )}
//           </CardContent>
//         </Card>

//         {role !== "reporter" && (
//           <Card className="rounded-[28px] border-white/10 bg-card/80 shadow-[0_16px_48px_-28px_rgba(15,23,42,.35)]">
//             <CardHeader className="border-b border-border/60 pb-4">
//               <CardTitle className="text-xl">
//                 Event count by event name
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="p-6">
//               <HorizontalBars
//                 items={(derivedAnalytics.events ?? []).map((item) => ({
//                   label: item.name,
//                   value: item.count,
//                 }))}
//               />
//             </CardContent>
//           </Card>
//         )}

//         <Card className="rounded-[28px] border-white/10 bg-card/80 shadow-[0_16px_48px_-28px_rgba(15,23,42,.35)]">
//           <CardHeader className="border-b border-border/60 pb-4">
//             <CardTitle className="text-xl">
//               {role === "reporter"
//                 ? "Publishing health"
//                 : "New users by acquisition"}
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-5 p-6">
//             {role === "reporter" ? (
//               <>
//                 <div className="rounded-2xl bg-muted/40 p-4">
//                   <p className="text-sm text-muted-foreground">
//                     Published ratio
//                   </p>
//                   <p className="mt-1 text-3xl font-semibold">
//                     {stats?.totalNews
//                       ? Math.round(
//                           ((stats.publishedNews ?? 0) / stats.totalNews) * 100,
//                         )
//                       : 0}
//                     %
//                   </p>
//                 </div>
//                 <HorizontalBars
//                   items={[
//                     { label: "Published", value: stats?.publishedNews ?? 0 },
//                     { label: "Draft", value: stats?.draftNews ?? 0 },
//                     {
//                       label: "Unpublished",
//                       value: stats?.unpublishedNews ?? 0,
//                     },
//                   ]}
//                 />
//               </>
//             ) : (
//               <>
//                 <HorizontalBars
//                   items={derivedAnalytics.newUsersBySource ?? []}
//                 />
//                 <div className="rounded-2xl border bg-muted/20 p-4">
//                   <div className="flex items-start gap-3">
//                     <BadgeCheck className="mt-0.5 h-5 w-5 text-emerald-500" />
//                     <div>
//                       <p className="font-medium">Quick insight</p>
//                       <p className="mt-1 text-sm text-muted-foreground">
//                         Direct traffic is currently the strongest acquisition
//                         source in this dashboard snapshot.
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </>
//             )}
//           </CardContent>
//         </Card>
//       </section>

//       <section className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
//         <Card className="rounded-[28px] border-white/10 bg-gradient-to-br from-primary/[0.08] via-background to-background shadow-[0_16px_48px_-28px_rgba(15,23,42,.35)]">
//           <CardHeader className="border-b border-border/60 pb-4">
//             <CardTitle className="text-xl">Content summary</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-6 p-6">
//             {[
//               {
//                 label: "Published",
//                 value: stats?.publishedNews ?? 0,
//                 total: stats?.totalNews ?? 0,
//                 tone: "bg-emerald-500",
//               },
//               {
//                 label: "Draft",
//                 value: stats?.draftNews ?? 0,
//                 total: stats?.totalNews ?? 0,
//                 tone: "bg-amber-500",
//               },
//               {
//                 label: "Unpublished",
//                 value: stats?.unpublishedNews ?? 0,
//                 total: stats?.totalNews ?? 0,
//                 tone: "bg-rose-500",
//               },
//             ].map((item) => (
//               <div key={item.label} className="space-y-2.5">
//                 <div className="flex items-center justify-between text-sm">
//                   <span className="font-medium">{item.label}</span>
//                   <span className="text-muted-foreground">{item.value}</span>
//                 </div>
//                 <div className="h-2.5 overflow-hidden rounded-full bg-muted">
//                   <motion.div
//                     initial={{ width: 0 }}
//                     animate={{
//                       width: `${item.total ? (item.value / item.total) * 100 : 0}%`,
//                     }}
//                     transition={{ duration: 0.75, ease: "easeOut" }}
//                     className={cn("h-full rounded-full", item.tone)}
//                   />
//                 </div>
//               </div>
//             ))}
//           </CardContent>
//         </Card>

//         <Card className="rounded-[28px] border-white/10 bg-card/80 shadow-[0_16px_48px_-28px_rgba(15,23,42,.35)]">
//           <CardHeader className="border-b border-border/60 pb-4">
//             <CardTitle className="text-xl">Quick actions</CardTitle>
//           </CardHeader>
//           <CardContent className="grid gap-3 p-6 sm:grid-cols-2">
//             {[
//               { href: "/admin/news", label: "Manage News", icon: Newspaper },
//               {
//                 href: "/admin/categories",
//                 label: "Manage Categories",
//                 icon: Tags,
//               },
//               { href: "/admin/users", label: "Manage Users", icon: Users },
//               {
//                 href: "/admin/news/create",
//                 label: "Create Article",
//                 icon: BarChart3,
//               },
//             ].map((action) => (
//               <Link
//                 key={action.label}
//                 href={action.href}
//                 className="group rounded-2xl border border-border/60 bg-background/70 p-4 transition-all hover:border-primary/30 hover:bg-primary/[0.04]"
//               >
//                 <div className="flex items-center justify-between">
//                   <div className="rounded-2xl bg-muted p-3">
//                     <action.icon className="h-5 w-5 text-primary" />
//                   </div>
//                   <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
//                 </div>
//                 <p className="mt-4 font-medium">{action.label}</p>
//               </Link>
//             ))}
//           </CardContent>
//         </Card>
//       </section>
//     </div>
//   );
// }

///////////////////////////////

// "use client";

// import { useEffect, useState } from "react";
// import { formatDistanceToNow } from "date-fns";
// import Link from "next/link";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Newspaper,
//   Users,
//   Tags,
//   TrendingUp,
//   Clock,
//   FileText,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";

// type UserRole = "super_admin" | "admin" | "editor" | "reporter";

// type DashboardStats = {
//   totalNews: number;
//   totalCategories: number;
//   totalUsers: number;
//   publishedNews: number;
//   draftNews: number;
//   unpublishedNews: number;
// };

// type RecentPost = {
//   _id: string;
//   title: string;
//   status: "published" | "draft" | "unpublished";
//   createdAt: string;
//   category?: {
//     _id?: string;
//     name: string;
//     slug: string;
//   } | null;
// };

// export default function DashboardPage() {
//   const [role, setRole] = useState<UserRole | null>(null);
//   const [stats, setStats] = useState<DashboardStats | null>(null);
//   const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     const fetchDashboard = async () => {
//       try {
//         setLoading(true);
//         setMessage("");

//         const res = await fetch("/api/dashboard", {
//           method: "GET",
//           cache: "no-store",
//         });

//         const data = await res.json();

//         if (!res.ok) {
//           setMessage(data.message || "Failed to load dashboard");
//           return;
//         }

//         setRole(data.role);
//         setStats(data.stats);
//         setRecentPosts(data.recentPosts || []);
//       } catch (error) {
//         console.error("Dashboard page error:", error);
//         setMessage("Failed to load dashboard");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboard();
//   }, []);

//   const statCards = (() => {
//     if (!stats || !role) return [];

//     if (role === "reporter") {
//       return [
//         {
//           title: "My Articles",
//           value: stats.totalNews,
//           icon: Newspaper,
//           trend: `${stats.publishedNews} published`,
//           color: "text-blue-500",
//         },
//         {
//           title: "My Drafts",
//           value: stats.draftNews,
//           icon: FileText,
//           trend: `${stats.unpublishedNews} unpublished`,
//           color: "text-amber-500",
//         },
//       ];
//     }

//     return [
//       {
//         title: "Total News",
//         value: stats.totalNews,
//         icon: Newspaper,
//         trend: `${stats.publishedNews} published`,
//         color: "text-blue-500",
//       },
//       {
//         title: "Total Categories",
//         value: stats.totalCategories,
//         icon: Tags,
//         trend: "Active categories",
//         color: "text-purple-500",
//       },
//       {
//         title: "Active Users",
//         value: stats.totalUsers,
//         icon: Users,
//         trend: "Admin accounts",
//         color: "text-green-500",
//       },
//       {
//         title: "Draft Articles",
//         value: stats.draftNews,
//         icon: FileText,
//         trend: `${stats.unpublishedNews} unpublished`,
//         color: "text-amber-500",
//       },
//     ];
//   })();

//   if (loading) {
//     return (
//       <div className="flex min-h-[300px] items-center justify-center">
//         <p className="text-sm text-muted-foreground">Loading dashboard...</p>
//       </div>
//     );
//   }

//   if (message) {
//     return (
//       <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//         {message}
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold tracking-tight">
//           {role === "reporter" ? "My Dashboard" : "Dashboard"}
//         </h1>
//         <p className="text-sm text-muted-foreground">
//           {role === "reporter"
//             ? "Track your own articles, drafts, and publishing activity."
//             : "Overview of your news portal content and activity."}
//         </p>
//       </div>

//       <div
//         className={`grid gap-6 ${
//           role === "reporter"
//             ? "grid-cols-1 md:grid-cols-2"
//             : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
//         }`}
//       >
//         {statCards.map((stat, i) => (
//           <Card key={i} className="border-border/50 shadow-sm">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between space-y-0 pb-2">
//                 <p className="text-sm font-medium text-muted-foreground">
//                   {stat.title}
//                 </p>
//                 <div className={`rounded-md bg-muted p-2 ${stat.color}`}>
//                   <stat.icon className="h-4 w-4" />
//                 </div>
//               </div>

//               <div className="mt-3 flex flex-col">
//                 <span className="text-3xl font-bold tracking-tight">
//                   {stat.value}
//                 </span>
//                 <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
//                   <TrendingUp size={12} className="text-green-500" />
//                   {stat.trend}
//                 </span>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       <div
//         className={`grid gap-6 ${
//           role === "reporter" ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"
//         }`}
//       >
//         <Card
//           className={`border-border/50 shadow-sm ${
//             role === "reporter" ? "" : "lg:col-span-2"
//           }`}
//         >
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <div className="space-y-1">
//               <CardTitle className="text-base font-semibold">
//                 {role === "reporter" ? "My Recent Posts" : "Recent Posts"}
//               </CardTitle>
//               <p className="text-sm text-muted-foreground">
//                 {role === "reporter"
//                   ? "Latest articles created by you."
//                   : "Latest articles created in the portal."}
//               </p>
//             </div>

//             <Button asChild variant="outline" size="sm" className="h-8">
//               <Link href="/admin/news">View All</Link>
//             </Button>
//           </CardHeader>

//           <CardContent>
//             <div className="mt-4 space-y-4">
//               {recentPosts.length === 0 ? (
//                 <p className="text-sm text-muted-foreground">
//                   No recent posts found.
//                 </p>
//               ) : (
//                 recentPosts.map((post) => (
//                   <div
//                     key={post._id}
//                     className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/30"
//                   >
//                     <div className="space-y-1">
//                       <p className="line-clamp-1 text-sm font-medium">
//                         {post.title}
//                       </p>

//                       <div className="flex items-center gap-3 text-xs text-muted-foreground">
//                         <span>{post.category?.name || "Uncategorized"}</span>
//                         <span className="flex items-center gap-1">
//                           <Clock size={12} />
//                           {formatDistanceToNow(new Date(post.createdAt), {
//                             addSuffix: true,
//                           })}
//                         </span>
//                       </div>
//                     </div>

//                     <Badge
//                       variant={
//                         post.status === "published"
//                           ? "default"
//                           : post.status === "draft"
//                             ? "secondary"
//                             : "destructive"
//                       }
//                       className="px-2 py-0.5 text-xs font-normal capitalize"
//                     >
//                       {post.status}
//                     </Badge>
//                   </div>
//                 ))
//               )}
//             </div>
//           </CardContent>
//         </Card>

//         {role !== "reporter" && (
//           <Card className="border-border/50 shadow-sm">
//             <CardHeader>
//               <CardTitle className="text-base font-semibold">
//                 Content Summary
//               </CardTitle>
//               <p className="text-sm text-muted-foreground">
//                 Publishing overview
//               </p>
//             </CardHeader>

//             <CardContent className="mt-2 space-y-6">
//               <div className="space-y-2">
//                 <div className="flex items-center justify-between text-sm">
//                   <span className="font-medium">Published</span>
//                   <span className="text-muted-foreground">
//                     {stats?.publishedNews ?? 0}
//                   </span>
//                 </div>
//                 <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
//                   <div
//                     className="h-full rounded-full bg-green-500"
//                     style={{
//                       width: `${
//                         stats?.totalNews
//                           ? (stats.publishedNews / stats.totalNews) * 100
//                           : 0
//                       }%`,
//                     }}
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <div className="flex items-center justify-between text-sm">
//                   <span className="font-medium">Draft</span>
//                   <span className="text-muted-foreground">
//                     {stats?.draftNews ?? 0}
//                   </span>
//                 </div>
//                 <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
//                   <div
//                     className="h-full rounded-full bg-amber-500"
//                     style={{
//                       width: `${
//                         stats?.totalNews
//                           ? (stats.draftNews / stats.totalNews) * 100
//                           : 0
//                       }%`,
//                     }}
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <div className="flex items-center justify-between text-sm">
//                   <span className="font-medium">Unpublished</span>
//                   <span className="text-muted-foreground">
//                     {stats?.unpublishedNews ?? 0}
//                   </span>
//                 </div>
//                 <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
//                   <div
//                     className="h-full rounded-full bg-red-500"
//                     style={{
//                       width: `${
//                         stats?.totalNews
//                           ? (stats.unpublishedNews / stats.totalNews) * 100
//                           : 0
//                       }%`,
//                     }}
//                   />
//                 </div>
//               </div>

//               <div className="rounded-lg border bg-muted/20 p-4">
//                 <p className="text-sm font-medium">Quick Insight</p>
//                 <p className="mt-1 text-sm text-muted-foreground">
//                   {stats?.publishedNews ?? 0} articles are live on the public
//                   website right now.
//                 </p>
//               </div>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </div>
//   );
// }

//============================================================

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Newspaper,
//   Users,
//   Tags,
//   Eye,
//   ArrowUpRight,
//   TrendingUp,
//   Clock,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";

// const statCards = [
//   {
//     title: "Total News",
//     value: "1,248",
//     icon: Newspaper,
//     trend: "+12% this month",
//     color: "text-blue-500",
//   },
//   {
//     title: "Total Categories",
//     value: "24",
//     icon: Tags,
//     trend: "No change",
//     color: "text-purple-500",
//   },
//   {
//     title: "Today's Visitors",
//     value: "45.2K",
//     icon: Users,
//     trend: "+5.2% vs yesterday",
//     color: "text-green-500",
//   },
//   {
//     title: "Total Pageviews",
//     value: "2.1M",
//     icon: Eye,
//     trend: "+18% this month",
//     color: "text-amber-500",
//   },
// ];

// const recentPosts = [
//   {
//     id: 1,
//     title: "Global Summit Reaches New Climate Agreement",
//     category: "World",
//     views: "12.4K",
//     status: "Published",
//     time: "2 hours ago",
//   },
//   {
//     id: 2,
//     title: "Tech Giant Unveils Revolutionary AI Model",
//     category: "Technology",
//     views: "8.2K",
//     status: "Published",
//     time: "5 hours ago",
//   },
//   {
//     id: 3,
//     title: "Local Team Wins Championship After 20 Years",
//     category: "Sports",
//     views: "45.1K",
//     status: "Published",
//     time: "1 day ago",
//   },
//   {
//     id: 4,
//     title: "Market Stocks Rally Amid Economic Optimism",
//     category: "Business",
//     views: "3.1K",
//     status: "Draft",
//     time: "1 day ago",
//   },
//   {
//     id: 5,
//     title: "New Health Guidelines Issued for Winter Season",
//     category: "Health",
//     views: "15.9K",
//     status: "Published",
//     time: "2 days ago",
//   },
// ];

// export default function Dashboard() {
//   return (
//     <div className="space-y-6">
//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {statCards.map((stat, i) => (
//           <Card key={i} className="border-border/50 shadow-sm">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between space-y-0 pb-2">
//                 <p className="text-sm font-medium text-muted-foreground">
//                   {stat.title}
//                 </p>
//                 <div className={`p-2 bg-muted rounded-md ${stat.color}`}>
//                   <stat.icon className="h-4 w-4" />
//                 </div>
//               </div>
//               <div className="flex flex-col mt-3">
//                 <span className="text-3xl font-bold tracking-tight">
//                   {stat.value}
//                 </span>
//                 <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
//                   {stat.trend.includes("+") ? (
//                     <TrendingUp size={12} className="text-green-500" />
//                   ) : null}
//                   {stat.trend}
//                 </span>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Recent Posts List */}
//         <Card className="lg:col-span-2 border-border/50 shadow-sm">
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <div className="space-y-1">
//               <CardTitle className="text-base font-semibold">
//                 Recent Posts
//               </CardTitle>
//               <p className="text-sm text-muted-foreground">
//                 Latest articles published on the portal.
//               </p>
//             </div>
//             <Button variant="outline" size="sm" className="h-8">
//               View All
//             </Button>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4 mt-4">
//               {recentPosts.map((post) => (
//                 <div
//                   key={post.id}
//                   className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
//                 >
//                   <div className="space-y-1">
//                     <p className="font-medium text-sm line-clamp-1">
//                       {post.title}
//                     </p>
//                     <div className="flex items-center gap-3 text-xs text-muted-foreground">
//                       <span className="flex items-center gap-1">
//                         <Tags size={12} /> {post.category}
//                       </span>
//                       <span className="flex items-center gap-1">
//                         <Clock size={12} /> {post.time}
//                       </span>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-4">
//                     <div className="text-right hidden sm:block">
//                       <p className="text-xs font-medium">{post.views}</p>
//                       <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
//                         Views
//                       </p>
//                     </div>
//                     <Badge
//                       variant={
//                         post.status === "Published" ? "default" : "secondary"
//                       }
//                       className="font-normal text-xs px-2 py-0.5"
//                     >
//                       {post.status}
//                     </Badge>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Visitor Summary */}
//         <Card className="border-border/50 shadow-sm">
//           <CardHeader>
//             <CardTitle className="text-base font-semibold">
//               Visitor Summary
//             </CardTitle>
//             <p className="text-sm text-muted-foreground">
//               Traffic sources this week
//             </p>
//           </CardHeader>
//           <CardContent className="space-y-6 mt-2">
//             <div className="space-y-2">
//               <div className="flex items-center justify-between text-sm">
//                 <span className="font-medium">Direct Traffic</span>
//                 <span className="text-muted-foreground">45%</span>
//               </div>
//               <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
//                 <div className="h-full bg-blue-500 w-[45%] rounded-full"></div>
//               </div>
//             </div>
//             <div className="space-y-2">
//               <div className="flex items-center justify-between text-sm">
//                 <span className="font-medium">Social Media</span>
//                 <span className="text-muted-foreground">30%</span>
//               </div>
//               <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
//                 <div className="h-full bg-purple-500 w-[30%] rounded-full"></div>
//               </div>
//             </div>
//             <div className="space-y-2">
//               <div className="flex items-center justify-between text-sm">
//                 <span className="font-medium">Search Engines</span>
//                 <span className="text-muted-foreground">20%</span>
//               </div>
//               <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
//                 <div className="h-full bg-amber-500 w-[20%] rounded-full"></div>
//               </div>
//             </div>
//             <div className="space-y-2">
//               <div className="flex items-center justify-between text-sm">
//                 <span className="font-medium">Referral</span>
//                 <span className="text-muted-foreground">5%</span>
//               </div>
//               <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
//                 <div className="h-full bg-green-500 w-[5%] rounded-full"></div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
