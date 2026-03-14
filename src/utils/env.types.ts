import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
	JWT_ACCESS_SECRET: z.string().min(32, 'Секрет слишком короткий!'),
	JWT_REFRESH_SECRET: z.string().min(32),
	DB_HOST: z.string(),
	DB_NAME: z.string(),
	DB_DATABASE: z.string(),
	DB_PASSWORD: z.string(),
	PORT: z.string().default('3000').transform(Number),
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
	const errorTree = z.treeifyError(parsed.error);
	console.error(JSON.stringify(errorTree, null, 2));
	process.exit(1);
}

export const env = parsed.data;
