import { Request, Response } from "express";
import crypto from "node:crypto";
import { HTTP_STATUS } from "../constants/http-status";
import CaseStudy from "../models/case-study.model";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const createCaseStudy = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { title, description } = req.body as {
      title?: string;
      description?: string;
    };
    const files = (req.files ?? []) as Express.Multer.File[];

    if (!req.user?.id) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: "Please login first" });
      return;
    }

    if (!title?.trim() || !description?.trim()) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: "Title and description are required" });
      return;
    }

    if (files.length === 0) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: "At least one screenshot is required" });
      return;
    }

    // CloudinaryStorage file.path me uploaded image ka URL deta hai.
    const screenshotUrls = files.map((file) => file.path).filter(Boolean);

    const newCaseStudy = new CaseStudy({
      freelancerId: req.user.id,
      title: title.trim(),
      description: description.trim(),
      screenshots: screenshotUrls,
      shareToken: crypto.randomBytes(16).toString("hex"),
    });

    const savedCaseStudy = await newCaseStudy.save();
    res.status(HTTP_STATUS.CREATED).json(savedCaseStudy);
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: "Error creating case study", error });
  }
};

const getCaseStudyByShareToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { shareToken } = req.params;

    if (!shareToken) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: "Share token is required" });
      return;
    }

    const caseStudy = await CaseStudy.findOne({ shareToken });

    if (!caseStudy) {
      res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: "Case study not found" });
      return;
    }

    res.status(HTTP_STATUS.OK).json(caseStudy);
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: "Error fetching case study", error });
  }
};

const deleteCaseStudy = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user?.id) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: "Please login first" });
      return;
    }

    if (!id) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: "Case study ID is required" });
      return;
    }

    const caseStudy = await CaseStudy.findById(id);

    if (!caseStudy) {
      res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: "Case study not found" });
      return;
    }

    if (caseStudy.freelancerId.toString() !== req.user.id) {
      res
        .status(HTTP_STATUS.FORBIDDEN)
        .json({ message: "You are not authorized to delete this case study" });
      return;
    }

    await CaseStudy.findByIdAndDelete(id);
    res
      .status(HTTP_STATUS.OK)
      .json({ message: "Case study deleted successfully" });
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: "Error deleting case study", error });
  }
};

const updateCaseStudy = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description } = req.body as {
      title?: string;
      description?: string;
    };
    const files = (req.files ?? []) as Express.Multer.File[];

    if (!req.user?.id) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: "Please login first" });
      return;
    }

    if (!id) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: "Case study ID is required" });
      return;
    }

    const caseStudy = await CaseStudy.findById(id);

    if (!caseStudy) {
      res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: "Case study not found" });
      return;
    }

    if (caseStudy.freelancerId.toString() !== req.user.id) {
      res
        .status(HTTP_STATUS.FORBIDDEN)
        .json({ message: "You are not authorized to update this case study" });
      return;
    }

    if (title?.trim()) {
      caseStudy.title = title.trim();
    }

    if (description?.trim()) {
      caseStudy.description = description.trim();
    }

    if (files.length > 0) {
      const screenshotUrls = files.map((file) => file.path).filter(Boolean);
      caseStudy.screenshots = screenshotUrls;
    }

    const updatedCaseStudy = await caseStudy.save();
    res.status(HTTP_STATUS.OK).json(updatedCaseStudy);
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: "Error updating case study", error });
  }
};

const getMyCaseStudies = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: "Please login first" });
      return;
    }

    const caseStudies = await CaseStudy.find({
      freelancerId: req.user.id,
    }).sort({ createdAt: -1 });
    res.status(HTTP_STATUS.OK).json(caseStudies);
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: "Error fetching case studies", error });
  }
};

export {
  createCaseStudy,
  getMyCaseStudies,
  updateCaseStudy,
  deleteCaseStudy,
  getCaseStudyByShareToken,
};
