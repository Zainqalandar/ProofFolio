import { Router } from "express";
import { getPublicProfile } from "../controllers/public-profile.controller";

const router = Router();

router.get("/profile/:slug", getPublicProfile);

export default router;
