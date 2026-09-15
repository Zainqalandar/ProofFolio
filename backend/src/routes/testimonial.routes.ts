import { Router } from "express";
import protect from "../middleware/auth.middleware";
import { approveTestimonial, generateAiHighlight, getPendingTestimonials, rejectTestimonial } from "../controllers/testimonial.controller";

const router = Router();

router.get("/pending", protect, getPendingTestimonials);
router.patch("/:id/approve", protect, approveTestimonial);
router.patch("/:id/reject", protect, rejectTestimonial);
router.post("/:id/ai-highlight", protect, generateAiHighlight);

export default router;
