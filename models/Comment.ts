import mongoose, { Schema, model, models, Types } from "mongoose";

export type CommentStatus = "pending" | "approved" | "rejected";

export interface IComment {
  news: Types.ObjectId;
  name: string;
  email: string;
  message: string;
  status: CommentStatus;
  parentComment?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    news: {
      type: Schema.Types.ObjectId,
      ref: "News",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 120,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

CommentSchema.index({ news: 1, status: 1, createdAt: -1 });

const Comment = models.Comment || model<IComment>("Comment", CommentSchema);

export default Comment;
