
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  profilePicture: string;
  bio: string;
  profileSlug: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    username: { type: String, required: true, unique: true, minlength: 3, maxlength: 30 },
    email: { type: String, required: true, unique: true, match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email' ] },
    password: { type: String, required: true, minlength: 6 },
    profilePicture: { type: String, default: 'https://plus.unsplash.com/premium_vector-1728560971513-32c0ac5e2c30?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0' },
    bio: { type: String, default: '' },
    profileSlug: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>('User', UserSchema);

export default User;