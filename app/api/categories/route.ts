import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { getAuthUserFromRequest } from "@/lib/auth-user";
import { slugify } from "@/lib/slugify";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { name, slug, description, isActive } = body;

    if (!name || !String(name).trim()) {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 },
      );
    }

    await connectDB();

    const normalizedName = String(name).trim();
    const generatedSlug =
      slug && String(slug).trim()
        ? slugify(String(slug))
        : slugify(normalizedName);

    if (!generatedSlug) {
      return NextResponse.json(
        { success: false, message: "Valid slug could not be generated" },
        { status: 400 },
      );
    }

    const existingName = await Category.findOne({
      name: { $regex: `^${normalizedName}$`, $options: "i" },
    });

    if (existingName) {
      return NextResponse.json(
        { success: false, message: "Category name already exists" },
        { status: 409 },
      );
    }

    const existingSlug = await Category.findOne({ slug: generatedSlug });

    if (existingSlug) {
      return NextResponse.json(
        { success: false, message: "Category slug already exists" },
        { status: 409 },
      );
    }

    const category = await Category.create({
      name: normalizedName,
      slug: generatedSlug,
      description: description ? String(description).trim() : "",
      isActive: typeof isActive === "boolean" ? isActive : true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
        category,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create category" },
      { status: 500 },
    );
  }
}
