"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Newspaper,
  Users,
  Tags,
  TrendingUp,
  Clock,
  FileText,
} from "lucide-react";
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

        const data = await res.json();

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

  const statCards = (() => {
    if (!stats || !role) return [];

    if (role === "reporter") {
      return [
        {
          title: "My Articles",
          value: stats.totalNews,
          icon: Newspaper,
          trend: `${stats.publishedNews} published`,
          color: "text-blue-500",
        },
        {
          title: "My Drafts",
          value: stats.draftNews,
          icon: FileText,
          trend: `${stats.unpublishedNews} unpublished`,
          color: "text-amber-500",
        },
      ];
    }

    return [
      {
        title: "Total News",
        value: stats.totalNews,
        icon: Newspaper,
        trend: `${stats.publishedNews} published`,
        color: "text-blue-500",
      },
      {
        title: "Total Categories",
        value: stats.totalCategories,
        icon: Tags,
        trend: "Active categories",
        color: "text-purple-500",
      },
      {
        title: "Active Users",
        value: stats.totalUsers,
        icon: Users,
        trend: "Admin accounts",
        color: "text-green-500",
      },
      {
        title: "Draft Articles",
        value: stats.draftNews,
        icon: FileText,
        trend: `${stats.unpublishedNews} unpublished`,
        color: "text-amber-500",
      },
    ];
  })();

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (message) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {role === "reporter" ? "My Dashboard" : "Dashboard"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {role === "reporter"
            ? "Track your own articles, drafts, and publishing activity."
            : "Overview of your news portal content and activity."}
        </p>
      </div>

      <div
        className={`grid gap-6 ${
          role === "reporter"
            ? "grid-cols-1 md:grid-cols-2"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        }`}
      >
        {statCards.map((stat, i) => (
          <Card key={i} className="border-border/50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <div className={`rounded-md bg-muted p-2 ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-3 flex flex-col">
                <span className="text-3xl font-bold tracking-tight">
                  {stat.value}
                </span>
                <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp size={12} className="text-green-500" />
                  {stat.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div
        className={`grid gap-6 ${
          role === "reporter" ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"
        }`}
      >
        <Card
          className={`border-border/50 shadow-sm ${
            role === "reporter" ? "" : "lg:col-span-2"
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold">
                {role === "reporter" ? "My Recent Posts" : "Recent Posts"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {role === "reporter"
                  ? "Latest articles created by you."
                  : "Latest articles created in the portal."}
              </p>
            </div>

            <Button asChild variant="outline" size="sm" className="h-8">
              <Link href="/admin/news">View All</Link>
            </Button>
          </CardHeader>

          <CardContent>
            <div className="mt-4 space-y-4">
              {recentPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No recent posts found.
                </p>
              ) : (
                recentPosts.map((post) => (
                  <div
                    key={post._id}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/30"
                  >
                    <div className="space-y-1">
                      <p className="line-clamp-1 text-sm font-medium">
                        {post.title}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{post.category?.name || "Uncategorized"}</span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
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
                      className="px-2 py-0.5 text-xs font-normal capitalize"
                    >
                      {post.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {role !== "reporter" && (
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Content Summary
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Publishing overview
              </p>
            </CardHeader>

            <CardContent className="mt-2 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Published</span>
                  <span className="text-muted-foreground">
                    {stats?.publishedNews ?? 0}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{
                      width: `${
                        stats?.totalNews
                          ? (stats.publishedNews / stats.totalNews) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Draft</span>
                  <span className="text-muted-foreground">
                    {stats?.draftNews ?? 0}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{
                      width: `${
                        stats?.totalNews
                          ? (stats.draftNews / stats.totalNews) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Unpublished</span>
                  <span className="text-muted-foreground">
                    {stats?.unpublishedNews ?? 0}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-red-500"
                    style={{
                      width: `${
                        stats?.totalNews
                          ? (stats.unpublishedNews / stats.totalNews) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="rounded-lg border bg-muted/20 p-4">
                <p className="text-sm font-medium">Quick Insight</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stats?.publishedNews ?? 0} articles are live on the public
                  website right now.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

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
