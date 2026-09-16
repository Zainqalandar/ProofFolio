import { Request, Response } from "express";
import mongoose from "mongoose";
import { HTTP_STATUS } from "../constants/http-status";
import CaseStudy from "../models/case-study.model";
import Testimonial from "../models/testimonial.model";
import User from "../models/user.model";

const toPositiveInt = (value: unknown, fallback: number, max: number): number => {
  const parsed = typeof value === "string" ? Number.parseInt(value, 10) : NaN;
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, max) : fallback;
};

const getPublicProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = typeof req.params.slug === "string" ? req.params.slug : undefined;
    if (!slug) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Profile slug is required" });
      return;
    }
    const page = toPositiveInt(req.query.page, 1, Number.MAX_SAFE_INTEGER);
    const limit = toPositiveInt(req.query.limit, 10, 50);
    const sort = req.query.sort === "oldest" ? 1 : -1;
    const caseStudyId = typeof req.query.caseStudy === "string" ? req.query.caseStudy : undefined;
    if (caseStudyId && !mongoose.isValidObjectId(caseStudyId)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "caseStudy must be a valid ID" });
      return;
    }

    const user = await User.findOne({ profileSlug: slug.toLowerCase() }).select("name bio profileSlug profilePicture");
    if (!user) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Profile not found" });
      return;
    }
    const filter: Record<string, unknown> = { freelancer: user._id, status: "approved" };
    if (caseStudyId) filter.caseStudy = caseStudyId;
    const [caseStudies, testimonials, total] = await Promise.all([
      CaseStudy.find({ freelancer: user._id }).select("title description screenshots createdAt").sort({ createdAt: -1 }),
      Testimonial.find(filter)
        .select("caseStudy clientName clientCompany message aiHighlight submittedAt reviewedAt")
        .populate("caseStudy", "title")
        .sort({ submittedAt: sort })
        .skip((page - 1) * limit)
        .limit(limit),
      Testimonial.countDocuments(filter),
    ]);
    res.status(HTTP_STATUS.OK).json({
      profile: { name: user.name, bio: user.bio, profileSlug: user.profileSlug, profilePicture: user.profilePicture },
      caseStudies,
      testimonials,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching public profile:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Error fetching public profile" });
  }
};

export { getPublicProfile };
