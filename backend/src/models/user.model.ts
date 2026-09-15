import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  bio: string;
  profileSlug: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, minlength: 3, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],
    },
    password: { type: String, required: true, minlength: 6 },
    bio: { type: String, default: "", trim: true, maxlength: 1_000 },
    profileSlug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  },
  { timestamps: true },
);

export default mongoose.model<IUser>("User", UserSchema);
