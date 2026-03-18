import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUserFromRequest } from "@/lib/auth-user";
import Media from "@/models/Media";

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

    const media = await Media.find({})
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      media,
    });
  } catch (error) {
    console.error("Get media error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch media" },
      { status: 500 },
    );
  }
}
