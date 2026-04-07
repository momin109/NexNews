import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getAuthUserFromRequest } from "@/lib/auth-user";
import Comment from "@/models/Comment";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
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

    const { id } = await context.params;
    const commentId = String(id || "").trim();

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return NextResponse.json(
        { success: false, message: "Invalid comment id" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const action = String(body.action || "").trim();

    let nextStatus: "approved" | "rejected" | null = null;

    if (action === "approve") nextStatus = "approved";
    if (action === "reject") nextStatus = "rejected";

    if (!nextStatus) {
      return NextResponse.json(
        { success: false, message: "Invalid action" },
        { status: 400 },
      );
    }

    const updated = await Comment.findByIdAndUpdate(
      commentId,
      { status: nextStatus },
      { new: true },
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Comment not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Comment ${nextStatus} successfully`,
    });
  } catch (error) {
    console.error("Admin comments PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update comment" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
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

    const { id } = await context.params;
    const commentId = String(id || "").trim();

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return NextResponse.json(
        { success: false, message: "Invalid comment id" },
        { status: 400 },
      );
    }

    const deleted = await Comment.findByIdAndDelete(commentId);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Comment not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Admin comments DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete comment" },
      { status: 500 },
    );
  }
}
