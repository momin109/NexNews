import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getAuthUserFromRequest } from "@/lib/auth-user";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await getAuthUserFromRequest(req);

    if (!authUser || authUser.role !== "super_admin") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await req.json();

    const { name, email, password, role, isActive } = body;

    await connectDB();

    // self-protection
    if (authUser.userId === id) {
      if (role !== undefined && role !== "super_admin") {
        return NextResponse.json(
          {
            success: false,
            message: "You cannot change your own super admin role",
          },
          { status: 400 },
        );
      }

      if (isActive === false) {
        return NextResponse.json(
          { success: false, message: "You cannot deactivate yourself" },
          { status: 400 },
        );
      }
    }

    const existingUser = await User.findById(id);

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) {
      const trimmedName = String(name).trim();

      if (!trimmedName) {
        return NextResponse.json(
          { success: false, message: "Name is required" },
          { status: 400 },
        );
      }

      updateData.name = trimmedName;
    }

    if (email !== undefined) {
      const normalizedEmail = String(email).toLowerCase().trim();

      if (!normalizedEmail) {
        return NextResponse.json(
          { success: false, message: "Email is required" },
          { status: 400 },
        );
      }

      const emailExists = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: id },
      });

      if (emailExists) {
        return NextResponse.json(
          { success: false, message: "Email already in use" },
          { status: 409 },
        );
      }

      updateData.email = normalizedEmail;
    }

    if (password !== undefined && String(password).trim() !== "") {
      const plainPassword = String(password).trim();

      if (plainPassword.length < 6) {
        return NextResponse.json(
          {
            success: false,
            message: "Password must be at least 6 characters",
          },
          { status: 400 },
        );
      }

      updateData.password = await bcrypt.hash(plainPassword, 10);
    }

    if (role !== undefined) {
      if (!["super_admin", "admin", "editor", "reporter"].includes(role)) {
        return NextResponse.json(
          { success: false, message: "Invalid role" },
          { status: 400 },
        );
      }

      updateData.role = role;
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await getAuthUserFromRequest(req);

    if (!authUser || authUser.role !== "super_admin") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const { id } = await params;

    if (authUser.userId === id) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot delete your own account",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete user" },
      { status: 500 },
    );
  }
}
