import { Router } from "express";
import protect from "../middleware/auth.middleware";
import { getCurrentUser, loginUser, registerUser } from "../controllers/auth.controller";

const router = Router();

router.post("/signup", registerUser);
// Temporary compatibility alias for the existing client. The documented endpoint is /signup.
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getCurrentUser);

export default router;
