import crypto from "node:crypto";
import mongoose from "mongoose";
import { Response } from "express";
import { HTTP_STATUS } from "../constants/http-status";
import CaseStudy from "../models/case-study.model";
import Testimonial from "../models/testimonial.model";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const uploadedUrls = (files: Express.Multer.File[] | undefined): string[] =>
  (files ?? []).map((file) => file.path).filter((url): url is string => Boolean(url));

const createCaseStudy = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, description } = (req.body && typeof req.body === "object" ? req.body : {}) as { title?: unknown; description?: unknown };
    const screenshots = uploadedUrls(req.files as Express.Multer.File[] | undefined);
    if (!req.user?.id) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Please login first" });
      return;
    }
    if (typeof title !== "string" || !title.trim() || typeof description !== "string" || !description.trim()) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Title and description are required" });
      return;
    }
    if (screenshots.length === 0) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "At least one screenshot is required" });
      return;
    }
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const caseStudy = await CaseStudy.create({
          freelancer: req.user.id,
          title: title.trim(),
          description: description.trim(),
          screenshots,
          shareToken: crypto.randomBytes(16).toString("hex"),
        });
        res.status(HTTP_STATUS.CREATED).json({ caseStudy });
        return;
      } catch (error) {
        if ((error as { code?: number }).code !== 11000 || attempt === 2) throw error;
      }
    }
  } catch (error) {
    console.error("Error creating case study:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Error creating case study" });
  }
};

const getMyCaseStudies = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Please login first" });
      return;
    }
    const caseStudies = await CaseStudy.find({ freelancer: req.user.id }).sort({ createdAt: -1 });
    res.status(HTTP_STATUS.OK).json({ caseStudies });
  } catch (error) {
    console.error("Error fetching case studies:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Error fetching case studies" });
  }
};

const updateCaseStudy = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : undefined;
    const { title, description } = (req.body && typeof req.body === "object" ? req.body : {}) as { title?: unknown; description?: unknown };
    if (!req.user?.id) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Please login first" });
      return;
    }
    if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "A valid case study ID is required" });
      return;
    }
    if (
      (title !== undefined && (typeof title !== "string" || !title.trim())) ||
      (description !== undefined && (typeof description !== "string" || !description.trim()))
    ) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Title and description cannot be empty" });
      return;
    }
    const caseStudy = await CaseStudy.findOne({ _id: id, freelancer: req.user.id });
    if (!caseStudy) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Case study not found" });
      return;
    }
    if (title !== undefined) caseStudy.title = title.trim();
    if (description !== undefined) caseStudy.description = description.trim();
    const screenshots = uploadedUrls(req.files as Express.Multer.File[] | undefined);
    if (screenshots.length > 0) caseStudy.screenshots = screenshots;
    await caseStudy.save();
    res.status(HTTP_STATUS.OK).json({ caseStudy });
  } catch (error) {
    console.error("Error updating case study:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Error updating case study" });
  }
};

const deleteCaseStudy = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : undefined;
    if (!req.user?.id) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Please login first" });
      return;
    }
    if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "A valid case study ID is required" });
      return;
    }
    const caseStudy = await CaseStudy.findOneAndDelete({ _id: id, freelancer: req.user.id });
    if (!caseStudy) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Case study not found" });
      return;
    }
    await Testimonial.deleteMany({ caseStudy: caseStudy._id });
    res.status(HTTP_STATUS.OK).json({ message: "Case study deleted successfully" });
  } catch (error) {
    console.error("Error deleting case study:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Error deleting case study" });
  }
};

export { createCaseStudy, getMyCaseStudies, updateCaseStudy, deleteCaseStudy };
