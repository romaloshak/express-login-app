import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import type { TypedRequestBody } from '../../types/express.js';
import type { CreateUserInput, UserType } from '../../types/User.type.js';
import type { AuthRequest } from '../middelwares/auth.middleware.js';
import * as UserService from '../services/user.service.js';

export const getUsers = async (_: Request, res: Response) => {
	const users: UserType[] = await UserService.getUsersFromDb();
	res.status(200).json(users);
};

export const createUser = async (req: TypedRequestBody<CreateUserInput>, res: Response) => {
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(req.body.password, salt);

	const newUser = await UserService.createUserInDb({
		...req.body,
		password: hashedPassword,
	});

	res.status(201).json(newUser);
};

export const getProfile = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.user?.userId;

		if (!userId) {
			return res.status(404).json({ message: 'userId error' });
		}

		const result: UserType = await UserService.findUserById(userId);

		if (!result) {
			return res.status(404).json({ message: 'Пользователь не найден' });
		}

		res.json(result);
	} catch (_error) {
		res.status(500).json({ message: 'Ошибка сервера' });
	}
};
