import { Request, Response } from "express";
import mongoose from "mongoose";
import { HTTP_STATUS } from "../constants/http-status";
import CaseStudy from "../models/case-study.model";
import Testimonial from "../models/testimonial.model";
import User from "../models/user.model";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const toPositiveInt = (value: unknown, fallback: number, max: number): number => {
  const parsed = typeof value === "string" ? Number.parseInt(value, 10) : NaN;
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, max) : fallback;
};

const getPublicProfiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = toPositiveInt(req.query.page, 1, Number.MAX_SAFE_INTEGER);
    const limit = toPositiveInt(req.query.limit, 9, 24);

    const [users, total] = await Promise.all([
      User.find({})
        .select("name bio profileSlug profilePicture createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(),
    ]);

    const userIds = users.map((user) => user._id);
    const projectGroups = userIds.length > 0
      ? await CaseStudy.aggregate<{
        _id: mongoose.Types.ObjectId;
        projectCount: number;
        projects: Array<{
          _id: mongoose.Types.ObjectId;
          title: string;
          description: string;
          screenshots: string[];
          createdAt: Date;
        }>;
      }>([
        { $match: { freelancer: { $in: userIds } } },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: "$freelancer",
            projectCount: { $sum: 1 },
            projects: {
              $push: {
                _id: "$_id",
                title: "$title",
                description: "$description",
                screenshots: "$screenshots",
                createdAt: "$createdAt",
              },
            },
          },
        },
        { $project: { projectCount: 1, projects: { $slice: ["$projects", 3] } } },
      ])
      : [];

    const projectsByUser = new Map(projectGroups.map((group) => [group._id.toString(), group]));
    const profiles = users.map((user) => {
      const projectGroup = projectsByUser.get(user._id.toString());
      return {
        name: user.name,
        bio: user.bio,
        profileSlug: user.profileSlug,
        profilePicture: user.profilePicture,
        projectCount: projectGroup?.projectCount ?? 0,
        projects: projectGroup?.projects ?? [],
      };
    });

    res.status(HTTP_STATUS.OK).json({
      profiles,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching public profiles:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Error fetching public profiles" });
  }
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

const updatePublicProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const slug = typeof req.params.slug === "string" ? req.params.slug : undefined;
    if (!slug) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Profile slug is required" });
      return;
    }
    const body = (req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>;
    const { name, bio } = body;

    if (name === undefined && bio === undefined) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Name or bio is required" });
      return;
    }
    if (name !== undefined && (typeof name !== "string" || name.trim().length < 3 || name.trim().length > 80)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Name must be between 3 and 80 characters" });
      return;
    }
    if (bio !== undefined && (typeof bio !== "string" || bio.trim().length > 1_000)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Bio must be 1,000 characters or fewer" });
      return;
    }

    const authenticatedUserId = req.user?.id;
    if (!authenticatedUserId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Authentication is required" });
      return;
    }

    const user = await User.findOne({ _id: authenticatedUserId, profileSlug: slug.toLowerCase() });
    if (!user) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Profile not found or you do not have permission to edit it" });
      return;
    }
    if (typeof name === "string") user.name = name.trim();
    if (typeof bio === "string") user.bio = bio.trim();
    await user.save();
    res.status(HTTP_STATUS.OK).json({
      message: "Profile updated successfully",
      profile: { name: user.name, bio: user.bio, profileSlug: user.profileSlug, profilePicture: user.profilePicture },
    });
  } catch (error) {
    console.error("Error updating public profile:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Error updating public profile" });
  }
};

export { getPublicProfile, getPublicProfiles, updatePublicProfile };
