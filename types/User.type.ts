import {z} from "zod";

export type User = {
  id: string;
  username: string,
  email: string,
  created_at: Date,
}

export const CreateUserSchema = z.object({
  username: z.string().min(2, "Имя слишком короткое"),
  email: z.email("Некорректный email"),
  password: z.string().min(6, "Пароль должен быть не менее 6 символов")
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;