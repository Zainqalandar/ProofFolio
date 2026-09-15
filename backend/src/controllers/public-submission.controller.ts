import { Request, Response } from "express";
import { HTTP_STATUS } from "../constants/http-status";
import CaseStudy from "../models/case-study.model";
import Testimonial from "../models/testimonial.model";

const getCaseStudyInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = typeof req.params.token === "string" ? req.params.token : undefined;
    if (!token) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "A share token is required" });
      return;
    }
    const caseStudy = await CaseStudy.findOne({ shareToken: token }).select("title description");
    if (!caseStudy) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Case study not found" });
      return;
    }
    // Do not expose the freelancer ID, share token, or unrelated testimonials to a client.
    res.status(HTTP_STATUS.OK).json({ caseStudy });
  } catch (error) {
    console.error("Error fetching public case study:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Error fetching case study" });
  }
};

const createPublicTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = typeof req.params.token === "string" ? req.params.token : undefined;
    const { clientName, clientEmail, clientCompany, message } = (req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>;
    if (!token) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "A share token is required" });
      return;
    }
    if (
      typeof clientName !== "string" || !clientName.trim() ||
      typeof message !== "string" || !message.trim() ||
      (clientEmail !== undefined && typeof clientEmail !== "string") ||
      (clientCompany !== undefined && typeof clientCompany !== "string")
    ) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Client name and testimonial message are required" });
      return;
    }
    const caseStudy = await CaseStudy.findOne({ shareToken: token }).select("_id freelancer");
    if (!caseStudy) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Case study not found" });
      return;
    }
    const testimonial = await Testimonial.create({
      caseStudy: caseStudy._id,
      freelancer: caseStudy.freelancer,
      clientName: clientName.trim(),
      ...(typeof clientEmail === "string" && clientEmail.trim() ? { clientEmail: clientEmail.trim() } : {}),
      ...(typeof clientCompany === "string" && clientCompany.trim() ? { clientCompany: clientCompany.trim() } : {}),
      message: message.trim(),
      status: "pending",
      submittedAt: new Date(),
    });
    res.status(HTTP_STATUS.CREATED).json({
      message: "Testimonial submitted for review",
      testimonial: { _id: testimonial._id, status: testimonial.status, submittedAt: testimonial.submittedAt },
    });
  } catch (error) {
    console.error("Error submitting testimonial:", error);
    res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Unable to submit testimonial" });
  }
};

export { getCaseStudyInfo, createPublicTestimonial };
