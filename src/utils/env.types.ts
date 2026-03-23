import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
	JWT_ACCESS_SECRET: z.string().min(32, 'Секрет слишком короткий!'),
	JWT_REFRESH_SECRET: z.string().min(32),
	POSTGRES_HOST: z.string(),
	POSTGRES_USER: z.string(),
	POSTGRES_DB: z.string(),
	POSTGRES_PASSWORD: z.string(),
	UPLOAD_DIR: z.string().default('./uploads'),
	MAX_FILE_SIZE: z.coerce
		.number()
		.positive()
		.default(20 * 1024 * 1024),
	DATABASE_URL: z.string().optional(),
	UPLOAD_PORT: z.string().default('3000'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
	const errorTree = z.treeifyError(parsed.error);
	console.error(JSON.stringify(errorTree, null, 2));
	process.exit(1);
}

export const env = parsed.data;
