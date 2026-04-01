import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import Bookmark from "@/models/Bookmark";

export async function POST(req: Request) {
  await connectDB();

  const { postId } = await req.json();
  const cookieStore = cookies();
  const sessionId = cookieStore.get("sessionId")?.value;

  if (!sessionId) {
    return Response.json({ error: "No session" }, { status: 400 });
  }

  // toggle bookmark
  const existing = await Bookmark.findOne({ sessionId, postId });

  if (existing) {
    await Bookmark.deleteOne({ _id: existing._id });
    return Response.json({ message: "Removed" });
  }

  await Bookmark.create({ sessionId, postId });
  return Response.json({ message: "Saved" });
}
