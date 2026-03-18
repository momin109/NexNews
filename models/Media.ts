import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IMedia extends Document {
  fileName: string;
  originalName: string;
  publicId: string;
  url: string;
  mimeType: string;
  size: number;
  altText?: string;
  uploadedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema<IMedia>(
  {
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,
      required: true,
    },
    altText: {
      type: String,
      default: "",
      trim: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const Media: Model<IMedia> =
  mongoose.models.Media || mongoose.model<IMedia>("Media", MediaSchema);

export default Media;
