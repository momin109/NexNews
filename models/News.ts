import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type NewsStatus = "draft" | "published" | "unpublished";

export interface INews extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: Types.ObjectId;
  featuredImage?: string;
  author: Types.ObjectId;
  status: NewsStatus;
  isBreaking: boolean;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const NewsSchema = new Schema<INews>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    featuredImage: {
      type: String,
      default: "",
      trim: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "unpublished"],
      default: "draft",
    },
    isBreaking: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

const News: Model<INews> =
  mongoose.models.News || mongoose.model<INews>("News", NewsSchema);

export default News;
