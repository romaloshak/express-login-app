import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import type { QueryResult } from 'pg';
import pool from '../../db.js';
import type { TypedRequestBody } from '../../types/express.js';
import type { CreateUserInput, User } from '../../types/User.type.js';
import * as UserService from '../services/user.service.js';

export const getUsers = async (_: Request, res: Response) => {
	try {
		const result: QueryResult<User> = await pool.query('SELECT * FROM users');
		res.json(result.rows);
	} catch (_err) {
		res.status(500).send('Ошибка сервера');
	}
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
