import { Router } from "express";
import { createPublicTestimonial, getCaseStudyInfo } from "../controllers/public-submission.controller";

const router = Router();

router.get("/case-study/:token", getCaseStudyInfo);
router.post("/testimonial/:token", createPublicTestimonial);

export default router;
