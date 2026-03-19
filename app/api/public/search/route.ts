import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import News from "@/models/News";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const page = Math.max(Number(searchParams.get("page") || 1), 1);
    const limit = Math.min(
      Math.max(Number(searchParams.get("limit") || 10), 1),
      50,
    );

    if (!q) {
      return NextResponse.json({
        success: true,
        query: "",
        results: [],
        total: 0,
        page,
        totalPages: 1,
      });
    }

    await connectDB();

    const query = {
      status: "published",
      $or: [
        { title: { $regex: q, $options: "i" } },
        { excerpt: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
      ],
    };

    const total = await News.countDocuments(query);

    const results = await News.find(query)
      .select(
        "_id title slug excerpt featuredImage publishedAt createdAt category",
      )
      .populate("category", "name slug")
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      query: q,
      results,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    console.error("Public search error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to search news" },
      { status: 500 },
    );
  }
}
