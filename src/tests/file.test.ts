import fs from 'node:fs';
import path from 'node:path';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import pool from '../../db.js';
import app from '../../server.js';

describe('Upload file Integration Tests', () => {
	const testImagePath = path.join(__dirname, 'fixtures/test-image.jpeg');

	const testUser = {
		email: 'file-test@example.com',
		password: 'Password123!',
		username: 'filetestuser',
	};

	const removeTestUser = async () => {
		await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
	};

	beforeAll(removeTestUser);

	afterAll(async () => {
		const uploadsDir = './uploads';
		if (fs.existsSync(uploadsDir)) {
			fs.readdirSync(uploadsDir).forEach((file) => {
				fs.unlinkSync(path.join(uploadsDir, file));
			});
		}

		await pool.query('DELETE FROM files WHERE original_name LIKE $1', ['test-%']);

		await removeTestUser();
		await pool.end();
	});

	it('returns 401 without token', async () => {
		const res = await request(app).post('/files/upload').attach('file', testImagePath);

		expect(res.status).toBe(401);
	});

	it('uploads file successfully', async () => {
		const registration_res = await request(app).post('/registration').send(testUser);

		expect(registration_res.status).toBe(201);

		const login_res = await request(app).post('/login').send({
			email: testUser.email,
			password: testUser.password,
		});

		expect(login_res.status).toBe(200);

		const accessToken = login_res.body.accessToken;

		const res = await request(app)
			.post('/files/upload')
			.set('Authorization', `Bearer ${accessToken}`)
			.attach('file', testImagePath);

		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty('id');

		const filePath = path.join('./uploads', res.body.stored_name);
		expect(fs.existsSync(filePath)).toBe(true);
	});
});
