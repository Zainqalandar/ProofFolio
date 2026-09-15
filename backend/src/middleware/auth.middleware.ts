
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
  files?: Express.Multer.File[];
}

const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.slice("Bearer ".length).trim();
  const secret = process.env.JWT_SECRET || '068406';

  if (!token || !secret) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload & { id?: string };

    if (!decoded.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = { id: decoded.id };
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default protect;
