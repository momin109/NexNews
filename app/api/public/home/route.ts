import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import News from "@/models/News";
import Category from "@/models/Category";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();

    const featuredNews = await News.findOne({
      status: "published",
    })
      .select(
        "_id title slug excerpt featuredImage publishedAt createdAt isBreaking category",
      )
      .populate("category", "name slug")
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();

    const breakingNews = await News.find({
      status: "published",
      isBreaking: true,
    })
      .select(
        "_id title slug excerpt featuredImage publishedAt createdAt isBreaking category",
      )
      .populate("category", "name slug")
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(5)
      .lean();

    const latestNews = await News.find({
      status: "published",
    })
      .select(
        "_id title slug excerpt featuredImage publishedAt createdAt isBreaking category",
      )
      .populate("category", "name slug")
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(12)
      .lean();

    const activeCategories = await Category.find({
      isActive: true,
    })
      .select("_id name slug")
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    const categorySections = await Promise.all(
      activeCategories.map(async (category) => {
        const news = await News.find({
          status: "published",
          category: category._id,
        })
          .select(
            "_id title slug excerpt featuredImage publishedAt createdAt isBreaking category",
          )
          .populate("category", "name slug")
          .sort({ publishedAt: -1, createdAt: -1 })
          .limit(4)
          .lean();

        return {
          category,
          news,
        };
      }),
    );

    const nonEmptyCategorySections = categorySections.filter(
      (section) => section.news.length > 0,
    );

    return NextResponse.json({
      success: true,
      featuredNews,
      breakingNews,
      latestNews,
      categorySections: nonEmptyCategorySections,
    });
  } catch (error) {
    console.error("Public homepage fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch homepage news" },
      { status: 500 },
    );
  }
}
