import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  bio: string;
  profileSlug: string;
  profilePicture: string;
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
    profilePicture: { type: String, default: "https://plus.unsplash.com/premium_vector-1728560971513-32c0ac5e2c30?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0" },
    password: { type: String, required: true, minlength: 6 },
    bio: { type: String, default: "", trim: true, maxlength: 1_000 },
    profileSlug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  },
  { timestamps: true },
);

export default mongoose.model<IUser>("User", UserSchema);
