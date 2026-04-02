"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, UploadCloud, Trash2, Link as LinkIcon } from "lucide-react";

type MediaItem = {
  _id: string;
  fileName: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  altText?: string;
  createdAt: string;
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 2500);
  };

  const fetchMedia = async () => {
    try {
      const res = await fetch("/api/media", {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage("error", data.message || "Failed to fetch media");
        return;
      }

      setMedia(data.media || []);
    } catch (error) {
      console.error("Fetch media error:", error);
      showMessage("error", "Failed to fetch media");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("altText", file.name);

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage("error", data.message || "Failed to upload image");
        return;
      }

      showMessage("success", "Image uploaded successfully");
      await fetchMedia();
    } catch (error) {
      console.error("Upload media error:", error);
      showMessage("error", "Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      showMessage("success", "Image URL copied");
    } catch (error) {
      console.error("Copy URL error:", error);
      showMessage("error", "Failed to copy URL");
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this image?",
    );
    if (!confirmed) return;

    try {
      setDeletingId(id);

      const res = await fetch(`/api/media/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage("error", data.message || "Failed to delete image");
        return;
      }

      showMessage("success", "Image deleted successfully");
      await fetchMedia();
    } catch (error) {
      console.error("Delete media error:", error);
      showMessage("error", "Failed to delete image");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredMedia = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return media;

    return media.filter((item) => {
      return (
        item.fileName.toLowerCase().includes(q) ||
        item.originalName.toLowerCase().includes(q) ||
        (item.altText || "").toLowerCase().includes(q)
      );
    });
  }, [media, search]);

  const totalBytes = useMemo(
    () => media.reduce((sum, item) => sum + item.size, 0),
    [media],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Media Library</h1>
          <p className="text-sm text-muted-foreground">
            Manage all uploaded images and files.
          </p>
        </div>

        <Button
          className="gap-2"
          onClick={handleUploadClick}
          disabled={uploading}
        >
          <UploadCloud size={16} />
          {uploading ? "Uploading..." : "Upload Images"}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
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

      <div className="flex flex-col items-center justify-between gap-4 rounded-lg border border-border/50 bg-card p-4 shadow-sm sm:flex-row">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search media files..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="whitespace-nowrap text-sm text-muted-foreground">
          Storage used:{" "}
          <span className="font-medium text-foreground">
            {formatFileSize(totalBytes)}
          </span>
        </div>
      </div>

      <div
        onClick={handleUploadClick}
        className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 p-8 text-center transition-colors hover:bg-primary/10"
      >
        <div className="mb-4 rounded-full bg-background p-4 shadow-sm transition-transform group-hover:scale-110">
          <UploadCloud className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mb-1 text-lg font-semibold">Click to upload</h3>
        <p className="max-w-md text-sm text-muted-foreground">
          PNG, JPG, or WEBP only. Maximum file size 5MB.
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading media...</div>
      ) : filteredMedia.length === 0 ? (
        <div className="rounded-lg border bg-muted/20 px-6 py-10 text-center">
          <p className="text-sm text-muted-foreground">No media found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          {filteredMedia.map((item) => (
            <Card
              key={item._id}
              className="group relative overflow-hidden border-border/50 shadow-sm"
            >
              <div className="relative aspect-square bg-muted">
                <img
                  src={item.url}
                  alt={item.altText || item.originalName}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />

                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => handleCopyUrl(item.url)}
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => handleDelete(item._id)}
                    disabled={deletingId === item._id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-3">
                <p
                  className="truncate text-xs font-medium"
                  title={item.originalName}
                >
                  {item.originalName}
                </p>

                <div className="mt-1 flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground">
                    {formatFileSize(item.size)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {format(new Date(item.createdAt), "MMM dd, yyyy")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   Search,
//   UploadCloud,
//   Trash2,
//   Link as LinkIcon,
//   Image as ImageIcon,
// } from "lucide-react";

// // Placeholder generated images
// const mediaLibrary = Array.from({ length: 12 }).map((_, i) => ({
//   id: i,
//   name: `image_post_${i + 1}.jpg`,
//   url: `https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=500&h=400&fit=crop&q=80&sig=${i}`,
//   size: "1.2 MB",
//   date: "Oct 24, 2023",
// }));

// export default function Media() {
//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight">Media Library</h1>
//           <p className="text-sm text-muted-foreground">
//             Manage all uploaded images and files.
//           </p>
//         </div>
//         <Button className="gap-2">
//           <UploadCloud size={16} /> Upload Images
//         </Button>
//       </div>

//       <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border border-border/50 shadow-sm">
//         <div className="relative w-full sm:max-w-md">
//           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//           <Input placeholder="Search media files..." className="pl-9" />
//         </div>
//         <div className="text-sm text-muted-foreground whitespace-nowrap">
//           Storage used:{" "}
//           <span className="font-medium text-foreground">4.2 GB</span> of 10 GB
//         </div>
//       </div>

//       {/* Drag & Drop Area */}
//       <div className="border-2 border-dashed border-primary/20 bg-primary/5 rounded-xl p-8 text-center flex flex-col items-center justify-center hover:bg-primary/10 transition-colors cursor-pointer group">
//         <div className="p-4 bg-background rounded-full mb-4 group-hover:scale-110 transition-transform shadow-sm">
//           <UploadCloud className="h-8 w-8 text-primary" />
//         </div>
//         <h3 className="text-lg font-semibold mb-1">
//           Click to upload or drag and drop
//         </h3>
//         <p className="text-sm text-muted-foreground max-w-md">
//           SVG, PNG, JPG or GIF (max. 5MB). Images will be automatically
//           optimized for web.
//         </p>
//       </div>

//       {/* Grid */}
//       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
//         {mediaLibrary.map((item) => (
//           <Card
//             key={item.id}
//             className="overflow-hidden group relative border-border/50 shadow-sm"
//           >
//             <div className="aspect-square bg-muted relative">
//               <img
//                 src={item.url}
//                 alt={item.name}
//                 className="w-full h-full object-cover"
//                 loading="lazy"
//               />
//               <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
//                 <Button
//                   variant="secondary"
//                   size="icon"
//                   className="h-8 w-8 rounded-full"
//                 >
//                   <LinkIcon className="h-4 w-4" />
//                 </Button>
//                 <Button
//                   variant="destructive"
//                   size="icon"
//                   className="h-8 w-8 rounded-full"
//                 >
//                   <Trash2 className="h-4 w-4" />
//                 </Button>
//               </div>
//             </div>
//             <CardContent className="p-3">
//               <p className="text-xs font-medium truncate" title={item.name}>
//                 {item.name}
//               </p>
//               <div className="flex justify-between items-center mt-1">
//                 <p className="text-[10px] text-muted-foreground">{item.size}</p>
//                 <p className="text-[10px] text-muted-foreground">{item.date}</p>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// }
