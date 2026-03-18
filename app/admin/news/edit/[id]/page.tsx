"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type Category = {
  _id: string;
  name: string;
  slug: string;
  isActive?: boolean;
};

type NewsItem = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: Category | string | null;
  featuredImage?: string;
  status: "draft" | "published" | "unpublished";
  isBreaking: boolean;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function EditNewsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "unpublished">(
    "draft",
  );
  const [isBreaking, setIsBreaking] = useState(false);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const previewSlug = useMemo(() => {
    return customSlug.trim() ? slugify(customSlug) : slugify(title);
  }, [customSlug, title]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories", {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage("error", data.message || "Failed to fetch categories");
        return;
      }

      setCategories(
        (data.categories || []).filter((cat: Category) => cat.isActive),
      );
    } catch (error) {
      console.error("Fetch categories error:", error);
      showMessage("error", "Failed to fetch categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchNews = async () => {
    try {
      const res = await fetch(`/api/news/${id}`, {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage("error", data.message || "Failed to fetch article");
        return;
      }

      const item: NewsItem = data.news;

      setTitle(item.title || "");
      setCustomSlug(item.slug || "");
      setExcerpt(item.excerpt || "");
      setContent(item.content || "");
      setCategory(
        typeof item.category === "object" && item.category?._id
          ? item.category._id
          : typeof item.category === "string"
            ? item.category
            : "",
      );
      setFeaturedImage(item.featuredImage || "");
      setStatus(item.status || "draft");
      setIsBreaking(Boolean(item.isBreaking));
    } catch (error) {
      console.error("Fetch single news error:", error);
      showMessage("error", "Failed to fetch article");
    } finally {
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchCategories();
    fetchNews();
  }, [id]);

  const handleUpdateNews = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showMessage("error", "Title is required");
      return;
    }

    if (!excerpt.trim()) {
      showMessage("error", "Excerpt is required");
      return;
    }

    if (!content.trim()) {
      showMessage("error", "Content is required");
      return;
    }

    if (!category) {
      showMessage("error", "Category is required");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch(`/api/news/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          slug: customSlug,
          excerpt,
          content,
          category,
          featuredImage,
          status,
          isBreaking,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage("error", data.message || "Failed to update article");
        return;
      }

      showMessage("success", "Article updated successfully");

      setTimeout(() => {
        router.push("/admin/news");
        router.refresh();
      }, 700);
    } catch (error) {
      console.error("Update news error:", error);
      showMessage("error", "Failed to update article");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Loading article...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit News Article</h1>
        <p className="text-sm text-muted-foreground">
          Update article content and publishing options.
        </p>
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

      <form onSubmit={handleUpdateNews}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="border-border/50 shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle>Article Content</CardTitle>
              <CardDescription>
                Update the main details of the article.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter article title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="Auto-generated from title"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-[11px] text-muted-foreground">
                  Preview: /news/{previewSlug || "article-slug"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <textarea
                  id="excerpt"
                  rows={4}
                  placeholder="Write a short summary..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <textarea
                  id="content"
                  rows={12}
                  placeholder="Write full article content..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="flex min-h-[260px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="h-fit border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Publishing Options</CardTitle>
              <CardDescription>
                Update category, image, and publication status.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={loadingCategories}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">
                    {loadingCategories
                      ? "Loading categories..."
                      : "Select category"}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="featured-image">Featured Image URL</Label>
                <Input
                  id="featured-image"
                  placeholder="https://example.com/image.jpg"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) =>
                    setStatus(
                      e.target.value as "draft" | "published" | "unpublished",
                    )
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="unpublished">Unpublished</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="breaking"
                  type="checkbox"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="breaking" className="cursor-pointer">
                  Mark as breaking news
                </Label>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Update News"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/news")}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
