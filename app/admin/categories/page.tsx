"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Plus, Edit, Trash, Tags, X } from "lucide-react";

type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );

  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const previewSlug = customSlug.trim() ? slugify(customSlug) : slugify(name);
  const isEditing = Boolean(editingCategoryId);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const resetForm = () => {
    setName("");
    setCustomSlug("");
    setDescription("");
    setIsActive(true);
    setEditingCategoryId(null);
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

      setCategories(data.categories || []);
    } catch (error) {
      console.error("Fetch categories error:", error);
      showMessage("error", "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async () => {
    if (!name.trim()) {
      showMessage("error", "Category name is required");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          slug: customSlug,
          description,
          isActive,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage("error", data.message || "Failed to create category");
        return;
      }

      showMessage("success", "Category created successfully");
      resetForm();
      await fetchCategories();
    } catch (error) {
      console.error("Create category error:", error);
      showMessage("error", "Failed to create category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (category: Category) => {
    setEditingCategoryId(category._id);
    setName(category.name);
    setCustomSlug(category.slug);
    setDescription(category.description || "");
    setIsActive(category.isActive);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategoryId) return;

    if (!name.trim()) {
      showMessage("error", "Category name is required");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch(`/api/categories/${editingCategoryId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          slug: customSlug,
          description,
          isActive,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage("error", data.message || "Failed to update category");
        return;
      }

      showMessage("success", "Category updated successfully");
      resetForm();
      await fetchCategories();
    } catch (error) {
      console.error("Update category error:", error);
      showMessage("error", "Failed to update category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?",
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage("error", data.message || "Failed to delete category");
        return;
      }

      if (editingCategoryId === id) {
        resetForm();
      }

      showMessage("success", "Category deleted successfully");
      await fetchCategories();
    } catch (error) {
      console.error("Delete category error:", error);
      showMessage("error", "Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const q = search.toLowerCase();
      return (
        cat.name.toLowerCase().includes(q) ||
        cat.slug.toLowerCase().includes(q) ||
        (cat.description || "").toLowerCase().includes(q)
      );
    });
  }, [categories, search]);

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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="h-fit border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">
              {isEditing ? "Edit Category" : "Add New Category"}
            </CardTitle>
            <CardDescription>
              {isEditing
                ? "Update the selected category."
                : "Create a new section for your news portal."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Category Name</Label>
              <Input
                id="cat-name"
                placeholder="e.g. Health & Fitness"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-slug">Slug</Label>
              <Input
                id="cat-slug"
                placeholder="e.g. health-fitness"
                className="bg-muted/50 font-mono text-sm"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground">
                Preview: /{previewSlug || "category-slug"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-description">Description</Label>
              <Input
                id="cat-description"
                placeholder="Optional short description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-status">Status</Label>
              <select
                id="cat-status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={isActive ? "active" : "inactive"}
                onChange={(e) => setIsActive(e.target.value === "active")}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                className="w-full gap-2"
                onClick={
                  isEditing ? handleUpdateCategory : handleCreateCategory
                }
                disabled={submitting}
              >
                <Plus size={16} />
                {submitting
                  ? isEditing
                    ? "Updating..."
                    : "Adding..."
                  : isEditing
                    ? "Update Category"
                    : "Add Category"}
              </Button>

              {isEditing && (
                <Button
                  variant="outline"
                  onClick={resetForm}
                  disabled={submitting}
                >
                  <X size={16} />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">
              All Categories ({filteredCategories.length})
            </CardTitle>
            <div className="w-64">
              <Input
                placeholder="Search categories..."
                className="h-8 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 text-sm text-muted-foreground">
                Loading categories...
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">
                No categories found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredCategories.map((cat) => (
                    <TableRow key={cat._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Tags size={14} className="text-muted-foreground" />
                          <div>
                            <div>{cat.name}</div>
                            {cat.description ? (
                              <div className="text-xs text-muted-foreground">
                                {cat.description}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="font-mono text-xs text-muted-foreground">
                        /{cat.slug}
                      </TableCell>

                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            cat.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {cat.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                            onClick={() => handleEditClick(cat)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCategory(cat._id)}
                            disabled={deletingId === cat._id}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Label } from "@/components/ui/label";
// import { Plus, Edit, Trash, Tags } from "lucide-react";

// const categories = [
//   { id: 1, name: "World News", slug: "world", count: 342 },
//   { id: 2, name: "National", slug: "national", count: 521 },
//   { id: 3, name: "Politics", slug: "politics", count: 189 },
//   { id: 4, name: "Business & Tech", slug: "business-tech", count: 215 },
//   { id: 5, name: "Sports", slug: "sports", count: 430 },
//   { id: 6, name: "Entertainment", slug: "entertainment", count: 128 },
// ];

// export default function Categories() {
//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold tracking-tight">
//           Category Management
//         </h1>
//         <p className="text-sm text-muted-foreground">
//           Organize your news into topics and sections.
//         </p>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Add Category Form */}
//         <Card className="border-border/50 shadow-sm h-fit">
//           <CardHeader>
//             <CardTitle className="text-lg">Add New Category</CardTitle>
//             <CardDescription>
//               Create a new section for your news portal.
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="cat-name">Category Name</Label>
//               <Input id="cat-name" placeholder="e.g. Health & Fitness" />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="cat-slug">Slug</Label>
//               <Input
//                 id="cat-slug"
//                 placeholder="e.g. health-fitness"
//                 className="bg-muted/50 font-mono text-sm"
//               />
//               <p className="text-[10px] text-muted-foreground">
//                 The "slug" is the URL-friendly version of the name.
//               </p>
//             </div>
//             <Button className="w-full gap-2 mt-2">
//               <Plus size={16} /> Add Category
//             </Button>
//           </CardContent>
//         </Card>

//         {/* Categories List */}
//         <Card className="lg:col-span-2 border-border/50 shadow-sm">
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-lg">All Categories</CardTitle>
//             <div className="w-64">
//               <Input
//                 placeholder="Search categories..."
//                 className="h-8 text-sm"
//               />
//             </div>
//           </CardHeader>
//           <CardContent className="p-0">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Name</TableHead>
//                   <TableHead>Slug</TableHead>
//                   <TableHead className="text-center">Articles</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {categories.map((cat) => (
//                   <TableRow key={cat.id}>
//                     <TableCell className="font-medium flex items-center gap-2">
//                       <Tags size={14} className="text-muted-foreground" />
//                       {cat.name}
//                     </TableCell>
//                     <TableCell className="font-mono text-xs text-muted-foreground">
//                       /{cat.slug}
//                     </TableCell>
//                     <TableCell className="text-center">
//                       <span className="inline-flex items-center justify-center w-8 h-6 rounded-full bg-muted text-xs font-medium">
//                         {cat.count}
//                       </span>
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <div className="flex items-center justify-end gap-2">
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
//                         >
//                           <Edit className="h-4 w-4" />
//                         </Button>
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
//                         >
//                           <Trash className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
