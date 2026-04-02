import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUserFromRequest } from "@/lib/auth-user";
import Media from "@/models/Media";
import getCloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

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

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const altText = String(formData.get("altText") || "").trim();

    if (!file) {
      return NextResponse.json(
        { success: false, message: "File is required" },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only JPG, PNG, and WEBP images are allowed",
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: "File size must be under 5MB" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const cloudinary = getCloudinary();

    const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "news-portal",
          resource_type: "image",
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      stream.end(buffer);
    });

    await connectDB();

    const media = await Media.create({
      fileName: uploadResult.public_id,
      originalName: file.name,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      mimeType: file.type,
      size: file.size,
      altText,
      uploadedBy: authUser.userId,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Image uploaded successfully",
        media,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Media upload error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload image" },
      { status: 500 },
    );
  }
}
