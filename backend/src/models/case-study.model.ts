import mongoose, { Schema, Document } from 'mongoose';

export interface ICaseStudy extends Document {
  freelancerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  screenshots: string[];
  shareToken: string;
}

const CaseStudySchema: Schema<ICaseStudy> = new Schema({
  freelancerId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  screenshots: {
    type: [String],
    default: [],
  },
  shareToken: { type: String, required: true, unique: true, index: true },
}, {
  timestamps: true,
});

export default mongoose.model<ICaseStudy>('CaseStudy', CaseStudySchema);
