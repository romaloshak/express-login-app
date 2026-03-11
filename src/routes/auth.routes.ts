import { Router } from 'express';
import { CreateUserSchema, LoginUserSchema } from '../../types/User.type.js';
import { login, logout, refresh } from '../controllers/auth.controller.js';
import { createUser } from '../controllers/user.controller.js';
import { validateMiddleware } from '../middelwares/validate.middleware.js';

const router = Router();

router.post('/login', validateMiddleware(LoginUserSchema), login);
router.post('/registration', validateMiddleware(CreateUserSchema), createUser);
router.post('/refresh-token', refresh);
router.post('/logout', logout);

export default router;
