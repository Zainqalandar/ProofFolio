import mongoose, { Document, Schema } from "mongoose";

export interface ICaseStudy extends Document {
  freelancer: mongoose.Types.ObjectId;
  title: string;
  description: string;
  screenshots: string[];
  shareToken: string;
  createdAt: Date;
  updatedAt: Date;
}

const CaseStudySchema = new Schema<ICaseStudy>(
  {
    freelancer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 10_000 },
    screenshots: { type: [String], default: [] },
    shareToken: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true },
);

export default mongoose.model<ICaseStudy>("CaseStudy", CaseStudySchema);
