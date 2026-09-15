import mongoose, { Document, Schema } from "mongoose";

export interface ITestimonial extends Document {
  caseStudy: mongoose.Types.ObjectId;
  freelancer: mongoose.Types.ObjectId;
  clientName: string;
  clientEmail?: string;
  clientCompany?: string;
  message: string;
  aiHighlight?: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: Date;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    caseStudy: { type: Schema.Types.ObjectId, ref: "CaseStudy", required: true, index: true },
    freelancer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    clientName: { type: String, required: true, trim: true, maxlength: 120 },
    clientEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],
    },
    clientCompany: { type: String, trim: true, maxlength: 160 },
    message: { type: String, required: true, trim: true, maxlength: 5_000 },
    aiHighlight: { type: String, trim: true, maxlength: 500 },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
  },
  { timestamps: true },
);

TestimonialSchema.index({ freelancer: 1, status: 1, submittedAt: -1 });

export default mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);
