
import { Router } from 'express';

import protect from "../middleware/auth.middleware";
import { registerUser, loginUser, getCurrentUser } from "../controllers/auth.controller";

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getCurrentUser);

export default router;