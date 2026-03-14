import pool from '../../db.js';
import type { CreateUserInput } from '../types/User.type.js';

export const getUsersFromDb = async () => {
	const query = 'SELECT * FROM users';
	const result = await pool.query(query);
	return result.rows;
};

export const findUserByIdForRefreshToken = async (id: string) => {
	const query = 'SELECT id, refresh_token FROM users WHERE id = $1';
	const result = await pool.query(query, [id]);
	return result.rows[0];
};

export const findUserById = async (id: string) => {
	const query = 'SELECT id, username, email, created_at FROM users WHERE id = $1';
	const result = await pool.query(query, [id]);
	return result.rows[0];
};

export const findUserByEmailForLogin = async (email: string) => {
	const query = 'SELECT id, password FROM users WHERE email = $1';
	const result = await pool.query(query, [email]);
	return result.rows[0];
};

export const findUserByEmail = async (email: string) => {
	const query = 'SELECT id, username, email, created_at FROM users WHERE email = $1';
	const result = await pool.query(query, [email]);
	return result.rows[0];
};

export const createUserInDb = async (userData: CreateUserInput) => {
	const { username, email, password } = userData;

	const query = `
    INSERT INTO users (username, email, password) 
    VALUES ($1, $2, $3) 
    RETURNING id, username, email, created_at;
  `;

	const values = [username, email, password];
	const result = await pool.query(query, values);

	return result.rows[0];
};

export const updateRefreshToken = async (userId: number, refreshToken: string | null) => {
	const query = `
    UPDATE users 
    SET refresh_token = $1 
    WHERE id = $2
  `;

	await pool.query(query, [refreshToken, userId]);
};
