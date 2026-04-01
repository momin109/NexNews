import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
  {
    sessionId: String,
    postId: String,
  },
  { timestamps: true },
);

export default mongoose.models.Bookmark ||
  mongoose.model("Bookmark", bookmarkSchema);
