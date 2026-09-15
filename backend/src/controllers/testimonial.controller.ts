import { Request, Response } from "express";
import mongoose from "mongoose";
import { GoogleGenAI } from "@google/genai";
import { HTTP_STATUS } from "../constants/http-status";
import Testimonial from "../models/testimonial.model";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const getPendingTestimonials = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const testimonials = await Testimonial.find({ freelancer: req.user!.id, status: "pending" })
      .populate("caseStudy", "title")
      .sort({ submittedAt: -1 });
    res.status(HTTP_STATUS.OK).json({ testimonials });
  } catch (error) {
    console.error("Error fetching pending testimonials:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Error fetching pending testimonials" });
  }
};

const reviewTestimonial = async (req: AuthenticatedRequest, res: Response, status: "approved" | "rejected"): Promise<void> => {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : undefined;
    if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "A valid testimonial ID is required" });
      return;
    }
    const testimonial = await Testimonial.findOne({ _id: id, freelancer: req.user!.id });
    if (!testimonial) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Testimonial not found" });
      return;
    }
    if (testimonial.status !== "pending") {
      res.status(HTTP_STATUS.CONFLICT).json({ message: "Only pending testimonials can be reviewed" });
      return;
    }
    testimonial.status = status;
    testimonial.reviewedAt = new Date();
    await testimonial.save();
    res.status(HTTP_STATUS.OK).json({ testimonial });
  } catch (error) {
    console.error("Error reviewing testimonial:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Error reviewing testimonial" });
  }
};

const approveTestimonial = (req: AuthenticatedRequest, res: Response): Promise<void> => reviewTestimonial(req, res, "approved");
const rejectTestimonial = (req: AuthenticatedRequest, res: Response): Promise<void> => reviewTestimonial(req, res, "rejected");

const generateAiHighlight = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : undefined;
    if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "A valid testimonial ID is required" });
      return;
    }
    const testimonial = await Testimonial.findOne({ _id: id, freelancer: req.user!.id });
    if (!testimonial) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Testimonial not found" });
      return;
    }
    if (!process.env.GEMINI_API_KEY) {
      res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({ message: "AI highlight service is not configured" });
      return;
    }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: `Write one punchy highlight sentence (maximum 20 words) from this client testimonial. Return only the sentence.\n\n${testimonial.message}`,
    });
    const aiHighlight = response.text?.trim();
    if (!aiHighlight) {
      res.status(HTTP_STATUS.BAD_GATEWAY).json({ message: "AI highlight service returned no text" });
      return;
    }
    testimonial.aiHighlight = aiHighlight.slice(0, 500);
    await testimonial.save();
    res.status(HTTP_STATUS.OK).json({ testimonial });
  } catch (error) {
    console.error("Error generating AI highlight:", error);
    res.status(HTTP_STATUS.BAD_GATEWAY).json({ message: "Unable to generate AI highlight" });
  }
};

export { getPendingTestimonials, approveTestimonial, rejectTestimonial, generateAiHighlight };
