import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { validateMiddleware } from '../middelwares/validate.middleware.js';

describe('validateMiddleware', () => {
	it('вызывает next() при валидном body', async () => {
		const schema = z.object({ name: z.string() });
		const req = { body: { name: 'test' } } as Request;
		const res = {} as Response;
		const next = vi.fn();

		const middleware = validateMiddleware(schema);
		await middleware(req, res, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect(next).toHaveBeenCalledWith();
	});

	it('возвращает 400 и { success: false, errors } при ZodError', async () => {
		const schema = z.object({ name: z.string() });
		const req = { body: { name: 123 } } as Request;
		const res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
		} as unknown as Response;
		const next = vi.fn();

		const middleware = validateMiddleware(schema);
		await middleware(req, res, next);

		expect(next).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				errors: expect.any(Array),
			}),
		);
	});
});
