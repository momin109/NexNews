"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type MediaItem = {
  _id: string;
  fileName: string;
  originalName: string;
  publicId: string;
  url: string;
  mimeType: string;
  size: number;
  altText?: string;
  createdAt: string;
};

type MediaPickerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  selectedUrl?: string;
};

export default function MediaPicker({
  open,
  onClose,
  onSelect,
  selectedUrl,
}: MediaPickerProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchMedia = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/media", {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json();

      if (res.ok) {
        setMedia(data.media || []);
      }
    } catch (error) {
      console.error("Fetch media error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchMedia();
    }
  }, [open]);

  const filteredMedia = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return media;

    return media.filter((item) => {
      return (
        item.originalName.toLowerCase().includes(q) ||
        item.fileName.toLowerCase().includes(q) ||
        (item.altText || "").toLowerCase().includes(q)
      );
    });
  }, [media, search]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-5xl flex-col rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">Select from Media Library</h2>
            <p className="text-sm text-muted-foreground">
              Choose an uploaded image for the featured image.
            </p>
          </div>

          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="border-b px-5 py-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading media...</p>
          ) : filteredMedia.length === 0 ? (
            <p className="text-sm text-muted-foreground">No media found.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
              {filteredMedia.map((item) => {
                const isSelected = selectedUrl === item.url;

                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => {
                      onSelect(item.url);
                      onClose();
                    }}
                    className={`group relative overflow-hidden rounded-lg border text-left transition ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="relative aspect-square bg-muted">
                      <img
                        src={item.url}
                        alt={item.altText || item.originalName}
                        className="h-full w-full object-cover"
                      />

                      {isSelected && (
                        <div className="absolute right-2 top-2 rounded-full bg-primary p-1 text-white">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>

                    <div className="p-2">
                      <p
                        className="truncate text-xs font-medium"
                        title={item.originalName}
                      >
                        {item.originalName}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end border-t px-5 py-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
