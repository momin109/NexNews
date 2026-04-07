import { Schema, model, models } from "mongoose";

export interface ISiteSetting {
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingSchema = new Schema<ISiteSetting>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const SiteSetting =
  models.SiteSetting || model<ISiteSetting>("SiteSetting", SiteSettingSchema);

export default SiteSetting;
