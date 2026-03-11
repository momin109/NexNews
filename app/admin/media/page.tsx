import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  UploadCloud,
  Trash2,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";

// Placeholder generated images
const mediaLibrary = Array.from({ length: 12 }).map((_, i) => ({
  id: i,
  name: `image_post_${i + 1}.jpg`,
  url: `https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=500&h=400&fit=crop&q=80&sig=${i}`,
  size: "1.2 MB",
  date: "Oct 24, 2023",
}));

export default function Media() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Media Library</h1>
          <p className="text-sm text-muted-foreground">
            Manage all uploaded images and files.
          </p>
        </div>
        <Button className="gap-2">
          <UploadCloud size={16} /> Upload Images
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border border-border/50 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search media files..." className="pl-9" />
        </div>
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          Storage used:{" "}
          <span className="font-medium text-foreground">4.2 GB</span> of 10 GB
        </div>
      </div>

      {/* Drag & Drop Area */}
      <div className="border-2 border-dashed border-primary/20 bg-primary/5 rounded-xl p-8 text-center flex flex-col items-center justify-center hover:bg-primary/10 transition-colors cursor-pointer group">
        <div className="p-4 bg-background rounded-full mb-4 group-hover:scale-110 transition-transform shadow-sm">
          <UploadCloud className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-1">
          Click to upload or drag and drop
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          SVG, PNG, JPG or GIF (max. 5MB). Images will be automatically
          optimized for web.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {mediaLibrary.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden group relative border-border/50 shadow-sm"
          >
            <div className="aspect-square bg-muted relative">
              <img
                src={item.url}
                alt={item.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-3">
              <p className="text-xs font-medium truncate" title={item.name}>
                {item.name}
              </p>
              <div className="flex justify-between items-center mt-1">
                <p className="text-[10px] text-muted-foreground">{item.size}</p>
                <p className="text-[10px] text-muted-foreground">{item.date}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
