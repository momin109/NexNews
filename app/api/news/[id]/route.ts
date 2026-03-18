import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getAuthUserFromRequest } from "@/lib/auth-user";
import { slugify } from "@/lib/slugify";
import News from "@/models/News";
import Category from "@/models/Category";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await getAuthUserFromRequest(req);

    if (
      !authUser ||
      !["super_admin", "admin", "editor", "reporter"].includes(authUser.role)
    ) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid news id" },
        { status: 400 },
      );
    }

    await connectDB();

    const news = await News.findById(id)
      .populate("category", "name slug")
      .populate("author", "name email")
      .lean();

    if (!news) {
      return NextResponse.json(
        { success: false, message: "News not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      news,
    });
  } catch (error) {
    console.error("Get single news error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch news" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await getAuthUserFromRequest(req);

    if (
      !authUser ||
      !["super_admin", "admin", "editor", "reporter"].includes(authUser.role)
    ) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await req.json();

    await connectDB();

    const existingNews = await News.findById(id);

    if (!existingNews) {
      return NextResponse.json(
        { success: false, message: "News not found" },
        { status: 404 },
      );
    }

    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) {
      const normalizedTitle = String(body.title).trim();

      if (!normalizedTitle) {
        return NextResponse.json(
          { success: false, message: "Title is required" },
          { status: 400 },
        );
      }

      updateData.title = normalizedTitle;
    }

    if (body.slug !== undefined || body.title !== undefined) {
      const baseSlug =
        body.slug && String(body.slug).trim()
          ? String(body.slug).trim()
          : body.title
            ? String(body.title).trim()
            : existingNews.slug;

      const normalizedSlug = slugify(baseSlug);

      if (!normalizedSlug) {
        return NextResponse.json(
          { success: false, message: "Valid slug could not be generated" },
          { status: 400 },
        );
      }

      const duplicateSlug = await News.findOne({
        slug: normalizedSlug,
        _id: { $ne: id },
      });

      if (duplicateSlug) {
        return NextResponse.json(
          { success: false, message: "News slug already exists" },
          { status: 409 },
        );
      }

      updateData.slug = normalizedSlug;
    }

    if (body.excerpt !== undefined) {
      const normalizedExcerpt = String(body.excerpt).trim();

      if (!normalizedExcerpt) {
        return NextResponse.json(
          { success: false, message: "Excerpt is required" },
          { status: 400 },
        );
      }

      updateData.excerpt = normalizedExcerpt;
    }

    if (body.content !== undefined) {
      const normalizedContent = String(body.content).trim();

      if (!normalizedContent) {
        return NextResponse.json(
          { success: false, message: "Content is required" },
          { status: 400 },
        );
      }

      updateData.content = normalizedContent;
    }

    if (body.category !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(body.category)) {
        return NextResponse.json(
          { success: false, message: "Valid category is required" },
          { status: 400 },
        );
      }

      const categoryDoc = await Category.findById(body.category);

      if (!categoryDoc) {
        return NextResponse.json(
          { success: false, message: "Category not found" },
          { status: 404 },
        );
      }

      updateData.category = body.category;
    }

    if (body.featuredImage !== undefined) {
      updateData.featuredImage = String(body.featuredImage).trim();
    }

    if (body.isBreaking !== undefined) {
      updateData.isBreaking = Boolean(body.isBreaking);
    }

    if (
      body.status !== undefined &&
      ["draft", "published", "unpublished"].includes(body.status)
    ) {
      updateData.status = body.status;

      if (body.status === "published") {
        updateData.publishedAt = existingNews.publishedAt || new Date();
      }

      if (body.status !== "published") {
        updateData.publishedAt = null;
      }
    }

    const updatedNews = await News.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("category", "name slug")
      .populate("author", "name email");

    return NextResponse.json({
      success: true,
      message: "News updated successfully",
      news: updatedNews,
    });
  } catch (error) {
    console.error("Update news error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update news" },
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

    await connectDB();

    const deletedNews = await News.findByIdAndDelete(id);

    if (!deletedNews) {
      return NextResponse.json(
        { success: false, message: "News not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "News deleted successfully",
    });
  } catch (error) {
    console.error("Delete news error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete news" },
      { status: 500 },
    );
  }
}
