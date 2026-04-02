import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getAuthUserFromRequest } from "@/lib/auth-user";
import Media from "@/models/Media";
import getCloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";

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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid media id" },
        { status: 400 },
      );
    }

    await connectDB();

    const media = await Media.findById(id);

    if (!media) {
      return NextResponse.json(
        { success: false, message: "Media not found" },
        { status: 404 },
      );
    }

    const cloudinary = getCloudinary();

    await cloudinary.uploader.destroy(media.publicId);

    await Media.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error("Delete media error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete media" },
      { status: 500 },
    );
  }
}
