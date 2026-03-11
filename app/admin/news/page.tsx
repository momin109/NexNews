// import { useState } from "wouter";
// import { Link } from "wouter";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const newsData = [
  {
    id: 1,
    title: "Global Summit Reaches New Climate Agreement",
    category: "World",
    author: "Sarah Jenkins",
    date: "Oct 24, 2023",
    status: "Published",
    views: "12.4K",
  },
  {
    id: 2,
    title: "Tech Giant Unveils Revolutionary AI Model",
    category: "Technology",
    author: "David Chen",
    date: "Oct 24, 2023",
    status: "Published",
    views: "8.2K",
  },
  {
    id: 3,
    title: "Local Team Wins Championship After 20 Years",
    category: "Sports",
    author: "Mike Ross",
    date: "Oct 23, 2023",
    status: "Published",
    views: "45.1K",
  },
  {
    id: 4,
    title: "Market Stocks Rally Amid Economic Optimism",
    category: "Business",
    author: "Amanda Cole",
    date: "Oct 23, 2023",
    status: "Draft",
    views: "0",
  },
  {
    id: 5,
    title: "New Health Guidelines Issued for Winter Season",
    category: "Health",
    author: "Dr. Emily Wong",
    date: "Oct 22, 2023",
    status: "Unpublished",
    views: "15.9K",
  },
];

export default function NewsList() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="py-4 px-6 border-b flex flex-row items-center justify-between bg-muted/20">
          <div className="flex items-center gap-4 w-full max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search news articles..."
                className="pl-9 bg-background w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <option value="">All Categories</option>
              <option value="world">World</option>
              <option value="tech">Technology</option>
              <option value="sports">Sports</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
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
              {newsData.map((news) => (
                <TableRow key={news.id}>
                  <TableCell className="font-medium">
                    <p className="line-clamp-2 leading-snug">{news.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye size={12} /> {news.views} views
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="font-normal text-xs bg-muted/50"
                    >
                      {news.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{news.author}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {news.date}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        news.status === "Published"
                          ? "default"
                          : news.status === "Draft"
                            ? "secondary"
                            : "destructive"
                      }
                      className="font-normal text-xs"
                    >
                      {news.status}
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
                        <DropdownMenuItem className="cursor-pointer">
                          <Globe className="mr-2 h-4 w-4" />
                          <span>View live</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Zap className="mr-2 h-4 w-4" />
                          <span>
                            {news.status === "Published"
                              ? "Unpublish"
                              : "Publish"}
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive cursor-pointer focus:text-destructive">
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

          <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground">
            <div>Showing 1-5 of 1,248 articles</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
