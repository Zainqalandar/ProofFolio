import { Router } from "express";
import protect from "../middleware/auth.middleware";
import { uploadProfilePicture } from "../middleware/upload.middleware";
import { getCurrentUser, loginUser, registerUser, updateProfilePicture } from "../controllers/auth.controller";

const router = Router();

router.post("/signup", registerUser);
// Temporary compatibility alias for the existing client. The documented endpoint is /signup.
router.post("/register", registerUser);
router.put("/profile-picture", protect, uploadProfilePicture.array("profilePicture", 1), updateProfilePicture);
router.post("/login", loginUser);
router.get("/me", protect, getCurrentUser);

export default router;
