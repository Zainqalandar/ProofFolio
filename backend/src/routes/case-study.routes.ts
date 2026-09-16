import { Router } from "express";
import protect from "../middleware/auth.middleware";
import uploadCaseStudyImages from "../middleware/upload.middleware";
import { createCaseStudy, deleteCaseStudy, getMyCaseStudies, updateCaseStudy, enhanceStoryDescription } from "../controllers/case-study.controller";

const router = Router();

router.post("/", protect, uploadCaseStudyImages.array("screenshots", 5), createCaseStudy);
router.post("/enhance-description", protect, enhanceStoryDescription);
// This must precede /:id so Express does not treat "my" as an ID.
router.get("/my", protect, getMyCaseStudies);
router.put("/:id", protect, uploadCaseStudyImages.array("screenshots", 5), updateCaseStudy);
router.delete("/:id", protect, deleteCaseStudy);

export default router;
