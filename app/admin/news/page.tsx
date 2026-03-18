"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash,
  Eye,
  Globe,
  Zap,
} from "lucide-react";

type Category = {
  _id: string;
  name: string;
  slug: string;
};

type Author = {
  _id: string;
  name: string;
  email: string;
};

type NewsItem = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: Category | null;
  author: Author | null;
  featuredImage?: string;
  status: "draft" | "published" | "unpublished";
  isBreaking: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function NewsListPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const fetchNews = async () => {
    try {
      const params = new URLSearchParams();

      if (search.trim()) params.set("search", search.trim());
      if (categoryFilter) params.set("category", categoryFilter);

      const url = params.toString()
        ? `/api/news?${params.toString()}`
        : "/api/news";

      const res = await fetch(url, {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage("error", data.message || "Failed to fetch news");
        return;
      }

      setNews(data.news || []);
    } catch (error) {
      console.error("Fetch news error:", error);
      showMessage("error", "Failed to fetch news");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories", {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json();

      if (res.ok) {
        setCategories((data.categories || []).filter((c: any) => c.isActive));
      }
    } catch (error) {
      console.error("Fetch categories error:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNews();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, categoryFilter]);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this article?",
    );
    if (!confirmed) return;

    try {
      setActionLoadingId(id);

      const res = await fetch(`/api/news/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage("error", data.message || "Failed to delete article");
        return;
      }

      showMessage("success", "Article deleted successfully");
      await fetchNews();
    } catch (error) {
      console.error("Delete news error:", error);
      showMessage("error", "Failed to delete article");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleTogglePublish = async (item: NewsItem) => {
    try {
      setActionLoadingId(item._id);

      const nextStatus =
        item.status === "published" ? "unpublished" : "published";

      const res = await fetch(`/api/news/${item._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage("error", data.message || "Failed to update article");
        return;
      }

      showMessage(
        "success",
        nextStatus === "published"
          ? "Article published successfully"
          : "Article unpublished successfully",
      );

      await fetchNews();
    } catch (error) {
      console.error("Toggle publish error:", error);
      showMessage("error", "Failed to update article");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredCount = useMemo(() => news.length, [news]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">News Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage, edit, and publish news articles.
          </p>
        </div>

        <Link href="/admin/news/add">
          <Button className="gap-2">
            <Plus size={16} /> Add New Article
          </Button>
        </Link>
      </div>

      {message && (
        <div
          className={`rounded-md border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 px-6 py-4">
          <div className="flex w-full max-w-md items-center gap-4">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search news articles..."
                className="w-full bg-background pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-sm text-muted-foreground">
              Loading articles...
            </div>
          ) : news.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              No articles found.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Article</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {news.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">
                        <p className="line-clamp-2 leading-snug">
                          {item.title}
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye size={12} /> 0 views
                          </span>
                          {item.isBreaking && (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
                              Breaking
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-muted/50 text-xs font-normal"
                        >
                          {item.category?.name || "Uncategorized"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-sm">
                        {item.author?.name || "Unknown"}
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {format(
                          new Date(item.publishedAt || item.createdAt),
                          "MMM dd, yyyy",
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            item.status === "published"
                              ? "default"
                              : item.status === "draft"
                                ? "secondary"
                                : "destructive"
                          }
                          className="text-xs font-normal capitalize"
                        >
                          {item.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              asChild
                              className="cursor-pointer"
                            >
                              <Link href={`/news/${item.slug}`}>
                                <Globe className="mr-2 h-4 w-4" />
                                <span>View live</span>
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              asChild
                              className="cursor-pointer"
                            >
                              <Link href={`/admin/news/edit/${item._id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => handleTogglePublish(item)}
                              disabled={actionLoadingId === item._id}
                            >
                              <Zap className="mr-2 h-4 w-4" />
                              <span>
                                {item.status === "published"
                                  ? "Unpublish"
                                  : "Publish"}
                              </span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="cursor-pointer text-destructive focus:text-destructive"
                              onClick={() => handleDelete(item._id)}
                              disabled={actionLoadingId === item._id}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between border-t p-4 text-sm text-muted-foreground">
                <div>Showing {filteredCount} articles</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// // import { useState } from "wouter";
// // import { Link } from "wouter";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   Plus,
//   Search,
//   MoreHorizontal,
//   Edit,
//   Trash,
//   Eye,
//   Globe,
//   Zap,
// } from "lucide-react";

// const newsData = [
//   {
//     id: 1,
//     title: "Global Summit Reaches New Climate Agreement",
//     category: "World",
//     author: "Sarah Jenkins",
//     date: "Oct 24, 2023",
//     status: "Published",
//     views: "12.4K",
//   },
//   {
//     id: 2,
//     title: "Tech Giant Unveils Revolutionary AI Model",
//     category: "Technology",
//     author: "David Chen",
//     date: "Oct 24, 2023",
//     status: "Published",
//     views: "8.2K",
//   },
//   {
//     id: 3,
//     title: "Local Team Wins Championship After 20 Years",
//     category: "Sports",
//     author: "Mike Ross",
//     date: "Oct 23, 2023",
//     status: "Published",
//     views: "45.1K",
//   },
//   {
//     id: 4,
//     title: "Market Stocks Rally Amid Economic Optimism",
//     category: "Business",
//     author: "Amanda Cole",
//     date: "Oct 23, 2023",
//     status: "Draft",
//     views: "0",
//   },
//   {
//     id: 5,
//     title: "New Health Guidelines Issued for Winter Season",
//     category: "Health",
//     author: "Dr. Emily Wong",
//     date: "Oct 22, 2023",
//     status: "Unpublished",
//     views: "15.9K",
//   },
// ];

// export default function NewsList() {
//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight">News Management</h1>
//           <p className="text-sm text-muted-foreground">
//             Manage, edit, and publish news articles.
//           </p>
//         </div>
//         <Link href="/admin/news/add">
//           <Button className="gap-2">
//             <Plus size={16} /> Add New Article
//           </Button>
//         </Link>
//       </div>

//       <Card className="border-border/50 shadow-sm">
//         <CardHeader className="py-4 px-6 border-b flex flex-row items-center justify-between bg-muted/20">
//           <div className="flex items-center gap-4 w-full max-w-md">
//             <div className="relative w-full">
//               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search news articles..."
//                 className="pl-9 bg-background w-full"
//               />
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
//               <option value="">All Categories</option>
//               <option value="world">World</option>
//               <option value="tech">Technology</option>
//               <option value="sports">Sports</option>
//             </select>
//           </div>
//         </CardHeader>
//         <CardContent className="p-0">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="w-[40%]">Article</TableHead>
//                 <TableHead>Category</TableHead>
//                 <TableHead>Reporter</TableHead>
//                 <TableHead>Date</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead className="text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {newsData.map((news) => (
//                 <TableRow key={news.id}>
//                   <TableCell className="font-medium">
//                     <p className="line-clamp-2 leading-snug">{news.title}</p>
//                     <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
//                       <span className="flex items-center gap-1">
//                         <Eye size={12} /> {news.views} views
//                       </span>
//                     </div>
//                   </TableCell>
//                   <TableCell>
//                     <Badge
//                       variant="outline"
//                       className="font-normal text-xs bg-muted/50"
//                     >
//                       {news.category}
//                     </Badge>
//                   </TableCell>
//                   <TableCell className="text-sm">{news.author}</TableCell>
//                   <TableCell className="text-sm text-muted-foreground">
//                     {news.date}
//                   </TableCell>
//                   <TableCell>
//                     <Badge
//                       variant={
//                         news.status === "Published"
//                           ? "default"
//                           : news.status === "Draft"
//                             ? "secondary"
//                             : "destructive"
//                       }
//                       className="font-normal text-xs"
//                     >
//                       {news.status}
//                     </Badge>
//                   </TableCell>
//                   <TableCell className="text-right">
//                     <DropdownMenu>
//                       <DropdownMenuTrigger asChild>
//                         <Button variant="ghost" className="h-8 w-8 p-0">
//                           <span className="sr-only">Open menu</span>
//                           <MoreHorizontal className="h-4 w-4" />
//                         </Button>
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent align="end">
//                         <DropdownMenuItem className="cursor-pointer">
//                           <Globe className="mr-2 h-4 w-4" />
//                           <span>View live</span>
//                         </DropdownMenuItem>
//                         <DropdownMenuItem className="cursor-pointer">
//                           <Edit className="mr-2 h-4 w-4" />
//                           <span>Edit</span>
//                         </DropdownMenuItem>
//                         <DropdownMenuItem className="cursor-pointer">
//                           <Zap className="mr-2 h-4 w-4" />
//                           <span>
//                             {news.status === "Published"
//                               ? "Unpublish"
//                               : "Publish"}
//                           </span>
//                         </DropdownMenuItem>
//                         <DropdownMenuItem className="text-destructive cursor-pointer focus:text-destructive">
//                           <Trash className="mr-2 h-4 w-4" />
//                           <span>Delete</span>
//                         </DropdownMenuItem>
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>

//           <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground">
//             <div>Showing 1-5 of 1,248 articles</div>
//             <div className="flex items-center gap-2">
//               <Button variant="outline" size="sm" disabled>
//                 Previous
//               </Button>
//               <Button variant="outline" size="sm">
//                 Next
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
