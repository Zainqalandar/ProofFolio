import { Router } from "express";
import protect from "../middleware/auth.middleware";
import { getPublicProfile, getPublicProfiles, updatePublicProfile } from "../controllers/public-profile.controller";

const router = Router();

router.get("/profiles", getPublicProfiles);
router.get("/profile/:slug", getPublicProfile);
router.put("/profile/:slug", protect, updatePublicProfile);

export default router;
