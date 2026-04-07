import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";
import News from "@/models/News";
import { getCommentsEnabled } from "@/lib/site-settings";

export const runtime = "nodejs";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const commentsEnabled = await getCommentsEnabled();

    const { searchParams } = new URL(req.url);
    const newsId = (searchParams.get("newsId") || "").trim();
    const page = Math.max(Number(searchParams.get("page") || 1), 1);
    const limit = Math.min(
      Math.max(Number(searchParams.get("limit") || 10), 1),
      20,
    );

    if (!newsId || !mongoose.Types.ObjectId.isValid(newsId)) {
      return NextResponse.json(
        { success: false, message: "Valid newsId is required" },
        { status: 400 },
      );
    }

    const query = {
      news: new mongoose.Types.ObjectId(newsId),
      status: "approved",
      parentComment: null,
    };

    const [comments, total] = await Promise.all([
      Comment.find(query)
        .select("name message createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Comment.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      commentsEnabled,
      comments,
      pagination: {
        page,
        limit,
        total,
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error("Comments GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch comments" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const commentsEnabled = await getCommentsEnabled();

    if (!commentsEnabled) {
      return NextResponse.json(
        { success: false, message: "Comments are currently disabled" },
        { status: 403 },
      );
    }

    const body = await req.json();

    const newsId = String(body.newsId || "").trim();
    const name = String(body.name || "").trim();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const message = String(body.message || "").trim();

    if (!newsId || !mongoose.Types.ObjectId.isValid(newsId)) {
      return NextResponse.json(
        { success: false, message: "Valid newsId is required" },
        { status: 400 },
      );
    }

    if (!name || name.length < 2) {
      return NextResponse.json(
        { success: false, message: "Name must be at least 2 characters" },
        { status: 400 },
      );
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "A valid email is required" },
        { status: 400 },
      );
    }

    if (!message || message.length < 3) {
      return NextResponse.json(
        { success: false, message: "Comment must be at least 3 characters" },
        { status: 400 },
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { success: false, message: "Comment is too long" },
        { status: 400 },
      );
    }

    const news = await News.findOne({
      _id: new mongoose.Types.ObjectId(newsId),
      status: "published",
    }).select("_id");

    if (!news) {
      return NextResponse.json(
        { success: false, message: "Published news not found" },
        { status: 404 },
      );
    }

    const comment = await Comment.create({
      news: news._id,
      name,
      email,
      message,
      status: "pending",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Comment submitted successfully and is awaiting review",
        commentId: comment._id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Comments POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit comment" },
      { status: 500 },
    );
  }
}
