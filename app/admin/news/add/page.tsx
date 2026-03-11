// import { Link } from "wouter";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Image as ImageIcon,
  Calendar as CalendarIcon,
  Save,
  Globe,
} from "lucide-react";

export default function AddNews() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/admin/news">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Article</h1>
          <p className="text-sm text-muted-foreground">
            Create and publish a new news story.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">
                  News Title
                </Label>
                <Input
                  id="title"
                  placeholder="Enter headline here..."
                  className="text-lg py-6 font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="font-semibold text-sm">
                  Custom Slug (URL)
                </Label>
                <div className="flex items-center">
                  <span className="bg-muted px-3 py-2 border border-r-0 rounded-l-md text-sm text-muted-foreground">
                    yourdomain.com/news/
                  </span>
                  <Input
                    id="slug"
                    placeholder="custom-article-slug"
                    className="rounded-l-none focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="short-desc" className="font-semibold">
                  Short Description (Excerpt)
                </Label>
                <Textarea
                  id="short-desc"
                  placeholder="A brief summary that appears on the homepage and social media..."
                  className="resize-none h-20"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content" className="font-semibold">
                    Full Details
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                    >
                      <ImageIcon size={12} /> Add Media
                    </Button>
                  </div>
                </div>
                <div className="border rounded-md min-h-[400px] bg-background">
                  {/* Mock WYSIWYG Toolbar */}
                  <div className="border-b bg-muted/30 p-2 flex gap-1 items-center flex-wrap">
                    <select className="h-8 rounded text-sm border bg-background px-2">
                      <option>Paragraph</option>
                      <option>Heading 2</option>
                    </select>
                    <div className="h-4 w-px bg-border mx-1"></div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 font-bold"
                    >
                      B
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 italic"
                    >
                      I
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 underline"
                    >
                      U
                    </Button>
                    <div className="h-4 w-px bg-border mx-1"></div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs"
                    >
                      Link
                    </Button>
                  </div>
                  <Textarea
                    className="border-0 focus-visible:ring-0 min-h-[350px] resize-y p-4 text-base leading-relaxed"
                    placeholder="Write the full article content here..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="font-semibold text-sm">
                  Publish Settings
                </Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    variant="outline"
                    className="w-full gap-2 text-muted-foreground"
                  >
                    <Save size={16} /> Draft
                  </Button>
                  <Button className="w-full gap-2">
                    <Globe size={16} /> Publish
                  </Button>
                </div>
              </div>

              <hr className="my-4" />

              <div className="space-y-2">
                <Label htmlFor="publish-date" className="font-semibold text-sm">
                  Publish Date
                </Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="publish-date"
                    type="datetime-local"
                    className="pl-9 text-sm"
                    defaultValue="2023-10-24T12:00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="font-semibold text-sm">
                  Category
                </Label>
                <select
                  id="category"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="" disabled selected>
                    Select Category
                  </option>
                  <option value="world">World News</option>
                  <option value="national">National</option>
                  <option value="politics">Politics</option>
                  <option value="business">Business & Tech</option>
                  <option value="sports">Sports</option>
                  <option value="entertainment">Entertainment</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reporter" className="font-semibold text-sm">
                  Reporter Name
                </Label>
                <Input id="reporter" placeholder="e.g. John Doe" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <Label className="font-semibold text-sm">Featured Image</Label>
              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer group">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <ImageIcon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">Click to upload image</p>
                <p className="text-xs text-muted-foreground mt-1">
                  SVG, PNG, JPG or GIF (max. 800x400px)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
