import { Router } from 'express';
import { CreateUserSchema } from '../../types/User.type.js';
import { createUser, getUsers } from '../controllers/user.controller.js';
import { validate } from '../middelwares/validate.js';

const router = Router();

router.get('/', getUsers);
router.post('/', validate(CreateUserSchema), createUser);

export default router;
