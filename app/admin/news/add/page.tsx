"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  isActive: boolean;
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

export default function AddNewsPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
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

      const activeCategories = (data.categories || []).filter(
        (cat: Category) => cat.isActive,
      );

      setCategories(activeCategories);
    } catch (error) {
      console.error("Fetch categories error:", error);
      showMessage("error", "Failed to fetch categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setTitle("");
    setCustomSlug("");
    setExcerpt("");
    setContent("");
    setCategory("");
    setFeaturedImage("");
    setStatus("draft");
    setIsBreaking(false);
  };

  const handleCreateNews = async (e: React.FormEvent) => {
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

      const res = await fetch("/api/news", {
        method: "POST",
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
        showMessage("error", data.message || "Failed to create news");
        return;
      }

      showMessage("success", "News created successfully");
      resetForm();

      setTimeout(() => {
        router.push("/admin/news");
        router.refresh();
      }, 700);
    } catch (error) {
      console.error("Create news error:", error);
      showMessage("error", "Failed to create news");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add News Article</h1>
        <p className="text-sm text-muted-foreground">
          Create a new article for your news portal.
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

      <form onSubmit={handleCreateNews}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="border-border/50 shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle>Article Content</CardTitle>
              <CardDescription>
                Enter the main details of the article.
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
                Set category, image, and publication status.
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
                  {submitting ? "Saving..." : "Create News"}
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

// // import { Link } from "wouter";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   ArrowLeft,
//   Image as ImageIcon,
//   Calendar as CalendarIcon,
//   Save,
//   Globe,
// } from "lucide-react";

// export default function AddNews() {
//   return (
//     <div className="max-w-5xl mx-auto space-y-6 pb-12">
//       <div className="flex items-center gap-4">
//         <Link href="/admin/news">
//           <Button variant="outline" size="icon" className="h-8 w-8">
//             <ArrowLeft className="h-4 w-4" />
//           </Button>
//         </Link>
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight">Add New Article</h1>
//           <p className="text-sm text-muted-foreground">
//             Create and publish a new news story.
//           </p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-2 space-y-6">
//           <Card className="border-border/50 shadow-sm">
//             <CardContent className="p-6 space-y-6">
//               <div className="space-y-2">
//                 <Label htmlFor="title" className="text-base font-semibold">
//                   News Title
//                 </Label>
//                 <Input
//                   id="title"
//                   placeholder="Enter headline here..."
//                   className="text-lg py-6 font-medium"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="slug" className="font-semibold text-sm">
//                   Custom Slug (URL)
//                 </Label>
//                 <div className="flex items-center">
//                   <span className="bg-muted px-3 py-2 border border-r-0 rounded-l-md text-sm text-muted-foreground">
//                     yourdomain.com/news/
//                   </span>
//                   <Input
//                     id="slug"
//                     placeholder="custom-article-slug"
//                     className="rounded-l-none focus-visible:ring-0"
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="short-desc" className="font-semibold">
//                   Short Description (Excerpt)
//                 </Label>
//                 <Textarea
//                   id="short-desc"
//                   placeholder="A brief summary that appears on the homepage and social media..."
//                   className="resize-none h-20"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <div className="flex items-center justify-between">
//                   <Label htmlFor="content" className="font-semibold">
//                     Full Details
//                   </Label>
//                   <div className="flex gap-2">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       className="h-7 text-xs gap-1"
//                     >
//                       <ImageIcon size={12} /> Add Media
//                     </Button>
//                   </div>
//                 </div>
//                 <div className="border rounded-md min-h-[400px] bg-background">
//                   {/* Mock WYSIWYG Toolbar */}
//                   <div className="border-b bg-muted/30 p-2 flex gap-1 items-center flex-wrap">
//                     <select className="h-8 rounded text-sm border bg-background px-2">
//                       <option>Paragraph</option>
//                       <option>Heading 2</option>
//                     </select>
//                     <div className="h-4 w-px bg-border mx-1"></div>
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       className="h-8 w-8 font-bold"
//                     >
//                       B
//                     </Button>
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       className="h-8 w-8 italic"
//                     >
//                       I
//                     </Button>
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       className="h-8 w-8 underline"
//                     >
//                       U
//                     </Button>
//                     <div className="h-4 w-px bg-border mx-1"></div>
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       className="h-8 px-2 text-xs"
//                     >
//                       Link
//                     </Button>
//                   </div>
//                   <Textarea
//                     className="border-0 focus-visible:ring-0 min-h-[350px] resize-y p-4 text-base leading-relaxed"
//                     placeholder="Write the full article content here..."
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         <div className="space-y-6">
//           <Card className="border-border/50 shadow-sm">
//             <CardContent className="p-6 space-y-4">
//               <div className="space-y-2">
//                 <Label className="font-semibold text-sm">
//                   Publish Settings
//                 </Label>
//                 <div className="grid grid-cols-2 gap-2 mt-2">
//                   <Button
//                     variant="outline"
//                     className="w-full gap-2 text-muted-foreground"
//                   >
//                     <Save size={16} /> Draft
//                   </Button>
//                   <Button className="w-full gap-2">
//                     <Globe size={16} /> Publish
//                   </Button>
//                 </div>
//               </div>

//               <hr className="my-4" />

//               <div className="space-y-2">
//                 <Label htmlFor="publish-date" className="font-semibold text-sm">
//                   Publish Date
//                 </Label>
//                 <div className="relative">
//                   <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     id="publish-date"
//                     type="datetime-local"
//                     className="pl-9 text-sm"
//                     defaultValue="2023-10-24T12:00"
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="border-border/50 shadow-sm">
//             <CardContent className="p-6 space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="category" className="font-semibold text-sm">
//                   Category
//                 </Label>
//                 <select
//                   id="category"
//                   className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
//                 >
//                   <option value="" disabled selected>
//                     Select Category
//                   </option>
//                   <option value="world">World News</option>
//                   <option value="national">National</option>
//                   <option value="politics">Politics</option>
//                   <option value="business">Business & Tech</option>
//                   <option value="sports">Sports</option>
//                   <option value="entertainment">Entertainment</option>
//                 </select>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="reporter" className="font-semibold text-sm">
//                   Reporter Name
//                 </Label>
//                 <Input id="reporter" placeholder="e.g. John Doe" />
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="border-border/50 shadow-sm">
//             <CardContent className="p-6 space-y-4">
//               <Label className="font-semibold text-sm">Featured Image</Label>
//               <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer group">
//                 <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
//                   <ImageIcon className="h-6 w-6 text-primary" />
//                 </div>
//                 <p className="text-sm font-medium">Click to upload image</p>
//                 <p className="text-xs text-muted-foreground mt-1">
//                   SVG, PNG, JPG or GIF (max. 800x400px)
//                 </p>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }
