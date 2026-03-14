import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../utils/env.types.js';

export type AuthRequest = Request & {
	user?: {
		userId: string;
		email: string;
	};
};

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;
	const token = authHeader?.split(' ')[1];

	if (!authHeader?.startsWith('Bearer ') || !token) {
		return res.status(401).json({ message: 'Пользователь не авторизован' });
	}

	try {
		const decodeToken = jwt.verify(token, env.JWT_ACCESS_SECRET) as unknown as { userId: string; email: string };
		req.user = decodeToken;

		next();
	} catch (_error) {
		return res.status(403).json({ message: 'Токен невалиден или просрочен' });
	}
};
