import { z } from 'zod';

export const LoginUserSchema = z.object({
	email: z.email('Некорректный email'),
	password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

export const CreateUserSchema = z.object({
	username: z.string().min(2, 'Имя слишком короткое'),
	email: z.email('Некорректный email'),
	password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

export const UserSchema = z.object({
	id: z.string(),
	username: z.string(),
	email: z.email(),
	created_at: z.date(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type LoginUserInput = z.infer<typeof LoginUserSchema>;
export type UserType = z.infer<typeof UserSchema>;
