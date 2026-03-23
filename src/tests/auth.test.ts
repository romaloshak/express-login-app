import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import pool from '../../db.js';
import app from "../../server.js";

describe('Auth Integration Tests', () => {
	const testUser = {
		email: 'auth-test@example.com',
		password: 'Password123!',
		username: 'authtestuser',
	};

	const removeTestUser = async () => {
		await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
	};

	beforeAll(removeTestUser);

	afterAll(async () => {
		await removeTestUser();
		await pool.end();
	});

	it('should register a new user successfully', async () => {
		const res = await request(app).post('/registration').send(testUser);

		expect(res.status).toBe(201);
		expect(res.body).toHaveProperty('id');
		expect(res.body.email).toBe(testUser.email);
	});

	it('should login and return access token + set refresh cookie', async () => {
		const res = await request(app).post('/login').send({
			email: testUser.email,
			password: testUser.password,
		});

		expect(res.status).toBe(200);

		expect(res.body).toHaveProperty('accessToken');

		const cookies = res.headers['set-cookie'] as unknown as string[];
		expect(cookies).toBeDefined();

		const hasRefreshCookie = cookies?.some((c: string) => c.includes('refreshToken') && c.includes('HttpOnly'));
		expect(hasRefreshCookie).toBe(true);
	});

	it('should not login with wrong password', async () => {
		const res = await request(app).post('/login').send({
			email: testUser.email,
			password: 'wrongpassword',
		});

		expect(res.status).toBe(401);
		expect(res.body).not.toHaveProperty('accessToken');
	});

	it('should login and get user profile', async () => {
		const res = await request(app).post('/login').send({
			email: testUser.email,
			password: testUser.password,
		});

		const accessToken = res.body.accessToken;

		expect(res.status).toBe(200);

		const profile_res = await request(app).get('/profile').send().set('Authorization', `Bearer ${accessToken}`);

		expect(profile_res.status).toBe(200);
	});
});
