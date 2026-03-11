import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash, Tags } from "lucide-react";

const categories = [
  { id: 1, name: "World News", slug: "world", count: 342 },
  { id: 2, name: "National", slug: "national", count: 521 },
  { id: 3, name: "Politics", slug: "politics", count: 189 },
  { id: 4, name: "Business & Tech", slug: "business-tech", count: 215 },
  { id: 5, name: "Sports", slug: "sports", count: 430 },
  { id: 6, name: "Entertainment", slug: "entertainment", count: 128 },
];

export default function Categories() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Category Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Organize your news into topics and sections.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Category Form */}
        <Card className="border-border/50 shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Add New Category</CardTitle>
            <CardDescription>
              Create a new section for your news portal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Category Name</Label>
              <Input id="cat-name" placeholder="e.g. Health & Fitness" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-slug">Slug</Label>
              <Input
                id="cat-slug"
                placeholder="e.g. health-fitness"
                className="bg-muted/50 font-mono text-sm"
              />
              <p className="text-[10px] text-muted-foreground">
                The "slug" is the URL-friendly version of the name.
              </p>
            </div>
            <Button className="w-full gap-2 mt-2">
              <Plus size={16} /> Add Category
            </Button>
          </CardContent>
        </Card>

        {/* Categories List */}
        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">All Categories</CardTitle>
            <div className="w-64">
              <Input
                placeholder="Search categories..."
                className="h-8 text-sm"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-center">Articles</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Tags size={14} className="text-muted-foreground" />
                      {cat.name}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      /{cat.slug}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center w-8 h-6 rounded-full bg-muted text-xs font-medium">
                        {cat.count}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
