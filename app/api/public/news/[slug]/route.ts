import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import News from "@/models/News";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    await connectDB();

    const news = await News.findOne({
      slug: String(slug).trim().toLowerCase(),
      status: "published",
    })
      .populate("category", "name slug")
      .populate("author", "name email")
      .lean();

    if (!news) {
      return NextResponse.json(
        { success: false, message: "News not found" },
        { status: 404 },
      );
    }

    const relatedNews = await News.find({
      _id: { $ne: news._id },
      category: news.category?._id || news.category,
      status: "published",
    })
      .select("title slug featuredImage publishedAt createdAt category")
      .populate("category", "name slug")
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(4)
      .lean();

    const latestNews = await News.find({
      _id: { $ne: news._id },
      status: "published",
    })
      .select("title slug featuredImage publishedAt createdAt category")
      .populate("category", "name slug")
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(5)
      .lean();

    return NextResponse.json({
      success: true,
      news,
      relatedNews,
      latestNews,
    });
  } catch (error) {
    console.error("Public single news fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch news" },
      { status: 500 },
    );
  }
}
