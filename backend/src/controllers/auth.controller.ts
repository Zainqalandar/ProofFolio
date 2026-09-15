import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { HTTP_STATUS } from "../constants/http-status";
import User from "../models/user.model";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const getJwtSecret = (): string | undefined =>
  process.env.JWT_SECRET || (process.env.NODE_ENV !== "production" ? "068406" : undefined);

const publicUser = (user: { _id: unknown; name: string; email: string; bio: string; profileSlug: string }) => ({
  _id: user._id,
  name: user.name,
  username: user.name,
  email: user.email,
  bio: user.bio,
  profileSlug: user.profileSlug,
});

const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = (req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name : body.username;
    const { email, password, profileSlug } = body;

    if (
      typeof name !== "string" || !name.trim() ||
      typeof email !== "string" || !email.trim() ||
      typeof password !== "string" ||
      typeof profileSlug !== "string" || !slugRegex.test(profileSlug.trim().toLowerCase())
    ) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Name, valid email, password, and a valid profile slug are required" });
      return;
    }
    if (!passwordRegex.test(password)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Password must be at least 6 characters and include a letter, number, and special character" });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedSlug = profileSlug.trim().toLowerCase();
    const existingUser = await User.findOne({ $or: [{ email: normalizedEmail }, { profileSlug: normalizedSlug }] });
    if (existingUser) {
      res.status(HTTP_STATUS.CONFLICT).json({ message: "Email or profile slug is already in use" });
      return;
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 12),
      profileSlug: normalizedSlug,
    });
    res.status(HTTP_STATUS.CREATED).json({ message: "User registered successfully", user: publicUser(user) });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      res.status(HTTP_STATUS.CONFLICT).json({ message: "Email or profile slug is already in use" });
      return;
    }
    console.error("Error registering user:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Error registering user" });
  }
};

const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = (req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>;
    const { email, password } = body;
    if (typeof email !== "string" || typeof password !== "string") {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Email and password are required" });
      return;
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Invalid email or password" });
      return;
    }
    const secret = getJwtSecret();
    if (!secret) {
      console.error("JWT_SECRET is not configured");
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server authentication is not configured" });
      return;
    }
    const token = jwt.sign({ id: user._id.toString() }, secret, { expiresIn: "1h" });
    res.status(HTTP_STATUS.OK).json({ message: "Login successful", token, user: publicUser(user) });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Error logging in user" });
  }
};

const getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select("-password");
    if (!user) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: "User not found" });
      return;
    }
    res.status(HTTP_STATUS.OK).json({ user: publicUser(user) });
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Error fetching current user" });
  }
};

export { registerUser, loginUser, getCurrentUser };
