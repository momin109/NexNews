import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Save, GripVertical, Settings2, LayoutTemplate } from "lucide-react";
// Ensure Trash2 is available for the above component
import { Trash2 } from "lucide-react";

export default function HomepageControl() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Homepage Control
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage layout and content presentation on the main page.
          </p>
        </div>
        <Button className="gap-2">
          <Save size={16} /> Save Changes
        </Button>
      </div>

      <Tabs defaultValue="layout" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mb-6">
          <TabsTrigger value="layout">Layout structure</TabsTrigger>
          <TabsTrigger value="featured">Featured News</TabsTrigger>
          <TabsTrigger value="categories">Category Blocks</TabsTrigger>
        </TabsList>

        <TabsContent value="layout" className="space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <LayoutTemplate size={18} /> Section Ordering
              </CardTitle>
              <CardDescription>
                Drag and drop to rearrange how sections appear on the homepage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-w-2xl">
                {[
                  { id: 1, name: "Breaking News Ticker", active: true },
                  {
                    id: 2,
                    name: "Featured / Lead Story Block (Top)",
                    active: true,
                  },
                  {
                    id: 3,
                    name: "Latest News Grid (Recent Posts)",
                    active: true,
                  },
                  { id: 4, name: "Category Block: Politics", active: true },
                  { id: 5, name: "Video / Multimedia Section", active: false },
                  { id: 6, name: "Category Block: Sports", active: true },
                ].map((section) => (
                  <div
                    key={section.id}
                    className={`flex items-center justify-between p-3 border rounded-lg bg-card ${!section.active && "opacity-60 bg-muted/50"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="cursor-grab text-muted-foreground hover:text-foreground p-1">
                        <GripVertical size={16} />
                      </div>
                      <span className="font-medium text-sm">
                        {section.name}
                      </span>
                    </div>
                    <Switch checked={section.active} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="featured" className="space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Featured News Selection</CardTitle>
              <CardDescription>
                Select which articles appear in the large hero banner.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 max-w-2xl">
                <div className="space-y-2">
                  <Label>Lead Story (Main Banner)</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Search article by title or ID..." />
                    <Button variant="secondary">Select</Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Currently selected: "Global Summit Reaches New Climate
                    Agreement"
                  </p>
                </div>

                <hr className="my-4" />

                <div className="space-y-2">
                  <Label>Sidebar Highlights (Choose up to 4)</Label>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input
                          placeholder={`Highlight ${i} ID or title...`}
                          defaultValue={
                            i === 1
                              ? "Tech Giant Unveils Revolutionary AI Model"
                              : ""
                          }
                        />
                        <Button variant="outline" size="icon">
                          <Trash2 size={14} className="text-destructive" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 border-dashed"
                    >
                      Add Highlight Slot
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Category-wise Display</CardTitle>
              <CardDescription>
                Configure how category blocks are displayed on the homepage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: "World News", style: "Grid (4 items)" },
                  { name: "Politics", style: "List with Thumbs (5 items)" },
                  { name: "Sports", style: "Carousel (6 items)" },
                  { name: "Entertainment", style: "Masonry (3 items)" },
                ].map((cat, i) => (
                  <div
                    key={i}
                    className="border p-4 rounded-lg space-y-4 bg-muted/20"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{cat.name} Block</h4>
                      <Switch defaultChecked />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Display Style
                      </Label>
                      <select className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                        <option>{cat.style}</option>
                        <option>Grid (4 items)</option>
                        <option>List with Thumbs (5 items)</option>
                        <option>Carousel (6 items)</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
