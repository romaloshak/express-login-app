import { Router } from 'express';
import { getProfile } from '../controllers/user.controller.js';
import { authMiddleware } from '../middelwares/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware, getProfile);

export default router;
