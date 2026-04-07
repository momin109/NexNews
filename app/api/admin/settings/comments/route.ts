import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUserFromRequest } from "@/lib/auth-user";
import { getCommentsEnabled, setCommentsEnabled } from "@/lib/site-settings";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);

    if (!authUser || !["super_admin", "admin"].includes(authUser.role)) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    await connectDB();

    const commentsEnabled = await getCommentsEnabled();

    return NextResponse.json({
      success: true,
      commentsEnabled,
    });
  } catch (error) {
    console.error("Comments setting GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch comments setting" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);

    if (!authUser || !["super_admin", "admin"].includes(authUser.role)) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    await connectDB();

    const body = await req.json();
    const enabled = Boolean(body.enabled);

    await setCommentsEnabled(enabled);

    return NextResponse.json({
      success: true,
      message: `Comments ${enabled ? "enabled" : "disabled"} successfully`,
      commentsEnabled: enabled,
    });
  } catch (error) {
    console.error("Comments setting PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update comments setting" },
      { status: 500 },
    );
  }
}
