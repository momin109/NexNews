import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import News from "@/models/News";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    await connectDB();

    const category = await Category.findOne({
      slug: String(slug).trim().toLowerCase(),
      isActive: true,
    })
      .select("_id name slug description")
      .lean();

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 },
      );
    }

    const news = await News.find({
      category: category._id,
      status: "published",
    })
      .select(
        "_id title slug excerpt featuredImage publishedAt createdAt isBreaking category",
      )
      .populate("category", "name slug")
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      category,
      news,
    });
  } catch (error) {
    console.error("Public category fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch category news" },
      { status: 500 },
    );
  }
}
