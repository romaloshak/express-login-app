import type { Request, Response } from 'express';
import type { AuthRequest } from '../middelwares/auth.middleware.js';
import * as UserService from '../services/user.service.js';
import type { UserType } from '../types/User.type.js';

export const getUsers = async (_: Request, res: Response) => {
	const users: UserType[] = await UserService.getUsersFromDb();
	res.status(200).json(users);
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
