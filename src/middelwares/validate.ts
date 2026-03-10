import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { ZodError } from 'zod';

/**
 * Returns a function to validate request against Zod-defined schema
 * @param schema - Zod-defined schema
 * @returns A middleware handler to validate requests
 */

export const validate = (schema: ZodType) => async (req: Request, res: Response, next: NextFunction) => {
	try {
		await schema.parseAsync({
			body: req.body,
			query: req.query,
			params: req.params,
		});
		next();
	} catch (error) {
		if (error instanceof ZodError) {
			return res.status(400).json({
				success: false,
				errors: error.issues,
			});
		}
		next(error);
	}
};
