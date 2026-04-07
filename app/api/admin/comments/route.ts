import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUserFromRequest } from "@/lib/auth-user";
import Comment from "@/models/Comment";
import News from "@/models/News";
import "@/models/News";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
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

    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = (searchParams.get("status") || "").trim();
    const search = (searchParams.get("search") || "").trim();
    const limit = Math.min(Number(searchParams.get("limit") || 50), 100);

    const query: Record<string, unknown> = {};

    if (status && ["pending", "approved", "rejected"].includes(status)) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    const [comments, pendingCount, approvedCount, rejectedCount, totalCount] =
      await Promise.all([
        Comment.find(query)
          .populate({
            path: "news",
            select: "title slug",
            model: News,
          })
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean(),
        Comment.countDocuments({ status: "pending" }),
        Comment.countDocuments({ status: "approved" }),
        Comment.countDocuments({ status: "rejected" }),
        Comment.countDocuments({}),
      ]);

    return NextResponse.json({
      success: true,
      comments,
      counts: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        all: totalCount,
      },
    });
  } catch (error) {
    console.error("Admin comments GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch comments" },
      { status: 500 },
    );
  }
}
