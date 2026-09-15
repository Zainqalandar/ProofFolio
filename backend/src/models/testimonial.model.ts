import mongoose, { Schema, Document } from 'mongoose';

export interface ITestimonial extends Document {
    caseStudyId: mongoose.Types.ObjectId;
    freelancerId: mongoose.Types.ObjectId;
    clientName: string;
    clientEmail: string;
    clientCompany: string;
    message: string;
    aiHighlight: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: Date;
    reviewedAt: Date;
}

const TestimonialSchema: Schema<ITestimonial> = new Schema({
    caseStudyId: { type: mongoose.Types.ObjectId, ref: 'CaseStudy', required: true },
    freelancerId: { type: mongoose.Types.ObjectId, ref: 'Freelancer', required: true },
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true, match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email'] },
    clientCompany: { type: String, required: true },
    message: { type: String, required: true },
    aiHighlight: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date }
}, {
    timestamps: true
});

export default mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);