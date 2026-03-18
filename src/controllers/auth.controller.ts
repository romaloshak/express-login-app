import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import * as UserService from '../services/user.service.js';
import type { TypedRequestBody } from '../types/express.js';
import type { CreateUserInput } from '../types/User.type.js';
import { env } from '../utils/env.types.js';
import { generateTokens } from '../utils/jwt.js';

export const registration = async (req: TypedRequestBody<CreateUserInput>, res: Response) => {
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(req.body.password, salt);

	const newUser = await UserService.createUserInDb({
		...req.body,
		password: hashedPassword,
	});

	res.status(201).json(newUser);
};

export const login = async (req: Request, res: Response) => {
	const { email, password } = req.body;
	const user = await UserService.findUserByEmailForLogin(email);
	const isPasswordValid = await bcrypt.compare(password, user.password);

	if (!user || !isPasswordValid) {
		return res.status(401).json({ message: 'Ошибка авторизации' });
	}

	const { accessToken, refreshToken } = generateTokens({ userId: user.id });

	await UserService.updateRefreshToken(user.id, refreshToken);

	res.cookie('refreshToken', refreshToken, {
		httpOnly: true,
		secure: true,
		maxAge: 3 * 24 * 60 * 60 * 1000,
	});

	res.status(200).json({ accessToken, user: { id: user.id, email: user.email } });
};

export const refresh = async (req: Request, res: Response) => {
	const { refreshToken: refreshTokenCookie } = req.cookies;

	if (!refreshTokenCookie) return res.sendStatus(401);

	try {
		const payload = jwt.verify(refreshTokenCookie, env.JWT_REFRESH_SECRET) as { userId: string };

		const user = await UserService.findUserByIdForRefreshToken(payload.userId);

		if (!user || user.refresh_token !== refreshTokenCookie) {
			return res.sendStatus(403);
		}

		const { refreshToken, accessToken } = generateTokens({ userId: user.id });
		await UserService.updateRefreshToken(user.id, refreshToken);

		res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
		res.json({ accessToken });
	} catch (_error) {
		res.sendStatus(403);
	}
};

export const logout = async (req: Request, res: Response) => {
	try {
		const { refreshToken } = req.cookies;

		if (refreshToken) {
			const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: number };
			await UserService.updateRefreshToken(payload.userId, null);
		}

		res.clearCookie('refreshToken', {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
		});

		res.status(200).json({ message: 'Успешный выход' });
	} catch (_error) {
		res.status(500).json({ message: 'Ошибка при выходе' });
	}
};
