import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { getAuthUserFromRequest } from "@/lib/auth-user";
import { slugify } from "@/lib/slugify";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await getAuthUserFromRequest(req);

    if (
      !authUser ||
      !["super_admin", "admin", "editor"].includes(authUser.role)
    ) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { name, slug, description, isActive } = body;

    await connectDB();

    const existingCategory = await Category.findById(id);

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 },
      );
    }

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) {
      const normalizedName = String(name).trim();

      if (!normalizedName) {
        return NextResponse.json(
          { success: false, message: "Category name is required" },
          { status: 400 },
        );
      }

      const duplicateName = await Category.findOne({
        name: { $regex: `^${normalizedName}$`, $options: "i" },
        _id: { $ne: id },
      });

      if (duplicateName) {
        return NextResponse.json(
          { success: false, message: "Category name already exists" },
          { status: 409 },
        );
      }

      updateData.name = normalizedName;
    }

    if (slug !== undefined || name !== undefined) {
      const baseSlug =
        slug !== undefined && String(slug).trim()
          ? String(slug).trim()
          : name !== undefined
            ? String(name).trim()
            : existingCategory.slug;

      const normalizedSlug = slugify(baseSlug);

      if (!normalizedSlug) {
        return NextResponse.json(
          { success: false, message: "Valid slug could not be generated" },
          { status: 400 },
        );
      }

      const duplicateSlug = await Category.findOne({
        slug: normalizedSlug,
        _id: { $ne: id },
      });

      if (duplicateSlug) {
        return NextResponse.json(
          { success: false, message: "Category slug already exists" },
          { status: 409 },
        );
      }

      updateData.slug = normalizedSlug;
    }

    if (description !== undefined) {
      updateData.description = String(description).trim();
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update category" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await getAuthUserFromRequest(req);

    if (!authUser || !["super_admin", "admin"].includes(authUser.role)) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const { id } = await params;

    await connectDB();

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete category" },
      { status: 500 },
    );
  }
}
