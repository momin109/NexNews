import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Save, Search, Globe, Image as ImageIcon } from "lucide-react";

export default function SEO() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Basic SEO Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Optimize your site for search engines.
          </p>
        </div>
        <Button className="gap-2">
          <Save size={16} /> Save SEO Settings
        </Button>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe size={18} /> Global Meta Tags
          </CardTitle>
          <CardDescription>
            Default meta information for the homepage and when page-specific
            tags are missing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="meta-title">Meta Title</Label>
              <span className="text-xs text-muted-foreground">
                60 chars max
              </span>
            </div>
            <Input
              id="meta-title"
              defaultValue="Daily Post - Latest Breaking News & Updates"
            />
            <p className="text-xs text-muted-foreground">
              Appears in browser tabs and search engine results.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="meta-desc">Meta Description</Label>
              <span className="text-xs text-muted-foreground">
                160 chars max
              </span>
            </div>
            <Textarea
              id="meta-desc"
              className="resize-none h-24"
              defaultValue="Get the latest breaking news, politics, sports, entertainment, and business updates from around the world. Stay informed with Daily Post."
            />
            <p className="text-xs text-muted-foreground">
              A brief summary of your website. Crucial for click-through rates
              from search engines.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta-keywords">Meta Keywords</Label>
            <Input
              id="meta-keywords"
              defaultValue="news, breaking news, politics, sports, world news, business updates"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of relevant keywords.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ImageIcon size={18} /> Social Sharing (Open Graph)
          </CardTitle>
          <CardDescription>
            How your site appears when shared on Facebook, Twitter, etc.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Default Social Share Image</Label>
            <div className="flex items-start gap-4">
              <div className="w-40 h-24 bg-muted rounded-md border flex items-center justify-center overflow-hidden">
                {/* Placeholder graphic */}
                <div className="text-muted-foreground/50 font-semibold text-xl tracking-widest">
                  DAILY POST
                </div>
              </div>
              <div className="space-y-2 flex-1">
                <Button variant="outline" size="sm">
                  Change Image
                </Button>
                <p className="text-xs text-muted-foreground">
                  Recommended size: 1200x630px. Used when an article doesn't
                  have a featured image.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO Preview Widget */}
      <Card className="border-border/50 shadow-sm bg-muted/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Search size={14} /> Search Engine Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-background p-4 rounded-lg border shadow-sm max-w-2xl">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px]">
                Logo
              </div>
              <div className="leading-tight">
                <div className="text-sm font-medium">Daily Post</div>
                <div className="text-xs text-muted-foreground">
                  https://dailypost.example.com
                </div>
              </div>
            </div>
            <h3 className="text-blue-600 dark:text-blue-400 text-xl font-medium hover:underline cursor-pointer leading-tight mb-1">
              Daily Post - Latest Breaking News & Updates
            </h3>
            <p className="text-sm text-foreground/80 line-clamp-2">
              Get the latest breaking news, politics, sports, entertainment, and
              business updates from around the world. Stay informed with Daily
              Post.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
