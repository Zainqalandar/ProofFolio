import { Router } from "express";
import protect from "../middleware/auth.middleware";
import uploadCaseStudyImages from "../middleware/upload.middleware";
import {
  createCaseStudy,
  getMyCaseStudies,
  updateCaseStudy,
  deleteCaseStudy,
  getCaseStudyByShareToken,
} from "../controllers/case-study.controller";

const router = Router();

router.post(
  "/",
  protect,
  uploadCaseStudyImages.array("screenshots", 5),
  createCaseStudy,
);

router.get("/share/:shareToken", getCaseStudyByShareToken);

router.put(
  "/:id",
  protect,
  uploadCaseStudyImages.array("screenshots", 5),
  updateCaseStudy,
);

router.delete("/:id", protect, deleteCaseStudy);

router.get("/my", protect, getMyCaseStudies);

export default router;
