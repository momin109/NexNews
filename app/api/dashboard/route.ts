import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUserFromRequest } from "@/lib/auth-user";
import News from "@/models/News";
import Category from "@/models/Category";
import User from "@/models/User";
import "@/models/Category";
import "@/models/User";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
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

    await connectDB();

    const isReporter = authUser.role === "reporter";

    const newsBaseQuery = isReporter ? { author: authUser.userId } : {};

    const [
      totalNews,
      totalCategories,
      totalUsers,
      publishedNews,
      draftNews,
      unpublishedNews,
      recentPosts,
    ] = await Promise.all([
      News.countDocuments(newsBaseQuery),
      isReporter
        ? Promise.resolve(0)
        : Category.countDocuments({ isActive: true }),
      isReporter ? Promise.resolve(0) : User.countDocuments({ isActive: true }),
      News.countDocuments({ ...newsBaseQuery, status: "published" }),
      News.countDocuments({ ...newsBaseQuery, status: "draft" }),
      News.countDocuments({ ...newsBaseQuery, status: "unpublished" }),
      News.find(newsBaseQuery)
        .select("_id title status createdAt category author")
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      role: authUser.role,
      stats: {
        totalNews,
        totalCategories,
        totalUsers,
        publishedNews,
        draftNews,
        unpublishedNews,
      },
      recentPosts,
    });
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}
