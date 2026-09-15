import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import authRoutes from "./routes/auth.routes";
import caseStudyRoutes from "./routes/case-study.routes";
import publicProfileRoutes from "./routes/public-profile.routes";
import publicSubmissionRoutes from "./routes/public-submission.routes";
import testimonialRoutes from "./routes/testimonial.routes";

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("CORS origin is not allowed"));
  },
}));
app.use(express.json());
app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "ProofFolio API is healthy" });
});
app.use("/api/auth", authRoutes);
app.use("/api/case-studies", caseStudyRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/public", publicSubmissionRoutes);
app.use("/api/public", publicProfileRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled request error:", error);
  res.status(400).json({ message: error.message || "Invalid request" });
});

export default app;
