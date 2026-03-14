import { Router } from 'express';
import { login, logout, refresh, registration } from '../controllers/auth.controller.js';
import { validateMiddleware } from '../middelwares/validate.middleware.js';
import { CreateUserSchema, LoginUserSchema } from '../types/User.type.js';

const router = Router();

router.post('/login', validateMiddleware(LoginUserSchema), login);
router.post('/registration', validateMiddleware(CreateUserSchema), registration);
router.post('/refresh-token', refresh);
router.post('/logout', logout);

export default router;
