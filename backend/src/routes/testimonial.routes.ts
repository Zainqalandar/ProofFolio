import { Router } from "express";
import protect from "../middleware/auth.middleware";
import {
  createTestimonial, getTestimonialById, updateTestimonial
} from "../controllers/testimonial.controller";

const router = Router();

router.post(
  "/",
  protect,
  createTestimonial,
);

router.get("/:id", protect, getTestimonialById);

router.put(
  "/:id",
  protect,
  updateTestimonial,
);

export default router;