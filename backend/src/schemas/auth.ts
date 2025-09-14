import { z } from "zod";

export const RegisterSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export const LoginSchema = RegisterSchema;

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
