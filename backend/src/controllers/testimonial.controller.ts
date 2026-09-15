import { Request, Response } from "express";
import { HTTP_STATUS } from "../constants/http-status";
import testimonialModel from "../models/testimonial.model";

const createTestimonial = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      caseStudyId,
      freelancerId,
      clientName,
      clientEmail,
      clientCompany,
      message,
      aiHighlight,
      status,
      submittedAt,
      reviewedAt,
    } = req.body;

    if (!caseStudyId || !freelancerId || !clientName || !clientEmail || !clientCompany || !message) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Missing required fields",
      });
      return;
    }


    const newTestimonial = new testimonialModel({
        caseStudyId,
        freelancerId,
        clientName,
        clientEmail,
        clientCompany,
        message,
        aiHighlight: aiHighlight || "",
        status: status || "pending",
        submittedAt: submittedAt || new Date(),
        reviewedAt: reviewedAt || null,
    });

    const saveTestimonial = await newTestimonial.save();
    res.status(HTTP_STATUS.CREATED).json(saveTestimonial);
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: "Error creating case study", error });
  }
};

const updateTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Testimonial ID is required" });
      return;
    }

    const updatedTestimonial = await testimonialModel.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedTestimonial) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Testimonial not found" });
      return;
    }

    res.status(HTTP_STATUS.OK).json(updatedTestimonial);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Error updating testimonial", error });
  }
};

const getTestimonialById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: "Testimonial ID is required" });
      return;
    }

    const testimonial = await testimonialModel.findById(id);

    if (!testimonial) {
      res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: "Testimonial not found" });
      return;
    }

    res.status(HTTP_STATUS.OK).json(testimonial);
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: "Error fetching testimonial", error });
  }
};

export { createTestimonial, getTestimonialById, updateTestimonial };
