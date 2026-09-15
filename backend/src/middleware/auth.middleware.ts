import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import type { Request } from "express";
import { HTTP_STATUS } from "../constants/http-status";

export interface AuthenticatedRequest extends Request {
  user?: { id: string };
  files?: Express.Multer.File[];
}

const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : undefined;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Unauthorized" });
    return;
  }
  try {
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
    if (typeof decoded.id !== "string") throw new Error("Invalid token payload");
    req.user = { id: decoded.id };
    next();
  } catch {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Unauthorized" });
  }
};

export default protect;
