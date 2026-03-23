import jwt from 'jsonwebtoken';
import { env } from './env.types.js';

export const generateTokens = (payload: object) => {
	const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
	const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '3d' });
	return { accessToken, refreshToken };
};
