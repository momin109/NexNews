import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getAuthUserFromRequest } from "@/lib/auth-user";
import { slugify } from "@/lib/slugify";
import News from "@/models/News";
import Category from "@/models/Category";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const query: Record<string, unknown> = {};

    if (status && ["draft", "published", "unpublished"].includes(status)) {
      query.status = status;
    }

    if (category && mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    }

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { excerpt: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const news = await News.find(query)
      .populate("category", "name slug")
      .populate("author", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      news,
    });
  } catch (error) {
    console.error("Get news error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch news" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();

    const {
      title,
      slug,
      excerpt,
      content,
      category,
      featuredImage,
      status,
      isBreaking,
    } = body;

    if (!title || !String(title).trim()) {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 },
      );
    }

    if (!excerpt || !String(excerpt).trim()) {
      return NextResponse.json(
        { success: false, message: "Excerpt is required" },
        { status: 400 },
      );
    }

    if (!content || !String(content).trim()) {
      return NextResponse.json(
        { success: false, message: "Content is required" },
        { status: 400 },
      );
    }

    if (!category || !mongoose.Types.ObjectId.isValid(category)) {
      return NextResponse.json(
        { success: false, message: "Valid category is required" },
        { status: 400 },
      );
    }

    const normalizedTitle = String(title).trim();
    const normalizedSlug =
      slug && String(slug).trim()
        ? slugify(String(slug))
        : slugify(normalizedTitle);

    if (!normalizedSlug) {
      return NextResponse.json(
        { success: false, message: "Valid slug could not be generated" },
        { status: 400 },
      );
    }

    const normalizedStatus =
      status && ["draft", "published", "unpublished"].includes(status)
        ? status
        : "draft";

    await connectDB();

    const categoryDoc = await Category.findById(category);

    if (!categoryDoc) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 },
      );
    }

    if (!categoryDoc.isActive) {
      return NextResponse.json(
        { success: false, message: "Selected category is inactive" },
        { status: 400 },
      );
    }

    const existingSlug = await News.findOne({ slug: normalizedSlug });

    if (existingSlug) {
      return NextResponse.json(
        { success: false, message: "News slug already exists" },
        { status: 409 },
      );
    }

    const news = await News.create({
      title: normalizedTitle,
      slug: normalizedSlug,
      excerpt: String(excerpt).trim(),
      content: String(content).trim(),
      category,
      featuredImage: featuredImage ? String(featuredImage).trim() : "",
      author: authUser.userId,
      status: normalizedStatus,
      isBreaking: Boolean(isBreaking),
      publishedAt: normalizedStatus === "published" ? new Date() : null,
    });

    const populatedNews = await News.findById(news._id)
      .populate("category", "name slug")
      .populate("author", "name email")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "News created successfully",
        news: populatedNews,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create news error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create news" },
      { status: 500 },
    );
  }
}
